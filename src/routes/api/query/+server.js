import { relay, query } from "$lib/relay.js";
import { formatProfile, HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from "$lib/utils";
import * as nip19 from 'nostr-tools/nip19';
import { redirect } from "@sveltejs/kit";

export async function POST({ request }) {
  try {
    let { q } = await request.json();

    q = q?.trim();

    if (!q || q.length < 3) {
      throw 'Please input 3 or more characters';
    }

    if (HEXKEY_REGEXP.test(q) || NPUB_REGEXP.test(q) || NIP05_REGEXP.test(q)) {
      console.log('redirecting', q);

      return redirect(301, `/${q}`);
    }

    let data;

    const searchResponse = await query({
      kinds: [6315, 7000],
      search: JSON.stringify({ search: q, limit: 8 }),
    });
    if (searchResponse[0].kind == 6315) {
      const content = searchResponse[0].content;
      const results = JSON.parse(content);
      if (!content || content == 'null') {
        data = [];
      }
      const pubkeys = results.map((e) => e.pubkey);
      const profilesResponse = await query({ kinds: [0], authors: pubkeys });
      const profiles = await Promise.all(profilesResponse.map(formatProfile));
      data = profiles.sort((a, b) => results.find(e => e.pubkey == nip19.decode(b.npub).data).rank - results.find(e => e.pubkey == nip19.decode(a.npub).data).rank);
    } else {
      data = [];
    }

    // console.log('returning', data);

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error || error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}