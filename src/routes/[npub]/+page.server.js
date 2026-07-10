import { query, parseProfile, parsePubkeys, resolveNIP05 } from "$lib/nostr.js";
import { normalizeMentions, normalizeURL, HEXKEY_REGEXP, NIP05_REGEXP } from "$lib/string.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, redirect } from '@sveltejs/kit';
import { ENDPOINT_FOLLOWERS, ENDPOINT_COMPROMISED_PUBKEYS } from 'open-ranking';

import { imager, lowResolution, highResolution } from "$lib/image.js";
import { ranker } from '$lib/open-ranking.js';
import { marked } from 'marked';

export async function load({ params, locals }) {
  const { provider, capabilities } = locals;
  const pubkey = await resolve(params.npub);

  const supportsFollowers   = capabilities?.[ENDPOINT_FOLLOWERS]?.length > 0;
  const supportsCompromised = capabilities?.[ENDPOINT_COMPROMISED_PUBKEYS]?.length > 0;

  try {
    const [stats, followersResponse] = await Promise.all([
      ranker.statsPubkey(provider, { pubkey }),
      supportsFollowers ? ranker.followers(provider, { pubkey, limit: 10 }) : null,
    ]);

    const followersPubkeys = followersResponse?.results.map(r => r.pubkey) ?? [];

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
          picture: await imager.load(p.pictureURL, lowResolution),
          pictureURL: p.picture,
          nip05: p.nip05,
        };
      })
    )).filter(Boolean);

    let compromise = null;
    if (supportsCompromised && stats.rank == 0) {
      const result = await ranker.compromisedPubkeys(provider, { pubkeys: [pubkey] });
      compromise = result[pubkey] ?? null;
    }

    return {
      npub:       info.npub,
      name:       info.name,
      picture:    await imager.load(info.pictureURL, highResolution),
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

function parseLimit(formData) {
  const limit = Math.min(parseInt(formData.get('limit') ?? '100', 10), 100);
  if (isNaN(limit) || limit <= 0) return { error: 'Limit must be a positive number' };
  return { limit };
}


async function fetchProfiles(pubkeys) {
  if (!pubkeys.length) return [];
  let events = await query({
      kinds: [0],
      authors: pubkeys,
      limit: pubkeys.length,
    });
  events = new Map(events.map(e => [e.pubkey, e]));

  return (await Promise.all(pubkeys.map(async pk => {
    const p = parseProfile(events.get(pk));
    if (!p) return null;
    return {
      npub: p.npub,
      name: p.name,
      picture: await imager.load(p.pictureURL, lowResolution),
      nip05: p.nip05,
    };
  }))).filter(Boolean);
}

export const actions = {
  followers: async ({ request, locals, params }) => {
    const { provider } = locals;
    try {
      const { type, data: pubkey } = nip19.decode(params.npub);
      if (type !== 'npub') return { error: 'Invalid npub' };

      const { limit, error } = parseLimit(await request.formData());
      if (error) return { error };

      const response = await ranker.followers(provider, { pubkey, limit });
      return await fetchProfiles(response.results.map(r => r.pubkey));

    } catch(err) {
      console.error('Internal followers action error:', err);
      return { error: err.message || err.toString() };
    }
  },

  follows: async ({ request, locals, params }) => {
    const { provider } = locals;
    try {
      const { type, data: pubkey } = nip19.decode(params.npub);
      if (type !== 'npub') return { error: 'Invalid npub' };

      const { limit, error } = parseLimit(await request.formData());
      if (error) return { error };

      let followList = await query({
        kinds: [3],
        authors: [pubkey],
        limit: 1,
      });

      let pubkeys = parsePubkeys(followList[0]);
      if (pubkeys.length === 0) return [];
      if (pubkeys.length > 1000) pubkeys = pubkeys.slice(0, 1000);

      const response = await ranker.rankPubkeys(provider, { pubkeys, limit });
      return await fetchProfiles(response.results.map(r => r.pubkey));

    } catch(err) {
      console.error('Internal follows action error:', err);
      return { error: err.message || err.toString() };
    }
  }
}
