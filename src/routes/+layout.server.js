
import { query, parseProfile } from '$lib/nostr.js';
import { imager, highResolution } from '$lib/image.js';

export async function load({ locals }) {
  let user = null;
  try {
    const pubkey = locals.pubkey;
    if (pubkey) {
      const events = await query({ kinds: [0], authors: [pubkey], limit: 1 });
      const profile = parseProfile(events[0]);

      if (profile) {
        user = {
          pubkey,
          npub:       profile.npub,
          name:       profile.name,
          nip05:      profile.nip05,
          about:      profile.about,
          picture:    await imager.load(profile.pictureURL, highResolution),
          pictureURL: profile.pictureURL,
        };
      }
    }
  } catch {
    // invalid or missing NWT, treat as logged out
  }

  return { capabilities: locals.capabilities, user };
}
