/**
  * @typedef {Object} Profile
  * @property {string} npub
  * @property {string} [reputation]
  * @property {string} [name]
  * @property {string} [picture]
  * @property {string} [pictureURL]
  * @property {string} [about]
  * @property {string} [nip05]
  * @property {string} [lud16]
  * @property {string} [website]
  * @property {string} [following]
  * @property {string} [followers]
  * 
  * @typedef {Object} ReputationInfo
  * @property {string} pubkey
  * @property {number} rank
  * @property {number} nodes
  * @property {number} [follows]
  * @property {number} [followers]
*/

import { normalizeMentions, normalizeURL } from "$lib/string.js";
import RingBuffer from "./buffer";
import * as nip19 from 'nostr-tools/nip19';
import sharp from 'sharp';
import { fetch } from 'undici';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { marked } from 'marked';
import { createHash } from 'crypto';

/**
 * Builds a minimal profile object from a kind:0 profile event.
 *
 * @param {Object} profileEvent
 * @returns {Promise<Profile|null>}
 */
export const minimalProfile = async (profileEvent) => {
  if (!profileEvent) return null;

  const info = JSON.parse(profileEvent.content);

  return {
    npub: nip19.npubEncode(profileEvent.pubkey),
    name: info.display_name || info.displayName || info.name,
    picture: await loadImage(info.picture, lowResolution),
    nip05: info.nip05?.toString().toLowerCase(),
  }
}

/**
 * Builds a detailed profile object from a kind:0 profile event and its reputation info.
 *
 * @param {Object} profileEvent
 * @param {ReputationInfo} reputationInfo
 * @returns {Promise<Profile|null>}
 */
export const detailedProfile = async (profileEvent, reputationInfo) => {
  if (!profileEvent || !reputationInfo) return null;

  const info = JSON.parse(profileEvent.content);
  const formatter = new Intl.NumberFormat('en-US');

  return {
    npub: nip19.npubEncode(profileEvent.pubkey),
    reputation: reputationStatus(reputationInfo.rank, reputationInfo.nodes),

    name: info.display_name || info.displayName || info.name,
    picture: await loadImage(info.picture, highResolution),
    pictureURL: info.picture,
    about: info.about && marked(await normalizeMentions(info.about)),
    nip05: info.nip05?.toString().toLowerCase(),
    website: normalizeURL(info.website),
    lud16: info.lud16,

    follows: formatter.format(reputationInfo.follows),
    followers: formatter.format(reputationInfo.followers),
  };
}

/**
 * Extracts and returns an array of ReputationInfo from a reputation event.
 * @param {Object} nostrEvent
 * @returns {ReputationInfo[]}
 */
export const reputationInfos = (reputationEvent) => {
  const nodesTag = reputationEvent.tags.find(tag => tag.length > 1 && tag[0] === 'nodes');
  const nodes = Number(nodesTag?.[1] || 0);  

  let data = [];
  try {
    data = JSON.parse(reputationEvent.content);
  } catch (err) {
        console.error(`Failed to parse reputation event with ID ${reputationEvent.id}:`, err);
    return [];
  }

  return data.map(entry => ({
      pubkey: entry.pubkey,
      rank: entry.rank,
      nodes: nodes,
      follows: entry.follows,
      followers: entry.followers,
    }));
}

/**
 * Extracts and returns an array of pubkeys from a reputation event.
 * @param {Object} nostrEvent
 * @returns {string[]}
 */
export const getPubkeys = (reputationEvent) => {
  let data = [];
  try {
    data = JSON.parse(reputationEvent.content);
  } catch (err) {
        console.error(`Failed to parse reputation event with ID ${reputationEvent.id}:`, err);
    return [];
  }

  return data.map(entry => entry.pubkey)
}

