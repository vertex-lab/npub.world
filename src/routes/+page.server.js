import { error } from '@sveltejs/kit';

import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { query, parseProfile } from '$lib/nostr.js';
import { imager, lowResolution } from '$lib/image.js';
import { ranker } from '$lib/open-ranking.js';

/**
 * Parse and validate `q` and `limit` from URLSearchParams.
 * @param {URLSearchParams} params
 * @returns {{ q: string, limit: number }}
 */
function parse(params) {
  const q = (params.get('q') || '').trim();
  if (!q || q.length < 3) {
    return { error: 'Please input at least 3 characters' };
  }

  let limit = parseInt(params.get('limit') ?? '10', 10);
  if (isNaN(limit) || limit <= 0) {
    return { error: 'Limit must be a positive number' };
  }

  limit = Math.min(limit, 100); // max is 100
  return { q, limit };
}

export async function load() {
  const algorithms = ranker.capabilities?.['/search/pubkeys'] ?? [];
  return { algorithms };
}

export const actions = {
  search: async ({ request }) => {
    try {
      const params = await request.formData();
      const { q, limit, error } = parse(params);
      if (error) return { error };

      const response = await ranker.searchPubkeys({ query: q, limit });
      const pubkeys = response.results.map(r => r.pubkey);
      if (!pubkeys.length) return [];

      let events = await query(
        {
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

    } catch (err) {
      console.error('Internal search error:', err);
      return { error: err.message || err.toString() };
    }
  }
};
