import { ranker } from '$lib/open-ranking.js';

export async function load() {
  return { capabilities: ranker.capabilities ?? {} };
}
