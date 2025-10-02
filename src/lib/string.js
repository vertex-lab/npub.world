import { relay, query } from './nostr';
import * as nip19 from 'nostr-tools/nip19';

export const NPUB_REGEXP = /\bnpub1[a-z0-9]{58}\b/;
export const NPUB_MENTION_REGEXP = /\S*(npub1[a-z0-9]{58})\S*/g;
export const HEXKEY_REGEXP = /^[0-9a-fA-F]{64}$/;
export const NIP05_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HTTP_URL_REGEXP = /^https?:\/\//i;

// Resolve a NIP-05 identifier to a npub using the well-known URL.
// Throws an error if the NIP-05 is invalid or cannot be resolved.
export const resolveNIP05 = async (nip05) => {
  if (!nip05 || typeof nip05 !== 'string') {
    throw new Error('Invalid NIP-05: must be a non-empty string');
  }

  let [name, domain] = nip05.split('@');
  if (!name || !domain) {
    throw new Error(`Invalid NIP-05 format: "${nip05}" (expected name@domain)`);
  }

  name = name.toLowerCase();
  domain = domain.toLowerCase();

  try {
    const response = await fetch(
      `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`,
       { redirect: 'follow' },
    );

    if (!response.ok) {
      throw new Error(`failed to fetch record: HTTP ${response.status}`);
    }

    const json = await response.json();
    const pubkey = json?.names?.[name];

    if (!pubkey) {
      throw new Error(`missing record for "${name}"`);
    }

    if (typeof pubkey !== 'string' || !HEXKEY_REGEXP.test(pubkey)) {
      throw new Error(`invalid pubkey for "${name}"`);
    }

    return nip19.npubEncode(pubkey);

  } catch (err) {
    throw new Error(`Failed to resolve NIP-05: ${String(err)}`);
  }
};


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

export function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str;
  const midPoint = Math.floor(maxLength / 2);
  const left = str.slice(0, midPoint);
  const right = str.slice(str.length - midPoint);
  return `${left}...${right}`;
}