// Returns a qualitative reputation status ("low", "mid", "high")
// based on a node's PageRank `rank` and total `nodes` in the network.
export const reputationStatus = (rank, nodes) => {
  if (!rank || rank === 0 ) return "low"
  if (!nodes || nodes === 0 ) return "low"

  const midThreshold = pagerankPercentile(0.01, nodes)      // top 1%
  const highThreshold = pagerankPercentile(0.0001, nodes)   // top 0.01%

  if (rank > highThreshold) {
    return "high"
  }
  if (rank > midThreshold) {
    return "mid"
  }
  return "low"
}

// pagerankPercentile returns the pagerank value of the top 'percentage' 
// of a network consisting of 'nodes'.
// More info here: https://vertexlab.io/blog/pagerank_as_filter/
export const pagerankPercentile = (percentage, nodes) => {
  let exponent = 0.76
  return (1-exponent) * percentage ** (-exponent) * 1/nodes
}

const imagesPath = '/tmp/npub.world/pfp/'
const lowResolution = '_100px'
const highResolution = '_300px'
const fallbackImage = 'data:image/webp;base64,UklGRuAAAABXRUJQVlA4INQAAABwCQCdASpQAFAAPo04l0elI6IhMKiooBGJaQDScC02BEwP2H/Xw6mQ/cGOime5aeLAeko9rSLnArnPBGwjpK7fy0qQybOdlfgbKXrmiCfRhKrfmsAA/u9klMKxc9NDXPvY1gnSxBCX8RPgMave0BDaJX1ooy2y+0+NcaXhjBC7ceNEZiUnGaW3OL90AiJECb4+8XvHJlAhICa44UHriACZy4Zv6wWNf7Ww9TYj6FxPo/g6u1zzabrFBSAnSFdYxAQglMDwYG6lUgbwHi3+0na86z9AAA==';

// Attempt to load from disk the picture by its url-hash and quality.
// If not found, tries to fetch by its url. 
export const loadImage = async (url, quality) => {
  if (!url || typeof url !== 'string') return fallbackImage;
  if (quality !== lowResolution && quality !== highResolution) return fallbackImage;
  await mkdir(imagesPath, { recursive: true });

  try {
    const hash = createHash('sha256');
    hash.update(url, 'utf8');
    const pictureHash = hash.digest('hex');
    const image = await readFile(imagesPath + pictureHash + quality +'.webp');
    return `data:image/webp;base64,${image.toString('base64')}`;

  } catch (e) {
    // Otherwise fetch and write to disk
    return await fetchImage(url, quality);
  }
}

// A ring buffer that tracks the last bad urls to avoid repeated fetching
const badURLs = new RingBuffer(100);

// Attempt to fetch picture by its URL and write low and high quality versions
// of the image to disk.
// Returns base64 encoded image of the specified quality.
const fetchImage = async (url, quality) => {
  if (!url || typeof url !== 'string') return fallbackImage;
  if (quality !== lowResolution && quality !== highResolution) return fallbackImage;
  if (badURLs.contains(url)) return fallbackImage;

  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (response.status !== 200) {
      throw `Status ${response.status}`;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const lowRes = await sharp(buffer)
      .resize({ width: 100, height: 100 })
      .webp({ quality: 60 })
      .toBuffer();

    const highRes = await sharp(buffer)
      .resize({ width: 300, height: 300 })
      .webp({ quality: 80 })
      .toBuffer();

    const hash = createHash('sha256');
    hash.update(url, 'utf8');
    const pictureHash = hash.digest('hex');

    // Write in background
    writeFile((imagesPath + pictureHash + lowResolution +'.webp'), lowRes);
    writeFile((imagesPath + pictureHash + highResolution +'.webp'), highRes);

    switch (quality) {
      case lowResolution:
        return `data:image/webp;base64,${lowRes.toString('base64')}`

      case highResolution:
        return `data:image/webp;base64,${highRes.toString('base64')}`
    }
  } catch (e) {
    badURLs.add(url)
    return fallbackImage;
  }
}