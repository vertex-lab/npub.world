import { relay, query } from "$lib/utils.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, json } from '@sveltejs/kit';
import { reputationInfos, reputationStatus, minimalProfile, detailedProfile, HEXKEY_REGEXP, NIP05_REGEXP, reputationInfos } from "$lib/profile";
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

  let verifyReputation = {
    created_at: Math.floor(Date.now() / 1000),
    kind: 5312,
    tags: [
      ["param", "target", targetKey],
      ["param", "limit", "10"],
    ],
    content:''
  };

  const nsec = process.env.SK;
  verifyReputation = finalizeEvent(verifyReputation, nsec);
  await relay.publish(verifyReputation);

  const reputationResponses = await query({
    kinds: [6312, 7000],
    '#e': [verifyReputation.id],
    limit: 1,
  });

  switch (reputationResponses[0].kind) {
    case 6312:
      const reputations = reputationInfos(reputationResponses[0]);
      const pubkeys = reputations.map((e) => e.pubkey);

      let profileEvents = await query({
        kinds: [0], 
        authors: pubkeys, 
        limit: pubkeys.length
      });

      profileEvents = new Map(profileEvents.map(evt => [evt.pubkey, evt]));

      const profile = await detailedProfile(
        profileEvents.get(targetKey), 
        reputations[0]
      );

      profile.topFollowers = await Promise.all(
        reputations
          .slice(1)
          .map(rep => {
            const evt = profileEvents.get(rep.pubkey);
            return minimalProfile(evt, rep)
          })
          .filter(Boolean)
      );
    
    return profile;
    
    case 7000:
      return { error: reputationResponses[0].tags.find(t => t[0] == 'status')[2] };
  
    default:
      // unexpected kind
      const profileResponse = await query({ kinds: [0], authors: [targetKey], limit: 1});
      return await detailedProfile(profileResponse[0]);
  }
}
