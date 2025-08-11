import { Relay } from 'nostr-tools';
import * as nip19 from 'nostr-tools/nip19';

export const NPUB_REGEXP = /\bnpub1[a-z0-9]{58}\b/;
export const NPUB_EMBED_REGEXP = /\bnostr:(npub1[a-z0-9]{58})\b/g;
export const HEXKEY_REGEXP = /^[0-9a-fA-F]{64}$/;
export const NIP05_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const resolveNIP05 = async (nip05) => {
  const [name, domain] = nip05.split('@');
  const response = await fetch(`https://${domain}/.well-known/nostr.json?name=${name}`, { redirect: 'follow' });

  if (response.status !== 200) {
    throw `Status ${response.status}`;
  }

  const obj = await response.json();
  const pubkey = obj['names'][name];
  return nip19.npubEncode(pubkey);
}

// Replace mentions in about with npub.world links
export const normalizeMentions = async (about) => {
  if (!about) return null;

  const npubs = Array.from(about.matchAll(NPUB_EMBED_REGEXP)).map(m => m[1]);
  if (npubs.length == 0) return about;

  const npubNames = {};
  const authors = npubs.map((m) => nip19.decode(m).data);
  if (authors.length == 0) return about;

  const profileEvents = await query({
     kinds: [0], 
     authors: authors,
     limit: authors.length
  });

  for (const e of profileEvents) {
    const info = JSON.parse(e.content);
    npubNames[nip19.npubEncode(e.pubkey)] = info.display_name || info.displayName || info.name;
  }

  return about.replace(NPUB_EMBED_REGEXP, (match, p1) => {
    const name = npubNames[p1];
    return `<a href="/${p1}">${name}</a> `;
  });
}

export const normalizeURL = (url) => {
  if (!url || typeof url !== 'string') return null;

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
};

export const relay = new Relay('wss://relay.vertexlab.io');

export const query = (filter) => {
  return new Promise((resolve, reject) => {
    const events = [];
    const sub = relay.subscribe([filter], {
      onevent(event) {
        events.push(event);
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

export function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str;
  const midPoint = Math.floor(maxLength / 2);
  const left = str.slice(0, midPoint);
  const right = str.slice(str.length - midPoint);
  return `${left}...${right}`;
}

export class RingBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.write = 0;
  }

  add(item) {
    this.buffer[this.write] = item
    this.write = (this.write+1) % this.capacity
  }

  contains(item) {
    for (let i = 0; i < this.capacity; i++) {
      if (this.buffer[i] === item) {
        return true;
      }
    }
    return false;
  }
}