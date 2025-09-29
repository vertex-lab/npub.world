import { error } from '@sveltejs/kit';

import { query, dvm } from '$lib/nostr.js';
import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { getPubkeys, fetchMinimalProfiles } from '$lib/profile';

export async function load({ params }) {
  const pubkeyStats = [
    {
      label: "total",
      points: [
        { x: "17 Sep", y: "370562" },
        { x: "18 Sep", y: "372100" },
        { x: "19 Sep", y: "374000" },
        { x: "20 Sep", y: "375800" },
        { x: "21 Sep", y: "377000" },
        { x: "22 Sep", y: "378500" },
        { x: "23 Sep", y: "379800" },
        { x: "24 Sep", y: "380562" }
      ]
    },
    {
      label: "active",
      points: [
        { x: "17 Sep", y: "40000" },
        { x: "18 Sep", y: "42000" },
        { x: "19 Sep", y: "46000" },
        { x: "20 Sep", y: "50000" },
        { x: "21 Sep", y: "58000" },
        { x: "22 Sep", y: "62000" },
        { x: "23 Sep", y: "67000" },
        { x: "24 Sep", y: "69000" }
      ]
    },
    {
      label: "creators",
      points: [
        { x: "17 Sep", y: "27000" },
        { x: "18 Sep", y: "28000" },
        { x: "19 Sep", y: "28500" },
        { x: "20 Sep", y: "29000" },
        { x: "21 Sep", y: "31000" },
        { x: "22 Sep", y: "32000" },
        { x: "23 Sep", y: "34000" },
        { x: "24 Sep", y: "35000" }
      ]
    }
  ];
  
  
  const eventStats = [
    {
      label: "kind 0",
      points: [
        { x: "17 Sep", y: "1000" },
        { x: "18 Sep", y: "1100" },
        { x: "19 Sep", y: "1150" },
        { x: "20 Sep", y: "1200" },
        { x: "21 Sep", y: "1320" },
        { x: "22 Sep", y: "1400" },
        { x: "23 Sep", y: "1500" },
        { x: "24 Sep", y: "1532" }
      ]
    },
    {
      label: "kind 1",
      points: [
        { x: "17 Sep", y: "15000" },
        { x: "18 Sep", y: "18500" },
        { x: "19 Sep", y: "20000" },
        { x: "20 Sep", y: "23900" },
        { x: "21 Sep", y: "21000" },
        { x: "22 Sep", y: "17500" },
        { x: "23 Sep", y: "14500" },
        { x: "24 Sep", y: "13870" }
      ]
    },
    {
      label: "kind 3",
      points: [
        { x: "17 Sep", y: "4000" },
        { x: "18 Sep", y: "4200" },
        { x: "19 Sep", y: "4500" },
        { x: "20 Sep", y: "4789" },
        { x: "21 Sep", y: "4400" },
        { x: "22 Sep", y: "4100" },
        { x: "23 Sep", y: "3900" },
        { x: "24 Sep", y: "3872" }
      ]
    },
  ];

  return {pubkeys: pubkeyStats, events: eventStats}
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
