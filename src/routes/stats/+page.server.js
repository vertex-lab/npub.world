import { error } from '@sveltejs/kit';

import { query, dvm } from '$lib/nostr.js';
import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { getPubkeys, fetchMinimalProfiles } from '$lib/profile';
import { newDataset, formatDate } from '$lib/charts';
import { stats, kinds } from '$lib/stats.server';

export async function load() {
  const pubkeys = [ newDataset("total"), newDataset("active"), newDataset("posters") ];
  const events = kinds.map(k => newDataset(`kind ${k}`));

  for (const stat of stats) {
    const date = formatDate(stat.date);
    
    pubkeys[0].points.push({x: date, y: stat["total_pubkeys"] || 0 });
    pubkeys[1].points.push({x: date, y: stat["active_pubkeys"] || 0 });
    pubkeys[2].points.push({x: date, y: stat["creator_pubkeys"] || 0 });

    for (const [i, kind] of kinds.entries()) {
      events[i].points.push({ x: date, y: stat[`kind:${kind}`] || 0 });
    }
  }

  return {pubkeys, events}
}
