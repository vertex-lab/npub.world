import { error } from '@sveltejs/kit';

import { query, dvm } from '$lib/nostr.js';
import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { getPubkeys, fetchMinimalProfiles } from '$lib/profile';
import { newDataset, formatDate } from '$lib/charts';
import { stats } from '$lib/stats.server';

export async function load({ params }) {
  const lastStats = stats.length > 10 ? stats.slice(-10) : stats;
  const users = [ newDataset("total"), newDataset("active"), newDataset("posters") ];
  const events = [ newDataset("profiles"), newDataset("posts"), newDataset("follows") ];

  for (const stat of lastStats) {
    const date = formatDate(stat.date);

    users[0].points.push({x: date, y: stat["total_pubkeys"] || 0 });
    users[1].points.push({x: date, y: stat["active_pubkeys"] || 0 });
    users[2].points.push({x: date, y: stat["creator_pubkeys"] || 0 });

    events[0].points.push({x: date, y: stat["kind:0"] || 0 });
    events[1].points.push({x: date, y: stat["kind:1"] || 0 });
    events[2].points.push({x: date, y: stat["kind:3"] || 0 });
  }

  return {users, events}
}

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

      const searchProfiles = {
        kind: 5315,
        tags: [
          ['param', 'search', q],
          ['param', 'limit', limit.toString()]
        ]
      };

      const response = await dvm(searchProfiles);
      const results = getPubkeys(response);   
      return await fetchMinimalProfiles(results);

    } catch (err) {
      console.error('Internal search error:', err);
      return { error: err.message || err.toString() };
    }
  }
};
