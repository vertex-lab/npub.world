import { relay, query } from "$lib/relay.js";
import { formatProfile, HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from "$lib/utils";
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

    let data;

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

    if (searchResponse[0].kind == 6315) {
      const content = searchResponse[0].content;
      const results = JSON.parse(content);
      if (!content || content == 'null') {
        data = [];
      }
      const pubkeys = results.map((e) => e.pubkey);
      const profilesResponse = await query({ kinds: [0], authors: pubkeys });
      const profiles = await Promise.all(profilesResponse.map((p) => formatProfile(p, null, true)));
      data = profiles.sort((a, b) => results.find(e => e.pubkey == nip19.decode(b.npub).data).rank - results.find(e => e.pubkey == nip19.decode(a.npub).data).rank);
    } else {
      throw `Error: ${searchResponse[0]?.content}`;
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.toString() || error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}