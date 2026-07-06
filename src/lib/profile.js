/**
  * @typedef {Object} MinimalProfile
  * @property {string} npub
  * @property {string} [name]
  * @property {string} [nip05]
  * @property {string} [picture]
  *
  * @typedef {Object} Profile
  * @property {string} npub
  * @property {string} [name]
  * @property {string} [picture]
  * @property {string} [pictureURL]
  * @property {string} [about]
  * @property {string} [nip05]
  * @property {string} [lud16]
  * @property {string} [website]
  * @property {number} follows
  * @property {number} followers
  * @property {"low" | "medium" | "high"} popularity
  * @property {Leak} [leak]
  *
  * @typedef {Object} ReputationInfo
  * @property {number} nodes
  * @property {string} pubkey
  * @property {number} rank
  * @property {number} [follows]
  * @property {number} [followers]
  * @property {Leak} [leak]

  * @typedef {Object} Leak
  * @property {"confirmed" | "suspected"} status
  * @property {string} [proof]
  * @property {number} [detected_at]
*/

import { normalizeMentions, normalizeURL } from "$lib/string.js";
import { query } from "$lib/nostr.js";
import * as nip19 from 'nostr-tools/nip19';
import { marked } from 'marked';
import { loadImage, lowResolution } from '$lib/image.js';

/**
 * Fetches the profile events for a list of public keys and maps them
 * to minimal profile objects.
 *
 * @param {string[]} pubkeys - Array of hex public keys to fetch profiles for
 * @returns {Promise<object[]>} - Array of minimal profile objects, filtered to remove null/undefined
 */
export const fetchMinimalProfiles = async (pubkeys) => {
  if (!pubkeys || pubkeys.length === 0) return [];

  let profileEvents = await query({
    kinds: [0],
    authors: pubkeys,
    limit: pubkeys.length
  });

  profileEvents = new Map(profileEvents.map(evt => [evt.pubkey, evt]));

  const profiles = await Promise.all(
    pubkeys.map(pk => { return minimalProfile(profileEvents.get(pk)); })
  );

  return profiles.filter(Boolean);
}

/**
 * Builds a minimal profile object from a kind:0 profile event.
 *
 * @param {Object} profileEvent
 * @returns {Promise<MinimalProfile|null>}
 */
export const minimalProfile = async (profileEvent) => {
  if (!profileEvent) return null;

  let info;
  try {
    info = JSON.parse(profileEvent.content);
  } catch (err) {
    console.error(`Failed to parse profile event ${profileEvent.id}: ${err.message || err.toString()}`);
    return null;
  }

  return {
    npub: nip19.npubEncode(profileEvent.pubkey),
    name: info.display_name || info.displayName || info.name,
    picture: await loadImage(info.picture, lowResolution),
    nip05: info.nip05?.toString().toLowerCase(),
  }
}

/**
 * Returns the reputation status of a user based on their rank and node count.
 * @param {number} rank - The user's rank.
 * @param {number} nodes - The total number of nodes in the network.
 * @returns { "low" | "mid" | "high" }
 */
export const popularity = (rank, nodes) => {
  if (!rank || !nodes) return "low"

  const top1 = pagerankPercentile(0.01, nodes)      // top 1%
  const top01 = pagerankPercentile(0.0001, nodes)   // top 0.01%

  if (rank > top01) return "high"
  if (rank > top1) return "mid"
  return "low"
}

// pagerankPercentile returns the pagerank value of the top 'percentage'
// of a network consisting of 'nodes'.
// More info here: https://vertexlab.io/blog/pagerank_as_filter/
export const pagerankPercentile = (percentage, nodes) => {
  let exponent = 0.76
  return (1-exponent) * percentage ** (-exponent) * 1/nodes
}


