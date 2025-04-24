import { relay, query } from "$lib/relay.js";
import * as nip19 from 'nostr-tools/nip19';
import sharp from 'sharp';
import { fetch } from 'undici';
import { writeFile, readFile } from 'node:fs/promises';
import { marked } from 'marked';
import { createHash } from 'crypto';

export const NPUB_REGEXP = /\bnpub[a-z0-9]+\b/;
export const NPUB_EMBED_REGEXP = /\bnostr:(npub[a-z0-9]{59})\b/g;
export const HEXKEY_REGEXP = /^[0-9a-fA-F]{64}$/;
export const NIP05_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fallbackImage = 'UklGRuAAAABXRUJQVlA4INQAAABwCQCdASpQAFAAPo04l0elI6IhMKiooBGJaQDScC02BEwP2H/Xw6mQ/cGOime5aeLAeko9rSLnArnPBGwjpK7fy0qQybOdlfgbKXrmiCfRhKrfmsAA/u9klMKxc9NDXPvY1gnSxBCX8RPgMave0BDaJX1ooy2y+0+NcaXhjBC7ceNEZiUnGaW3OL90AiJECb4+8XvHJlAhICa44UHriACZy4Zv6wWNf7Ww9TYj6FxPo/g6u1zzabrFBSAnSFdYxAQglMDwYG6lUgbwHi3+0na86z9AAA==';

export const formatProfile = async (profileEvent, reputationInfo, minimal = false) => {
  if (!profileEvent) return;

  const info = JSON.parse(profileEvent.content);
  const base64Image = await loadBase64Image(profileEvent, info);

  if (minimal) {
    return {
      name: info.display_name || info.displayName || info.name,
      picture: base64Image && `data:image/webp;base64,${base64Image}`,
      nip05: info.nip05?.toString().toLowerCase(),
      npub: nip19.npubEncode(profileEvent.pubkey),
    }
  }

  info.about = await normalizeNpubsMentions(info.about)
  const formatter = new Intl.NumberFormat('en-US');

  return {
    name: info.display_name || info.displayName || info.name,
    picture: base64Image && `data:image/webp;base64,${base64Image}`,
    about: info.about && marked(info.about),
    nip05: info.nip05?.toString().toLowerCase(),
    lud16: info.lud16,
    npub: nip19.npubEncode(profileEvent.pubkey),
    website: normalizeURL(info.website),
    following: formatter.format(reputationInfo.follows),
    followers: formatter.format(reputationInfo.followers),
  };
}

export const normalizeNpubsMentions = async (about) => {
  // Replace npub mentions in about with npub.world links
  if (!about) return null;

  const npubs = Array.from(about.matchAll(NPUB_EMBED_REGEXP)).map((m) => m[1]);  
  if (npubs.length == 0) return about;

  const npubNames = {};
  const authors = npubs.map((m) => nip19.decode(m).data);
  if (authors.length == 0) return about;

  const profilesResponse = await query({ kinds: [0], authors: authors });
  for (const e of profilesResponse) {
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



export const loadBase64Image = async (profile, parsedContent) => {
  // Attempt to load profile for this pubkey + picture url hash
  if (typeof parsedContent.picture !== 'string') {
    return fallbackImage;
  }

  try {
    const hash = createHash('sha256');
    hash.update(parsedContent.picture, 'utf8');
    const pictureHash = hash.digest('hex');
    const bytes = await readFile(`/tmp/${profile.pubkey}-${pictureHash}.webp`);
    return bytes.toString('base64');
  } catch (e) {
    // Otherwise fetch and write to disk
    return await fetchBase64Image(profile, parsedContent);
  }
}

export const fetchBase64Image = async (profile, parsedContent) => {
  try {
    const response = await fetch(parsedContent.picture, { redirect: 'follow' });

    if (response.status !== 200) {
      throw `Status ${response.status}`;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const compressedImageBuffer = await sharp(buffer)
      .resize({ width: 100, height: 100 })
      .webp({ quality: 50 })
      .toBuffer();

    // Write in background
    const hash = createHash('sha256');
    hash.update(parsedContent.picture, 'utf8');
    const pictureHash = hash.digest('hex');
    writeFile(`/tmp/${profile.pubkey}-${pictureHash}.webp`, compressedImageBuffer);

    return compressedImageBuffer.toString('base64');
  } catch (e) {
    console.log('Could not fetch or write', parsedContent.picture);
    console.log(e);
    return fallbackImage;
  }
}

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