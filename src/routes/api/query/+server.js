import { relay, query } from "$lib/relay.js";
import { reputationInfos, minimalProfile, HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from "$lib/profile";
import * as nip19 from 'nostr-tools/nip19';
import { finalizeEvent } from 'nostr-tools';
import { redirect } from "@sveltejs/kit";

export async function POST({ request }) {
  try {
    let { q } = await request.json();
    q = q?.trim();
    if (!q || q.length < 3) {
      throw 'Please input at least 3 characters';
    }

    if (HEXKEY_REGEXP.test(q) || NPUB_REGEXP.test(q) || NIP05_REGEXP.test(q)) {
      return new Response(JSON.stringify({ redirect: q }));
    }

    let searchProfiles = {
      created_at: Math.floor(Date.now() / 1000),
      kind: 5315,
      tags: [
        ["param", "search", q],
        ["param", "limit", "10"],
      ],
      content: ''
    };

    const nsec = process.env.SK;
    searchProfiles = finalizeEvent(searchProfiles, nsec);
    await relay.publish(searchProfiles);

    const searchResponses = await query({
      kinds: [6315, 7000],
      '#e': [searchProfiles.id]
    });

    switch (searchResponses[0].kind) {
      case 6315:
        const reputations = reputationInfos(searchResponses[0]);
        const pubkeys = reputations.map((e) => e.pubkey);

        let profileEvents = await query({
          kinds: [0], 
          authors: pubkeys,
          limit: pubkeys.length
        });

        profileEvents = new Map(profileEvents.map(evt => [evt.pubkey, evt]));

        const profiles = await Promise.all(
          reputations
          .map(rep => {
            const evt = profileEvents.get(rep.pubkey);
            return minimalProfile(evt, rep)
          })
          .filter(Boolean)
        );
        
        return new Response(JSON.stringify(profiles), {headers: {'Content-Type': 'application/json'}});

      case 7000:
        throw `Error: ${searchResponses[0].tags.find(t => t[0] == 'status')[2]};`
    
      default:
        // unexpected kind
        throw `Error: unexpected kind ${searchResponses[0]?.kind}; content ${searchResponses[0]?.content}`
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error?.toString() || error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}