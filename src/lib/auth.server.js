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
    if (!nwt) return { nwt: null, pubkey: null };

    const exp = nwt.tags?.find(t => t[0] === 'exp')?.[1];
    if (exp && Number(exp) < Math.floor(Date.now() / 1000)) {
      cookies.delete(COOKIE_KEY, { path: '/' });
      return { nwt: null, pubkey: null };
    }
    return { nwt, pubkey: nwt.pubkey };

  } catch {
    return { nwt: null, pubkey: null };
  }
}
