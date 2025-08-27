import { relay, query, dvm } from "$lib/nostr.js";
import { resolveNIP05, HEXKEY_REGEXP, NIP05_REGEXP } from "$lib/string.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, redirect } from '@sveltejs/kit';
import { reputationInfos, minimalProfile, detailedProfile, getPubkeys, fetchMinimalProfiles } from "$lib/profile";

export async function load({ params }) {
  let npub = params.npub;
  if (HEXKEY_REGEXP.test(npub)) {
    try {
      npub = nip19.npubEncode(npub);
    } catch(err) {
      throw error(400, err.message || err.toString());
    }

    return redirect(301, `/${npub}`);
  }

  if (NIP05_REGEXP.test(npub)) {
    try {
      npub = await resolveNIP05(npub);
    } catch(err) {
        throw error(400, err.message || err.toString());
    }

    return redirect(301, `/${npub}`);
  }

  try {
    const pubkey = decodeNpub(npub);

    const verifyReputation = {
      kind: 5312,
      tags: [
        ["param", "target", pubkey],
        ["param", "limit", "10"],
      ],
    };

    const response = await dvm(verifyReputation);
    const reputations = reputationInfos(response);
    const pubkeys = reputations.map((e) => e.pubkey);

    let profileEvents = await query({
      kinds: [0], 
      authors: pubkeys, 
      limit: pubkeys.length
    });

    profileEvents = new Map(profileEvents.map(evt => [evt.pubkey, evt]));

    const profile = await detailedProfile(
      profileEvents.get(pubkey), 
      reputations[0]
    );

    if (!profile) {
      throw error(404, 'Profile not found');
    }

    const topFollowers = await Promise.all(
      pubkeys
        .slice(1)
        .map(pk => { return minimalProfile(profileEvents.get(pk)); })
    );

    profile.topFollowers = topFollowers.filter(Boolean);
    return profile;

  } catch(err) {
    if (err.status) throw err;
    console.error('Internal profile load error:', err);
    throw error(500, err.message || err.toString());
  }
}

function decodeNpub(npub) {
  try {
    const { type, data } = nip19.decode(npub);
    if (type !== 'npub') throw error(400, 'Bad URL');
    return data;

  } catch (err) {
    throw error(400, `Invalid npub: ${err} ${npub}`);
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

      const verifyReputation = {
      kind: 5312,
      tags: [
        ["param", "target", pubkey],
        ["param", "limit", limit.toString()],
        ],
      };

      const response = await dvm(verifyReputation);
      const pubkeys = getPubkeys(response).slice(1);

      return await fetchMinimalProfiles(pubkeys);

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

      const pubkeys = followList[0].tags
        .filter(tag => tag.length >= 2 && tag[0] === "p")
        .map(tag => tag[1]);

      if (pubkeys.length === 0) return [];

      const rankProfiles = {
        kind: 5314,
        tags: [["param", "limit", limit.toString()]],
      };

      for (const pk of pubkeys) {
        rankProfiles.tags.push(["param", "target", pk]);
      }

      const response = await dvm(rankProfiles);
      const rankedPubkeys = getPubkeys(response);
      
      return await fetchMinimalProfiles(rankedPubkeys);

    } catch(err) {
      console.error('Internal follows action error:', err);
      return { error: err.message || err.toString() };
    }
  }
}
