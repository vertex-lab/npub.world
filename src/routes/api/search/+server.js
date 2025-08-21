import { query, dvm } from "$lib/nostr.js";
import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from "$lib/string.js";
import { reputationInfos, minimalProfile } from "$lib/profile";
import * as nip19 from 'nostr-tools/nip19';
import { finalizeEvent } from 'nostr-tools';
import { redirect, error, json } from "@sveltejs/kit";

/**
 * Parse and validate `q` and `limit` from URLSearchParams.
 * @param {URLSearchParams} params
 * @returns {{ q: string, limit: number }}
 */
function parse(params) {
  const q = (params.get('q') || '').trim();
  if (!q || q.length < 3) {
    throw error(400, 'Please input at least 3 characters');
  }

  let limit = parseInt(params.get('limit'), 10);
  if (isNaN(limit) || limit <= 0) {
    throw error(400, 'Limit must be a positive number');
  }

  limit = Math.min(limit, 100); // max is 100
  return { q, limit };
}

export async function GET({ url }) {
  try {
    const { q, limit } = parse(url.searchParams)

    if (HEXKEY_REGEXP.test(q) || NPUB_REGEXP.test(q) || NIP05_REGEXP.test(q)) {
      return json({ redirect: q });
    }

    const searchProfiles = {
      kind: 5315,
      tags: [
        ["param", "search", q],
        ["param", "limit", limit.toString()],
      ],
    };

    const response = await dvm(searchProfiles)
    const reputations = reputationInfos(response);
    const pubkeys = reputations.map((e) => e.pubkey);

    let profileEvents = await query({
      kinds: [0], 
      authors: pubkeys,
      limit: pubkeys.length
    });

    profileEvents = new Map(profileEvents.map(evt => [evt.pubkey, evt]));
    const profiles = await Promise.all(
      reputations
      .map(rep => {
        const evt = profileEvents.get(rep.pubkey);
        return minimalProfile(evt, rep)
      })
      .filter(Boolean)
    );
    
    return json(profiles);
    
  } catch (err) {
    if (!err.status || err.status !== 400 ) {
      console.error('API /search error:', err);
    }

    return json( 
      { error: err.body?.message || err.message || err.toString() },
      { status: err.status || 400 }
    );
  }
}