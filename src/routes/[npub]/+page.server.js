import { socialRelay, query, querySocial } from "$lib/relay.js";
import { verifiedSymbol } from "nostr-tools";
import * as nip19 from 'nostr-tools/nip19'
import { error, json } from '@sveltejs/kit';
import sharp from 'sharp';
import { fetch } from 'undici';
import { writeFile, readFile } from 'node:fs/promises';

const FRANZAP_NPUB = 'npub1wf4pufsucer5va8g9p0rj5dnhvfeh6d8w0g6eayaep5dhps6rsgs43dgh9';

export async function load({ params }) {
  let publicKey;
  try {
    let { type, data } = nip19.decode(params.npub);
    if (type !== 'npub') {
      throw error(400, 'Bad URL');
    }
    publicKey = data;
  } catch (e) {
    throw error(400, `Invalid npub: ${params.npub}`);
  }

  // Verify reputation

  const reputationResponse = await query({
    kinds: [6312, 7000], search: JSON.stringify({
      source: FRANZAP_NPUB,
      targets: [publicKey]
    })
  });

  if (reputationResponse[0].kind === 6312) {
    const reputablePubkeys = JSON.parse(reputationResponse[0].content).map((e) => e.pubkey);

    const authorResponse = await querySocial({ kinds: [0], authors: [publicKey, ...reputablePubkeys] });
    const profile = await formatProfile(authorResponse.find((e) => e.pubkey == publicKey));
    const reputableProfiles = await Promise.all(authorResponse.filter((e) => e.pubkey !== publicKey).map(formatProfile));

    profile.reputable = reputableProfiles;
    return profile;
  } else {
    const authorResponse = await querySocial({ kinds: [0], authors: [publicKey] });
    return await formatProfile(authorResponse[0]);
  }
}

const formatProfile = async (event) => {
  const info = JSON.parse(event.content);

  const base64Image = await loadBase64Image(event);

  return {
    name: info.display_name || info.displayName || info.name,
    picture: `data:image/jpeg;base64,${base64Image}`,
    about: info.about,
    nip05: info.nip05,
    npub: nip19.npubEncode(event.pubkey)
  };
}

const loadBase64Image = async (profile) => {
  // Attempt to load profile for this pubkey+timestamp
  try {
    const bytes = await readFile(`/tmp/${profile.pubkey}-${profile.created_at}.jpg`);
    return bytes.toString('base64');
  } catch (e) {
    // Otherwise fetch and write to disk
    return await fetchBase64Image(profile);
  }
}

const fetchBase64Image = async (profile) => {
  const info = JSON.parse(profile.content);
  const response = await fetch(info.picture);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const compressedImageBuffer = await sharp(buffer)
    .resize({ width: 120, height: 120 })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Write in background
  writeFile(`/tmp/${profile.pubkey}-${profile.created_at}.jpg`, compressedImageBuffer);

  return compressedImageBuffer.toString('base64');
}
