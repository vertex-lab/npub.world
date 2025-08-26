import { relay, query, dvm } from "$lib/nostr.js";
import { resolveNIP05, HEXKEY_REGEXP, NIP05_REGEXP } from "$lib/string.js";
import * as nip19 from 'nostr-tools/nip19';
import { error, redirect } from '@sveltejs/kit';
import { reputationInfos, minimalProfile, detailedProfile } from "$lib/profile";

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

  } catch (err) {
    throw error(400, `Invalid npub: ${err} ${params.npub}`);
  }

  let verifyReputation = {
    kind: 5312,
    tags: [
      ["param", "target", targetKey],
      ["param", "limit", "10"],
    ],
  };

  let response;
  try {
    response = await dvm(verifyReputation);
  } catch(err) {
    console.log("verify reputation failed: ", err)
    throw error(500, err)
  }

  const reputations = reputationInfos(response);
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
}
