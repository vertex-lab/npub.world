import { parsePubkey, query, parseProfile, parsePubkeys } from '$lib/nostr.js';
import { imager, highResolution } from '$lib/image.js';
import { ranker } from '$lib/open-ranking.js';

async function fetchMutedPubkeys(pubkey) {
  if (!pubkey) return new Set();
  const events = await query({ kinds: [10000], authors: [pubkey], limit: 1 });
  const muted = parsePubkeys(events[0]);
  return new Set(muted);
}

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

export async function load({ cookies, locals }) {
  let stored = {};
  try { stored = JSON.parse(decodeURIComponent(cookies.get('npub_world_settings') ?? '{}')); } catch {}

  const algorithm = stored?.algorithms?.['/recommend/pubkeys'] ?? '';
  const r = { limit: 100 };
  if (algorithm) r.algorithm = algorithm;

  const algoMeta = ranker.capabilities?.['/recommend/pubkeys']?.find(a => a.id === algorithm);
  if (algoMeta?.pov && locals.pubkey) r.pov = locals.pubkey;

  const [response, muted] = await Promise.all([
    ranker.recommendPubkeys(r),
    fetchMutedPubkeys(locals.pubkey),
  ]);

  const pubkeys = response.results.map(r => r.pubkey).filter(pk => !muted.has(pk));
  const profiles = await fetchProfiles(pubkeys);
  return { profiles };
}

export const actions = {
  recommend: async ({ request, locals }) => {
    try {
      const data = await request.formData();
      const algorithm = data.get('algorithm') || '';
      const input = data.get('pubkey') || '';

      const r = { limit: 100 };
      if (algorithm) r.algorithm = algorithm;

      const algoMeta = ranker.capabilities?.['/recommend/pubkeys']?.find(a => a.id === algorithm);
      if (algoMeta?.pov) {
        if (input) {
          const pubkey = parsePubkey(input);
          if (!pubkey) return { error: 'Please enter a valid npub or hex pubkey' };
          r.pov = pubkey;
        } else if (locals.pubkey) {
          r.pov = locals.pubkey;
        }
      }

      const [response, muted] = await Promise.all([
        ranker.recommendPubkeys(r),
        fetchMutedPubkeys(locals.pubkey),
      ]);

      const pubkeys = response.results.map(r => r.pubkey).filter(pk => !muted.has(pk));
      const profiles = await fetchProfiles(pubkeys);
      return { profiles };

    } catch (err) {
      console.error('Explore error:', err);
      return { error: err.message || err.toString() };
    }
  }
};
