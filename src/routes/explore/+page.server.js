import { parsePubkey } from '$lib/nostr.js';
import { HEXKEY_REGEXP, NPUB_REGEXP } from '$lib/string.js';
import { ranker } from '$lib/open-ranking.js';

export const actions = {
  recommend: async ({ request }) => {
    try {
      const data = await request.formData();
      const input = data.get('pubkey') || '';

      const pubkey = parsePubkey(input);
      if (!pubkey) {
        return { error: 'Please enter a valid npub or hex pubkey' };
      }

      const r = {
        algorithm: 'personalized-pagerank',
        pov: pubkey,
        limit: 50,
      };

      const response = await ranker.recommendPubkeys(r);
      console.log('recommendPubkeys result:', JSON.stringify(response, null, 2));

      return { ok: true };
    } catch (err) {
      console.error('Explore error:', err);
      return { error: err.message || err.toString() };
    }
  }
};
