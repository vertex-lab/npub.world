import { error } from '@sveltejs/kit';

import { query, dvm } from '$lib/nostr.js';
import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { getPubkeys, fetchMinimalProfiles } from '$lib/profile';
import { newDataset, formatDate } from '$lib/charts';
import { stats, kinds } from '$lib/stats.server';

export async function load() {
  const users = [ newDataset("total"), newDataset("active"), newDataset("posters") ];
  const events = kinds.map(k => newDataset(`kind ${k}`));

  for (const stat of stats) {    
    users[0].points.push({x: String(stat.date), y: stat["total_pubkeys"] || 0 });
    users[1].points.push({x: String(stat.date), y: stat["active_pubkeys"] || 0 });
    users[2].points.push({x: String(stat.date), y: stat["creator_pubkeys"] || 0 });

    for (const [i, kind] of kinds.entries()) {
      events[i].points.push({ x: String(stat.date), y: stat[`kind:${kind}`] || 0 });
    }
  }

  return { users, events }
}
