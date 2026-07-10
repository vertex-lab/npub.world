import { relay, query } from './nostr';
import * as nip19 from 'nostr-tools/nip19';

export const NPUB_REGEXP = /\bnpub1[a-z0-9]{58}\b/;
export const NPUB_MENTION_REGEXP = /\S*(npub1[a-z0-9]{58})\S*/g;
export const HEXKEY_REGEXP = /^[0-9a-fA-F]{64}$/;
export const NIP05_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HTTP_URL_REGEXP = /^https?:\/\//i;


// Replace mentions in a text with npub.world links
export const normalizeMentions = async (text) => {
  if (!text || text.length === 0) return null;

  const pubkeys = Array.from(text.matchAll(NPUB_MENTION_REGEXP)).map(m => nip19.decode(m[1]).data);
  if (pubkeys.length == 0) return text;

  const names = {};
  const profileEvents = await query({
     kinds: [0],
     authors: pubkeys,
     limit: pubkeys.length
  });

  for (const e of profileEvents) {
    const info = JSON.parse(e.content);
    names[e.pubkey] = info.display_name || info.displayName || info.name;
  }

  return text.replace(NPUB_MENTION_REGEXP, (match, npub) => {
    const pubkey = nip19.decode(npub).data
    const name = names[pubkey] || npub;
    return `<a href="/${npub}">${name}</a> `;
  });
}

export const normalizeURL = (url) => {
  if (!url || typeof url !== 'string') return null;

  url = url.trim();
  if (url.length === 0) return null;

  if (!HTTP_URL_REGEXP.test(url)) {
    url = `https://${url}`;
  }

  return url;
};

export const isValidURL = (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Matches loopback, RFC-1918 private ranges, and link-local (e.g. AWS metadata).
const PRIVATE_HOST_RE = /^(localhost|127(\.(\d+)){3}|10(\.(\d+)){3}|192\.168(\.(\d+)){2}|172\.(1[6-9]|2\d|3[01])(\.(\d+)){2}|169\.254(\.(\d+)){2}|::1|fc[0-9a-f]{2}:.*)$/i;

/**
 * Validates a provider URL is safe to fetch server-side.
 * Throws a human-readable Error if it fails any check.
 * Returns the normalized origin (scheme + host + port, no trailing path).
 */
export function safeURL(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new Error('Invalid URL'); }
  if (url.protocol !== 'https:') throw new Error('Provider URL must use HTTPS');
  if (PRIVATE_HOST_RE.test(url.hostname)) throw new Error('Provider URL must not point to a private or local address');
  return url.origin;
}

export function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str;
  const midPoint = Math.floor(maxLength / 2);
  const left = str.slice(0, midPoint);
  const right = str.slice(str.length - midPoint);
  return `${left}...${right}`;
}
