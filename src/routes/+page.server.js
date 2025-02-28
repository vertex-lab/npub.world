import { relay, query } from "$lib/relay.js";
import { formatProfile, HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from "$lib/utils";
import * as nip19 from 'nostr-tools/nip19';
import { redirect } from "@sveltejs/kit";

export async function load({ url }) {
  const q = url.searchParams.get('q')?.trim();

  if (!q) return;

  if (HEXKEY_REGEXP.test(q) || NPUB_REGEXP.test(q) || NIP05_REGEXP.test(q)) {
    return redirect(301, `/${q}`);
  }

  const searchResponse = await query({
    kinds: [6315, 7000],
    search: JSON.stringify({ search: q, limit: 7 }),
  });
  if (searchResponse[0].kind == 6315) {
    const results = JSON.parse(searchResponse[0].content);
    const pubkeys = results.map((e) => e.pubkey);
    const profilesResponse = await query({ kinds: [0], authors: pubkeys });
    const profiles = await Promise.all(profilesResponse.map(formatProfile));
    return { data: profiles.sort((a, b) => results.find(e => e.pubkey == nip19.decode(b.npub).data).rank - results.find(e => e.pubkey == nip19.decode(a.npub).data).rank) };
  } else {
    return { data: [] };
  }
}