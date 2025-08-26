import { relay, query, dvm } from "$lib/nostr.js";
import { resolveNIP05, HEXKEY_REGEXP, NIP05_REGEXP } from "$lib/string.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, redirect } from '@sveltejs/kit';
import { reputationInfos, minimalProfile, detailedProfile } from "$lib/profile";

let targetKey;  // the hex public key of the profile

export async function load({ params }) {
  if (HEXKEY_REGEXP.test(params.npub)) {
    return redirect(301, `/${nip19.npubEncode(params.npub)}`);
  }

  if (NIP05_REGEXP.test(params.npub)) {
    const npub = await resolveNIP05(params.npub);
    return redirect(301, `/${npub}`);
  }

  targetKey = decodeNpub(params.npub);

  const verifyReputation = {
    kind: 5312,
    tags: [
      ["param", "target", targetKey],
      ["param", "limit", "10"],
    ],
  };

  let response;
  try {
    response = await dvm(verifyReputation);
  } catch(err) {
    console.log("verify reputation failed: ", err)
    throw error(500, err)
  }

  const reputations = reputationInfos(response);
  const pubkeys = reputations.map((e) => e.pubkey);

  let profileEvents = await query({
    kinds: [0], 
    authors: pubkeys, 
    limit: pubkeys.length
  });

  profileEvents = new Map(profileEvents.map(evt => [evt.pubkey, evt]));

  const profile = await detailedProfile(
    profileEvents.get(targetKey), 
    reputations[0]
  );

  const topFollowers = await Promise.all(
    reputations
      .slice(1)
      .map(rep => {
        const evt = profileEvents.get(rep.pubkey);
        return minimalProfile(evt, rep)
      })
  );

  profile.topFollowers = topFollowers.filter(Boolean);
  return profile;
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
 * Parse and validate `limit` from URLSearchParams.
 * @param {URLSearchParams} params
 * @returns {{ limit: number }}
 */
function parseLimit(params) {
  let limit = parseInt(params.get('limit') ?? '100', 10);
  if (isNaN(limit) || limit <= 0) {
    return { error: 'Limit must be a positive number' };
  }

  limit = Math.min(limit, 100); // max is 100
  return { limit };
}

export const actions = {
  followers: async ({ request }) => {
    try {
      const params = await request.formData();
      const { limit, error } = parseLimit(params);
      if (error) return { error }

      const verifyReputation = {
      kind: 5312,
      tags: [
        ["param", "target", targetKey],
        ["param", "limit", limit.toString()],
        ],
      };

      const response = await dvm(verifyReputation);
      const reputations = reputationInfos(response).slice(1);
      const pubkeys = reputations.map((e) => e.pubkey);

      let profileEvents = await query({
        kinds: [0], 
        authors: pubkeys, 
        limit: pubkeys.length
      });

      profileEvents = new Map(profileEvents.map(evt => [evt.pubkey, evt]));

      let followers = await Promise.all(
        reputations
          .map((rep) => {
            const evt = profileEvents.get(rep.pubkey);
            return minimalProfile(evt, rep)
          })
      );

      return followers.filter(Boolean);

    } catch(err) {
      console.error('Internal followers action error:', err);
      throw error(500, err)
    }
  }
}
