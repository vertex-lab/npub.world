import { browser } from '$app/environment';
import { verifyEvent } from 'nostr-tools';

const STORAGE_KEY  = 'npub.world.auth';
const COOKIE_KEY   = 'npub_world_nwt';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

function load() {
  if (!browser) return { nwt: null };
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? { nwt: null };
  } catch {
    return { nwt: null };
  }
}

export const auth = $state(load());

export function isLoggedIn() {
  return auth.nwt !== null;
}

/**
 * Prompts the user to sign a Nostr Web Token (kind 27519) via NIP-07,
 * validates the event id and signature, then stores it.
 */
export async function login() {
  if (!browser) throw new Error('Login is only available in the browser.');
  if (!window.nostr) throw new Error('No Nostr extension found. Please install one (e.g. Alby, nos2x).');

  const nwt = await window.nostr.signEvent({
    kind: 27519,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: '',
  });

  if (!verifyEvent(nwt)) throw new Error('Invalid event: signature verification failed.');

  auth.nwt = nwt;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ nwt }));
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(nwt))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function logout() {
  auth.nwt = null;
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
