import { Client } from 'open-ranking';
import { LRUCache } from 'lru-cache';

export const DEFAULT_PROVIDER_URL = "https://ranking.vertexlab.io";


const DEFAULT_TIMEOUT   = 3000;
const PROVIDERS_MAX     = 20;
const PROVIDERS_TTL     = 1000 * 60 * 30; // 30 minutes, reset on use
const CACHE_MAX_ENTRIES = 10_000;
const CACHE_DEFAULT_TTL = 1000 * 60 * 5;  // 5 minutes

// Produces a stable cache key by sorting any arrays in the request
// (e.g. pubkeys), so that different orderings of the same set hit the same entry.
function cacheKey(providerURL, method, r) {
  const canonical = JSON.stringify(r, (_, value) =>
    Array.isArray(value) ? [...value].sort() : value
  );
  return `${providerURL}:${method}:${canonical}`;
}

/**
 * Wraps the open-ranking SDK, caching both clients (by provider URL) and
 * responses (by provider + method + request).
 *
 * Custom providers are stored as Promise<Client> in an LRU with a 30-minute
 * TTL (reset on use) and a hard cap of 20 entries, preventing memory exhaustion
 * from attacker-controlled provider URLs.
 */
export class Ranker {
  // URL -> Promise<Client>. Storing Promises avoids duplicate initialization
  // when concurrent requests arrive for the same new provider.
  #clients = new LRUCache({ max: PROVIDERS_MAX, ttl: PROVIDERS_TTL, updateAgeOnGet: true });

  // Response cache shared across all providers (key includes providerURL).
  #cache = new LRUCache({ max: CACHE_MAX_ENTRIES, ttl: CACHE_DEFAULT_TTL });

  async init() {
    this.add(DEFAULT_PROVIDER_URL);
  }

  async add(url) {
    if (!this.#clients.has(url)) {
      this.#clients.set(url, Client.create(url, { timeout: DEFAULT_TIMEOUT }));
    }
    await this.#clients.get(url);
    console.log("Open-ranking client initialized at %s", url);
  }

  async #resolveClient(providerURL = DEFAULT_PROVIDER_URL) {
    if (!this.#clients.has(providerURL)) {
      this.#clients.set(providerURL, Client.create(providerURL, { timeout: DEFAULT_TIMEOUT }));
    }
    return this.#clients.get(providerURL);
  }

  async #cachedCall(providerURL = DEFAULT_PROVIDER_URL, method, r, signal) {
    const key = cacheKey(providerURL, method, r);
    const cached = this.#cache.get(key);
    if (cached) return cached;

    const client = await this.#resolveClient(providerURL);
    const response = await client[method](r, { signal });

    let ttl = CACHE_DEFAULT_TTL;
    if (method === 'compromisedPubkeys') ttl = 0;
    else if (response.ttl) ttl = response.ttl * 1000;

    this.#cache.set(key, response, { ttl });
    return response;
  }

  async capabilities(provider = DEFAULT_PROVIDER_URL) {
    const client = await this.#resolveClient(provider);
    return client.capabilities;
  }

  async statsPubkey(provider = DEFAULT_PROVIDER_URL, r, { signal } = {}) {
    return this.#cachedCall(provider, 'statsPubkey', r, signal);
  }

  async rankPubkeys(provider = DEFAULT_PROVIDER_URL, r, { signal } = {}) {
    return this.#cachedCall(provider, 'rankPubkeys', r, signal);
  }

  async recommendPubkeys(provider = DEFAULT_PROVIDER_URL, r, { signal } = {}) {
    return this.#cachedCall(provider, 'recommendPubkeys', r, signal);
  }

  async searchPubkeys(provider = DEFAULT_PROVIDER_URL, r, { signal } = {}) {
    return this.#cachedCall(provider, 'searchPubkeys', r, signal);
  }

  async followers(provider = DEFAULT_PROVIDER_URL, r, { signal } = {}) {
    return this.#cachedCall(provider, 'followers', r, signal);
  }

  async muters(provider = DEFAULT_PROVIDER_URL, r, { signal } = {}) {
    return this.#cachedCall(provider, 'muters', r, signal);
  }

  async compromisedPubkeys(provider = DEFAULT_PROVIDER_URL, r, { signal } = {}) {
    return this.#cachedCall(provider, 'compromisedPubkeys', r, signal);
  }
}

export const ranker = new Ranker();
