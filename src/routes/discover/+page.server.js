import { query, parseProfile, parsePubkeys } from '$lib/nostr.js';
import { imager, highResolution } from '$lib/image.js';
import { ranker } from '$lib/open-ranking.js';
import { withForwarded } from 'open-ranking/options';

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

async function getRecommendations(locals) {
  const { provider, algorithms, capabilities } = locals;
  const algorithm = algorithms['/recommend/pubkeys'] ?? '';

  const supportedAlgos = capabilities?.['/recommend/pubkeys'] ?? [];
  if (supportedAlgos.length === 0) {
    return { unsupported: true, provider };
  }

  const r = { limit: 100 };
  if (algorithm) r.algorithm = algorithm;

  const algoMeta = supportedAlgos.find(a => a.id === algorithm);
  if (algoMeta?.pov && locals.pubkey) r.pov = locals.pubkey;

  const [response, muted] = await Promise.all([
    ranker.recommendPubkeys(provider, r, { options: [withForwarded(locals.clientIP)] }),
    fetchMutedPubkeys(locals.pubkey),
  ]);

  const pubkeys = response.results.map(r => r.pubkey).filter(pk => !muted.has(pk));
  return fetchProfiles(pubkeys);
}

export async function load({ locals }) {
  const result = await getRecommendations(locals);
  if (result.unsupported) return result;
  return { profiles: result };
}

export const actions = {
  recommend: async ({ locals }) => {
    try {
      const result = await getRecommendations(locals);
      if (result.unsupported) return result;
      return { profiles: result };
    } catch (err) {
      console.error('Explore error:', err);
      return { error: err.message || err.toString() };
    }
  }
};
