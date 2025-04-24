import { relay, query } from "$lib/relay.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, json } from '@sveltejs/kit';
import { formatProfile, HEXKEY_REGEXP, NIP05_REGEXP, resolveNIP05 } from "$lib/utils";
import { redirect } from "@sveltejs/kit";
import { finalizeEvent} from 'nostr-tools';

export async function load({ params }) {
  if (HEXKEY_REGEXP.test(params.npub)) {
    return redirect(301, `/${nip19.npubEncode(params.npub)}`);
  }

  if (NIP05_REGEXP.test(params.npub)) {
    const npub = await resolveNIP05(params.npub);
    return redirect(301, `/${npub}`);
  }

  let publicKey;
  try {
    let { type, data } = nip19.decode(params.npub);
    if (type !== 'npub') {
      throw error(400, 'Bad URL');
    }
    publicKey = data;

  } catch (e) {
    throw error(400, `Invalid npub: ${e} ${params.npub}`);
  }

  // Verify reputation
  const nsec = process.env.SK;
  const dvmReqEvent = {
    created_at: Math.floor(Date.now() / 1000),
    kind: 5312,
    tags: [
      ["param", "target", publicKey],
      ["param", "limit", "6"],
    ],
    content:''
  };

  const signedDvmReqEvent = finalizeEvent(dvmReqEvent, nsec);
  await relay.publish(signedDvmReqEvent);

  const reputationResponse = await query({
    kinds: [6312, 7000],
    '#e': [signedDvmReqEvent.id]
  });

  let profileResponse
  switch (reputationResponse[0].kind) {
    case 6312:
      const reputationResults = JSON.parse(reputationResponse[0].content);
      const pubkeys = reputationResults.map((e) => e.pubkey);

      profileResponse = await query({ kinds: [0], authors: pubkeys });
      const author = profileResponse.find((e) => e.pubkey == publicKey);
      if (!author) return {};

      const profile = await formatProfile(author, reputationResults[0]);
      profile.reputable = await Promise.all(
        pubkeys
          .slice(1)
          .map(pk => profileResponse.find(e => e.pubkey === pk))
          .filter(Boolean)
          .map(e => formatProfile(e, null, true))
      );

      return profile;
      break;
    
    case 7000:
      return { error: reputationResponse[0].tags.find(t => t[0] == 'status')[2] };
      break;
  
    default:
      // unexpected kind
      profileResponse = await query({ kinds: [0], authors: [publicKey] });
      return await formatProfile(profileResponse[0]);
      break;
  }
}
