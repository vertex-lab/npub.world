import { error } from '@sveltejs/kit';

import { query, dvm } from '$lib/nostr.js';
import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { getPubkeys, fetchMinimalProfiles } from '$lib/profile';
import { newDataset, formatDate } from '$lib/charts';
import { stats, contentKinds, engagementKinds, profileKinds } from '$lib/stats.server';

export async function load() {
  const users = [ newDataset("total"), newDataset("active"), newDataset("posters") ];
  const contentEvents = contentKinds.map(k => newDataset(`kind ${k}`));
  const engagementEvents = engagementKinds.map(k => newDataset(`kind ${k}`));
  const profileEvents = profileKinds.map(k => newDataset(`kind ${k}`));

  for (const stat of stats) {    
    users[0].points.push({x: String(stat.date), y: stat["total_pubkeys"] || 0 });
    users[1].points.push({x: String(stat.date), y: stat["active_pubkeys"] || 0 });
    users[2].points.push({x: String(stat.date), y: stat["creator_pubkeys"] || 0 });

    for (const [i, kind] of contentKinds.entries()) {
      contentEvents[i].points.push({ x: String(stat.date), y: stat[`kind:${kind}`] || 0 });
    }

    for (const [i, kind] of engagementKinds.entries()) {
      engagementEvents[i].points.push({ x: String(stat.date), y: stat[`kind:${kind}`] || 0 });
    }

    for (const [i, kind] of profileKinds.entries()) {
      profileEvents[i].points.push({ x: String(stat.date), y: stat[`kind:${kind}`] || 0 });
    }
  }

  return { users, contentEvents, engagementEvents, profileEvents }
}
