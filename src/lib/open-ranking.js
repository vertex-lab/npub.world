import { Client } from 'open-ranking';
import { LRUCache } from 'lru-cache';

const DEFAULT_PROVIDER_URL = "https://ranking.vertexlab.io";
const DEFAULT_TIMEOUT  = 3000;
const DEFAULT_TTL      = 1000 * 60 * 5; // 5 minutes

// Produces a stable cache key by sorting any arrays in the request
// (e.g. pubkeys), so that different orderings of the same set hit the same entry.
function cacheKey(providerURL, method, r) {
  const canonical = JSON.stringify(r, (_, value) =>
    Array.isArray(value) ? [...value].sort() : value
  );
  return `${providerURL}:${method}:${canonical}`;
}

/**
 * Wraps the open-ranking SDK client, exposing all its methods and caching
 * responses by (provider, method, request). TTL is taken from the response
 * when present, otherwise defaults to 5 minutes.
 */
class Ranker {
  #client      = null;
  #providerURL = null;
  #cache    = new LRUCache({ max: 500, ttl: DEFAULT_TTL });

  async init(providerURL = DEFAULT_PROVIDER_URL, { timeout = DEFAULT_TIMEOUT } = {}) {
    this.#client      = await Client.create(providerURL, { timeout });
    this.#providerURL = providerURL;
    console.log("Open-ranking client initialized at %s", providerURL);
  }

  async #cachedCall(method, r, signal) {
    const key = cacheKey(this.#providerURL, method, r);
    const cached = this.#cache.get(key);
    if (cached) {
      return cached;
    }

    const response = await this.#client[method](r, { signal });
    const ttl = response.ttl ? response.ttl * 1000 : DEFAULT_TTL;
    this.#cache.set(key, response, { ttl });
    return response;
  }

  get capabilities() {
    return this.#client.capabilities;
  }

  async refreshCapabilities({ signal } = {}) {
    return this.#client.refreshCapabilities({ signal });
  }

  async statsPubkey(r, { signal } = {}) {
    return this.#cachedCall('statsPubkey', r, signal);
  }

  async rankPubkeys(r, { signal } = {}) {
    return this.#cachedCall('rankPubkeys', r, signal);
  }

  async recommendPubkeys(r, { signal } = {}) {
    return this.#cachedCall('recommendPubkeys', r, signal);
  }

  async searchPubkeys(r, { signal } = {}) {
    return this.#cachedCall('searchPubkeys', r, signal);
  }

  async followers(r, { signal } = {}) {
    return this.#cachedCall('followers', r, signal);
  }

  async muters(r, { signal } = {}) {
    return this.#cachedCall('muters', r, signal);
  }

  async compromisedPubkeys(r, { signal } = {}) {
    return this.#cachedCall('compromisedPubkeys', r, signal);
  }
}

export const ranker = new Ranker();
