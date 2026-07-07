import { Relay, finalizeEvent } from 'nostr-tools';
import * as nip19 from 'nostr-tools/nip19';
import { HEXKEY_REGEXP, NPUB_REGEXP } from '$lib/string.js';

export const relay = new Relay('wss://relay.vertexlab.io');

export const query = (filter) => {
  return new Promise((resolve, reject) => {
    const events = [];
    const sub = relay.subscribe([filter], {
      onevent(request) {
        events.push(request);
      },
      oneose() {
        resolve(events);
        sub.close();
      },
      onclose() {
        reject();
      }
    });
  });
}

/**
 * Parses the content of a kind:0 profile event into a structured object.
 * Returns null if the event is missing/wrong kind or its content is invalid JSON.
 * @param {object} event - A kind:0 Nostr event
 * @returns {{ name: string, pictureURL: string, about: string, nip05: string, lud16: string, website: string } | null}
 */
export function parseProfile(event) {
  if (!event) return null;
  if (event.kind !== 0) return null;
  try {
    const c = JSON.parse(event.content);
    return {
      npub:       nip19.npubEncode(event.pubkey),
      name:       c.display_name || c.displayName || c.name,
      pictureURL: c.picture,
      about:      c.about,
      nip05:      c.nip05?.toString().toLowerCase(),
      lud16:      c.lud16,
      website:    c.website,
    };
  } catch {
    return null;
  }
}

/**
 * Parses the "p" tags of a a kind:3 follow list event into a structured object.
 * Returns null if the event is missing/wrong kind.
 * @param {object} event - A kind:3 Nostr event
 * @returns {string[]} - Array of pubkeys
 */
export function parsePubkeys(event) {
  if (!event) return null;
  if (event.kind !== 3) return null;

  const pubkeys = [];
  for (const tag of event?.tags || []) {
    if (tag.length < 2 || tag[0] !== "p") {
      continue;
    }

    const pk = parsePubkey(tag[1]);
    if (pk) pubkeys.push(pk);
  }
  return pubkeys
}

// parsePubkey parses a pubkey or npub string into a normalized hex key.
// It returns null if the input is not a valid pubkey or npub.
export function parsePubkey(input) {
  input = (input || '').trim();

  if (HEXKEY_REGEXP.test(input)) {
    return input;
  }
  if (NPUB_REGEXP.test(input)) {
    const decoded = nip19.decode(input);
    if (decoded.type === 'npub') return decoded.data;
  }
  return null;
}

// Resolve a NIP-05 identifier to a npub using the well-known endpoint.
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
