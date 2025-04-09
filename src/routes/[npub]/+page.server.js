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

  if (reputationResponse[0].kind === 6312) {
    const reputationResults = JSON.parse(reputationResponse[0].content);

    const reputablePubkeys = reputationResults.map((e) => e.pubkey);

    const authorResponse = await query({ kinds: [0], authors: [publicKey, ...reputablePubkeys] });
    const author = authorResponse.find((e) => e.pubkey == publicKey);
    const authorReputationInfo = reputationResults.find((e) => e.pubkey == publicKey);

    if (!author) {
      return {};
    }
    const profile = await formatProfile(author, authorReputationInfo);
    const reputableProfiles = await Promise.all(authorResponse.filter((e) => e.pubkey !== publicKey).map((p) => formatProfile(p, null, true)));
    profile.reputable = reputableProfiles.sort((a, b) => reputationResults.find(e => e.pubkey == nip19.decode(b.npub).data).rank - reputationResults.find(e => e.pubkey == nip19.decode(a.npub).data).rank);
    return profile;
  } else if (reputationResponse[0].kind === 7000) {
    return { error: reputationResponse[0].tags.find(t => t[0] == 'status')[2] };
  } else {
    const authorResponse = await query({ kinds: [0], authors: [publicKey] });
    return await formatProfile(authorResponse[0]);
  }
}
