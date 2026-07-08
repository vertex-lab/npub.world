import { parsePubkey } from '$lib/nostr.js';
import { query, parseProfile } from '$lib/nostr.js';
import { imager, highResolution } from '$lib/image.js';
import { ranker } from '$lib/open-ranking.js';

async function fetchProfiles(pubkeys) {
  const events = await query({ kinds: [0], authors: pubkeys, limit: pubkeys.length });
  const byPubkey = new Map(events.map(e => [e.pubkey, e]));

  return (await Promise.all(pubkeys.map(async pk => {
    const p = parseProfile(byPubkey.get(pk));
    if (!p) return null;
    return {
      npub: p.npub,
      name: p.name,
      picture: await imager.load(p.pictureURL, highResolution),
      pictureURL: p.pictureURL,
      nip05: p.nip05,
      about: p.about,
    };
  }))).filter(Boolean);
}

export async function load() {
  const algorithms = ranker.capabilities?.['/recommend/pubkeys'] ?? [];
  const response = await ranker.recommendPubkeys({ limit: 50 });
  const pubkeys = response.results.map(r => r.pubkey);
  const profiles = await fetchProfiles(pubkeys);
  return { profiles, algorithms };
}

export const actions = {
  recommend: async ({ request }) => {
    try {
      const data = await request.formData();
      const algorithm = data.get('algorithm') || '';
      const input = data.get('pubkey') || '';

      const r = { limit: 50 };
      if (algorithm) {
        r.algorithm = algorithm;
      }

      if (input) {
        const pubkey = parsePubkey(input);
        if (!pubkey) return { error: 'Please enter a valid npub or hex pubkey' };
        r.pov = pubkey;
      }

      const response = await ranker.recommendPubkeys(r);
      const pubkeys = response.results.map(r => r.pubkey);
      const profiles = await fetchProfiles(pubkeys);
      return { profiles };

    } catch (err) {
      console.error('Explore error:', err);
      return { error: err.message || err.toString() };
    }
  }
};
