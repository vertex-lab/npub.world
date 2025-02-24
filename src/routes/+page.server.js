import { relay, query } from "$lib/relay.js";
import { formatProfile } from "$lib/utils";

export async function load({ url }) {
  const q = url.searchParams.get('q');

  if (!q) return;

  const searchResponse = await query({
    kinds: [6315, 7000],
    search: JSON.stringify({ search: q }),
  });
  if (searchResponse[0].kind == 6315) {
    const results = JSON.parse(searchResponse[0].content);
    const pubkeys = results.map((e) => e.pubkey);
    const profilesResponse = await query({ kinds: [0], authors: pubkeys });
    const profiles = await Promise.all(profilesResponse.map(formatProfile));
    return { data: profiles };
  } else {
    return { data: [] };
  }
}