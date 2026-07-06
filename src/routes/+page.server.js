import { error } from '@sveltejs/kit';

import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { fetchMinimalProfiles } from '$lib/profile';
import { openRanking } from '$lib/open-ranking.js';

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

export const actions = {
  search: async ({ request }) => {
    try {
      const params = await request.formData();
      const { q, limit, error } = parse(params);
      if (error) return { error };

      const response = await openRanking.searchPubkeys({ query: q, limit: limit });
      const results = response.results.map(r => r.pubkey);
      return await fetchMinimalProfiles(results);

    } catch (err) {
      console.error('Internal search error:', err);
      return { error: err.message || err.toString() };
    }
  }
};
