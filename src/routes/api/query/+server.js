import { relay, query } from "$lib/relay.js";
import { minimalProfile, HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from "$lib/utils";
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

    // SearchProfiles
    const nsec = process.env.SK;
    const dvmReqEvent = {
      created_at: Math.floor(Date.now() / 1000),
      kind: 5315,
      tags: [
        ["param", "search", q],
        ["param", "limit", "10"],
      ],
      content: ''
    };

    const signedDvmReqEvent = finalizeEvent(dvmReqEvent, nsec);
    await relay.publish(signedDvmReqEvent);

    const searchResponse = await query({
      kinds: [6315, 7000],
      '#e': [signedDvmReqEvent.id]
    });

    switch (searchResponse[0].kind) {
      case 6315:
        const results = JSON.parse(searchResponse[0].content);
        if (!results || results == 'null') {
          return new Response(JSON.stringify([]), {headers: { 'Content-Type': 'application/json'}});
        }

        const pubkeys = results.map((e) => e.pubkey);
        const profileResponse = await query({ kinds: [0], authors: pubkeys });
        const profiles = await Promise.all(
          pubkeys
            .map(pk => profileResponse.find(e => e.pubkey === pk))
            .filter(Boolean)
            .map(e => minimalProfile(e, null, true))
        );
        
        return new Response(JSON.stringify(profiles), {headers: {'Content-Type': 'application/json'}});
        break;

      case 7000:
        throw `Error: ${searchResponse[0].tags.find(t => t[0] == 'status')[2]};`
    
      default:
        // unexpected kind
        throw `Error: unexpected kind ${searchResponse[0]?.kind}; content ${searchResponse[0]?.content}`
        break;
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