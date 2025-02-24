import { relay, query } from "$lib/relay.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, json } from '@sveltejs/kit';
import { formatProfile, } from "$lib/utils";

export async function load({ params }) {
  let publicKey;
  try {
    let { type, data } = nip19.decode(params.npub);
    if (type !== 'npub') {
      throw error(400, 'Bad URL');
    }
    publicKey = data;
  } catch (e) {
    throw error(400, `Invalid npub: ${params.npub}`);
  }

  // Verify reputation

  const reputationResponse = await query({
    kinds: [6312, 7000], search: JSON.stringify({ targets: [publicKey], limit: 6 })
  });

  if (reputationResponse[0].kind === 6312) {
    const results = JSON.parse(reputationResponse[0].content);
    const reputablePubkeys = results.map((e) => e.pubkey);

    const authorResponse = await query({ kinds: [0], authors: [publicKey, ...reputablePubkeys] });
    const author = authorResponse.find((e) => e.pubkey == publicKey);
    if (!author) {
      return {};
    }
    const profile = await formatProfile(author);
    const reputableProfiles = await Promise.all(authorResponse.filter((e) => e.pubkey !== publicKey).map(formatProfile));
    profile.reputable = reputableProfiles.sort((a, b) => results.find(e => e.pubkey == nip19.decode(b.npub).data).rank - results.find(e => e.pubkey == nip19.decode(a.npub).data).rank);
    return profile;
  } else {
    const authorResponse = await query({ kinds: [0], authors: [publicKey] });
    return await formatProfile(authorResponse[0]);
  }
}
