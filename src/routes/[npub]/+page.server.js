import { relay, query } from "$lib/relay.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, json } from '@sveltejs/kit';
import { reputationStatus, minimalProfile, detailedProfile, HEXKEY_REGEXP, NIP05_REGEXP } from "$lib/utils";
import { redirect } from "@sveltejs/kit";
import { finalizeEvent } from 'nostr-tools';

export async function load({ params }) {
  if (HEXKEY_REGEXP.test(params.npub)) {
    return redirect(301, `/${nip19.npubEncode(params.npub)}`);
  }

  if (NIP05_REGEXP.test(params.npub)) {
    const npub = await resolveNIP05(params.npub);
    return redirect(301, `/${npub}`);
  }

  let targetKey;
  try {
    let { type, data } = nip19.decode(params.npub);
    if (type !== 'npub') {
      throw error(400, 'Bad URL');
    }
    targetKey = data;

  } catch (e) {
    throw error(400, `Invalid npub: ${e} ${params.npub}`);
  }

  const verifyReputation = {
    created_at: Math.floor(Date.now() / 1000),
    kind: 5312,
    tags: [
      ["param", "target", targetKey],
      ["param", "limit", "10"],
    ],
    content:''
  };

  const nsec = process.env.SK;
  const signedVerifyReputation = finalizeEvent(verifyReputation, nsec);
  await relay.publish(signedVerifyReputation);

  const reputationResponses = await query({
    kinds: [6312, 7000],
    '#e': [signedVerifyReputation.id],
    limit: 1,
  });

  switch (reputationResponses[0].kind) {
    case 6312:
      const reputationResults = JSON.parse(reputationResponses[0].content);
      const pubkeys = reputationResults.map((e) => e.pubkey);

      const profileResponses = await query({ kinds: [0], authors: pubkeys, limit: pubkeys.length});
      const targetProfile = profileResponses.find((e) => e.pubkey == targetKey);
      if (!targetProfile) return {};

      const profile = await detailedProfile(targetProfile, reputationResults[0]);

      const targetRank = reputationResults[0].rank
      const nodes = Number(reputationResponses[0].tags.find(tag => tag.length > 1 && tag[0] === 'nodes')?.[1] || 0);
      profile.reputationStatus = reputationStatus(targetRank, nodes)

      profile.topFollowers = await Promise.all(
        pubkeys
          .slice(1)
          .map(pk => profileResponses.find(e => e.pubkey === pk))
          .filter(Boolean)
          .map(e => minimalProfile(e))
      );

      return profile;
      break;
    
    case 7000:
      return { error: reputationResponses[0].tags.find(t => t[0] == 'status')[2] };
      break;
  
    default:
      // unexpected kind
      const profileResponse = await query({ kinds: [0], authors: [targetKey], limit: 1});
      return await detailedProfile(profileResponse[0]);
      break;
  }
}
