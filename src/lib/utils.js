import { relay, query } from "$lib/relay.js";
import * as nip19 from 'nostr-tools/nip19';
import sharp from 'sharp';
import { fetch } from 'undici';
import { writeFile, readFile } from 'node:fs/promises';
import { marked } from 'marked';

const npubRegexp = /nostr:(npub[a-z0-9]+)\s/g;
const fallbackImage = 'UklGRuAAAABXRUJQVlA4INQAAABwCQCdASpQAFAAPo04l0elI6IhMKiooBGJaQDScC02BEwP2H/Xw6mQ/cGOime5aeLAeko9rSLnArnPBGwjpK7fy0qQybOdlfgbKXrmiCfRhKrfmsAA/u9klMKxc9NDXPvY1gnSxBCX8RPgMave0BDaJX1ooy2y+0+NcaXhjBC7ceNEZiUnGaW3OL90AiJECb4+8XvHJlAhICa44UHriACZy4Zv6wWNf7Ww9TYj6FxPo/g6u1zzabrFBSAnSFdYxAQglMDwYG6lUgbwHi3+0na86z9AAA==';

export const formatProfile = async (event) => {
  if (!event) return;

  const info = JSON.parse(event.content);
  const base64Image = await loadBase64Image(event);

  if (info.about) {
    // Replace npub mentions in about with npub.world links
    const npubAboutMatches = Array.from(info.about.matchAll(npubRegexp)).map((m) => m[1]);
    const npubNames = {};
    if (npubAboutMatches.length > 0) {
      const authors = npubAboutMatches.map((m) => nip19.decode(m).data);
      if (authors.length > 0) {
        const profilesResponse = await query({ kinds: [0], authors: authors });
        for (const e of profilesResponse) {
          const info = JSON.parse(e.content);
          npubNames[nip19.npubEncode(e.pubkey)] = info.display_name || info.displayName || info.name;
        }
      }
    }
    info.about = info.about.replace(npubRegexp, (match, p1) => {
      const name = npubNames[p1];
      return `<a href="/${p1}">${name}</a> `;
    });
  }

  return {
    name: info.display_name || info.displayName || info.name,
    picture: base64Image && `data:image/webp;base64,${base64Image}`,
    about: info.about && marked(info.about),
    nip05: info.nip05,
    npub: nip19.npubEncode(event.pubkey)
  };
}

export const loadBase64Image = async (profile) => {
  // Attempt to load profile for this pubkey+timestamp
  try {
    const bytes = await readFile(`/tmp/${profile.pubkey}-${profile.created_at}.webp`);
    return bytes.toString('base64');
  } catch (e) {
    // Otherwise fetch and write to disk
    return await fetchBase64Image(profile);
  }
}

export const fetchBase64Image = async (profile) => {
  const info = JSON.parse(profile.content);

  if (!info.picture) return fallbackImage;

  try {
    const response = await fetch(info.picture);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const compressedImageBuffer = await sharp(buffer)
      .resize({ width: 100, height: 100 })
      .webp({ quality: 50 })
      .toBuffer();

    // Write in background
    writeFile(`/tmp/${profile.pubkey}-${profile.created_at}.webp`, compressedImageBuffer);

    return compressedImageBuffer.toString('base64');
  } catch (e) {
    console.log('Could not fetch or write', info.picture);
    console.log(e);
    return fallbackImage;
  }
}
