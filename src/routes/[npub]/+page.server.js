import { relay } from "$lib/relay.js";
import { verifiedSymbol } from "nostr-tools";
import * as nip19 from 'nostr-tools/nip19'
import { error, json } from '@sveltejs/kit';
import sharp from 'sharp';
import { fetch } from 'undici';

export async function load({ params }) {
  let { type, data } = nip19.decode(params.npub);
  if (type !== 'npub') {
    throw error(400, 'Bad URL');
  }
  const query = new Promise((resolve, reject) => {
    const events = [];
    relay.subscribe([{ kinds: [0], authors: [data], limit: 1 }], {
      onevent(event) {
        events.push(event);
      },
      oneose() {
        resolve(events);
      },
      onclose(reason) {
        reject(reason);
      }
    });
  });
  const r = await query;
  const info = JSON.parse(r[0].content);

  // Compress profile pic and serve as base64

  const response = await fetch(info.picture);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const compressedImageBuffer = await sharp(buffer)
    .resize({ width: 100 })
    .jpeg({ quality: 60 })
    .toBuffer();

  const base64Image = compressedImageBuffer.toString('base64');

  return {
    name: info.display_name || info.displayName,
    picture: `data:image/jpeg;base64,${base64Image}`,
    about: info.about,
    nip05: info.nip05
  };
}