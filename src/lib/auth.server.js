const COOKIE_KEY = 'npub_world_nwt';

/**
 * Reads the Nostr Web Token from the request cookie.
 * Returns { nwt, pubkey } — both null if not logged in or cookie is invalid.
 */
export function getAuth(cookies) {
  try {
    const raw = cookies.get(COOKIE_KEY);
    if (!raw) return { nwt: null, pubkey: null };
    const nwt = JSON.parse(decodeURIComponent(raw));
    return { nwt, pubkey: nwt?.pubkey ?? null };
  } catch {
    return { nwt: null, pubkey: null };
  }
}
