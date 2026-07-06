import { query, parseProfile } from "$lib/nostr.js";
import { resolveNIP05, normalizeMentions, normalizeURL, HEXKEY_REGEXP, NIP05_REGEXP } from "$lib/string.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, redirect } from '@sveltejs/kit';
import { fetchMinimalProfiles, loadImage, lowResolution, highResolution } from "$lib/profile";
import { openRanking } from "$lib/open-ranking.js";
import { marked } from 'marked';

export async function load({ params }) {
  const pubkey = await resolve(params.npub);

  try {
    const [stats, followers] = await Promise.all([
      openRanking.statsPubkey({ pubkey }),
      openRanking.followers({ pubkey, limit: 10 }),
    ]);

    const followersPubkeys = followers.results.map(r => r.pubkey);

    let profileEvents = await query({
      kinds: [0],
      authors: [pubkey, ...followersPubkeys],
      limit: 1 + followersPubkeys.length,
    });
    profileEvents = new Map(profileEvents.map(evt => [evt.pubkey, evt]));

    const info = parseProfile(profileEvents.get(pubkey));
    if (!info) throw error(404, 'Profile not found');

    const followerProfiles = (await Promise.all(
      followersPubkeys.map(async pk => {
        const p = parseProfile(profileEvents.get(pk));
        if (!p) return null;
        return {
          npub: p.npub,
          name: p.name,
          picture: await loadImage(p.pictureURL, lowResolution),
          pictureURL: p.picture,
          nip05: p.nip05,
        };
      })
    )).filter(Boolean);

    let compromise = null;
    if (stats.rank == 0) {
      const result = await openRanking.compromisedPubkeys({ pubkeys: [pubkey] });
      compromise = result[pubkey] ?? null;
    }

    return {
      npub:       info.npub,
      name:       info.name,
      picture:    await loadImage(info.pictureURL, highResolution),
      pictureURL: info.pictureURL,
      about:      info.about && marked(await normalizeMentions(info.about)),
      nip05:      info.nip05,
      lud16:      info.lud16,
      website:    normalizeURL(info.website),

      stats,
      followerProfiles,
      compromise,
    };

  } catch(err) {
    if (err.status) throw err;
    console.error('Internal profile load error:', err);
    throw error(500, err.message || err.toString());
  }
}

/**
 * Resolves an input identifier into a pubkey.
 *
 * Supports three input types:
 * 1. HEX pubkey: encodes it to npub and redirects.
 * 2. NIP-05: resolves it to a npub and redirects.
 * 3. npub: decodes it and returns the pubkey.
 *
 * Throws a 400 error if the input is invalid or cannot be resolved.
 *
 * @param {string} input - The input identifier (hex, npub, or NIP-05)
 * @returns {Promise<string|Response>} - Returns the raw pubkey, or a redirect Response for HEX/NIP-05 inputs.
 */
async function resolve(input) {
  if (HEXKEY_REGEXP.test(input)) {
    try {
      input = nip19.npubEncode(input);
    } catch(err) {
      throw error(400, err.message || err.toString());
    }

    return redirect(301, `/${input}`);
  }

  if (NIP05_REGEXP.test(input)) {
    try {
      input = await resolveNIP05(input);
    } catch(err) {
        throw error(400, err.message || err.toString());
    }

    return redirect(301, `/${input}`);
  }

  try {
    const { type, data } = nip19.decode(input);
    if (type !== 'npub') throw error(400, 'Invalid npub');
    return data;

  } catch (err) {
    throw error(400, err.message || err.toString());
  }
}

/**
 * Parse and validate `npub` and `limit` from URLSearchParams.
 * Returns an object with `pubkey` and `limit` or an `error` message.
 * @param {URLSearchParams} params
 * @returns {{ pubkey: string, limit: number }}
 */
function parse(params) {
  const npub = params.get('npub') ?? '';

  let pubkey;
  try {
    const { type, data } = nip19.decode(npub);
    if (type !== 'npub') return { error: 'Invalid npub' };
    pubkey = data;
  } catch(err) {
    return { error: 'Invalid npub' };
  }

  let limit = parseInt(params.get('limit') ?? '100', 10);
  if (isNaN(limit) || limit <= 0) {
    return { error: 'Limit must be a positive number' };
  }

  limit = Math.min(limit, 100); // max is 100
  return { pubkey, limit };
}

export const actions = {
  followers: async ({ request }) => {
    try {
      const params = await request.formData();
      const { pubkey, limit, error } = parse(params);
      if (error) return { error }

      const response = await openRanking.followers({ pubkey, limit });
      return await fetchMinimalProfiles(response.results.map(r => r.pubkey));

    } catch(err) {
      console.error('Internal followers action error:', err);
      return { error: err.message || err.toString() };
    }
  },

  follows: async ({ request }) => {
    try {
      const params = await request.formData();
      const { pubkey, limit, error } = parse(params);
      if (error) return { error }

      let followList = await query({
        kinds: [3],
        authors: [pubkey],
        limit: 1,
      });

      const pubkeys = [];
      for (const tag of followList[0]?.tags || []) {
        if (pubkeys.length >= 1000) break; // prevent dvm error "too many pubkeys"

        if (tag.length >= 2 && tag[0] === "p") {
          pubkeys.push(tag[1]);
        }
      }

      if (pubkeys.length === 0) return [];

      const response = await openRanking.rankPubkeys({ pubkeys, limit });
      return await fetchMinimalProfiles(response.results.map(r => r.pubkey));

    } catch(err) {
      console.error('Internal follows action error:', err);
      return { error: err.message || err.toString() };
    }
  }
}
