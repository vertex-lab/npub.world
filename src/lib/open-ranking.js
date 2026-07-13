import { Client } from 'open-ranking';
import { LRUCache } from 'lru-cache';

export const DEFAULT_PROVIDER_URL = "https://ranking.vertexlab.io";

const DEFAULT_TIMEOUT      = 3000;
const CAPABILITIES_REFRESH = 1000 * 60 * 60; // 1 hour
const PROVIDERS_MAX     = 100;
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
 */
export class Ranker {
  // URL -> Client.
  #clients = new LRUCache({ max: PROVIDERS_MAX, ttl: PROVIDERS_TTL, updateAgeOnGet: true });

  // Response cache shared across all providers (key includes providerURL).
  #cache = new LRUCache({ max: CACHE_MAX_ENTRIES, ttl: CACHE_DEFAULT_TTL });

  async init() {
    const client = await Client.create(DEFAULT_PROVIDER_URL, { timeout: DEFAULT_TIMEOUT });
    this.#clients.set(DEFAULT_PROVIDER_URL, client);
    console.log("Open-ranking client initialized at %s", DEFAULT_PROVIDER_URL);

    setInterval(() => this.#refreshAll(), CAPABILITIES_REFRESH);
  }

  async #refreshAll() {
    for (const [url, client] of this.#clients.entries()) {
      try {
        await client.refreshCapabilities();
      } catch (err) {
        console.warn(`Failed to refresh capabilities for ${url}:`, err.message);
      }
    }
    console.log("Capabilities refreshed for all providers");
  }

  add(url, caps) {
    this.#clients.set(url, Client.fromCapabilities(url, caps, { timeout: DEFAULT_TIMEOUT }));
    console.log("ranker added provider '%s'", url);
  }

  async #resolveClient(providerURL = DEFAULT_PROVIDER_URL) {
    if (!this.#clients.has(providerURL)) {
      const client = await Client.create(providerURL, { timeout: DEFAULT_TIMEOUT });
      this.#clients.set(providerURL, client);
    }
    return this.#clients.get(providerURL);
  }

  async #cachedCall(providerURL = DEFAULT_PROVIDER_URL, method, r, signal, options) {
    const key = cacheKey(providerURL, method, r);
    const cached = this.#cache.get(key);
    if (cached) return cached;

    const client = await this.#resolveClient(providerURL);
    const response = await client[method](r, { signal, options });

    let ttl = CACHE_DEFAULT_TTL;
    if (method === 'compromisedPubkeys') ttl = 0;
    else if (response.ttl) ttl = response.ttl * 1000;

    this.#cache.set(key, response, { ttl });
    return response;
  }

  capabilities(providerURL = DEFAULT_PROVIDER_URL) {
    return this.#clients.get(providerURL)?.capabilities ?? null;
  }

  async statsPubkey(provider = DEFAULT_PROVIDER_URL, r, { signal, options } = {}) {
    return this.#cachedCall(provider, 'statsPubkey', r, signal, options);
  }

  async rankPubkeys(provider = DEFAULT_PROVIDER_URL, r, { signal, options } = {}) {
    return this.#cachedCall(provider, 'rankPubkeys', r, signal, options);
  }

  async recommendPubkeys(provider = DEFAULT_PROVIDER_URL, r, { signal, options } = {}) {
    return this.#cachedCall(provider, 'recommendPubkeys', r, signal, options);
  }

  async searchPubkeys(provider = DEFAULT_PROVIDER_URL, r, { signal, options } = {}) {
    return this.#cachedCall(provider, 'searchPubkeys', r, signal, options);
  }

  async followers(provider = DEFAULT_PROVIDER_URL, r, { signal, options } = {}) {
    return this.#cachedCall(provider, 'followers', r, signal, options);
  }

  async muters(provider = DEFAULT_PROVIDER_URL, r, { signal, options } = {}) {
    return this.#cachedCall(provider, 'muters', r, signal, options);
  }

  async compromisedPubkeys(provider = DEFAULT_PROVIDER_URL, r, { signal, options } = {}) {
    return this.#cachedCall(provider, 'compromisedPubkeys', r, signal, options);
  }
}

export const ranker = new Ranker();

const NETWORK_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']);

/**
 * Returns a user-friendly error message for provider call failures.
 * Network-level errors (unreachable provider) get a clear nudge to check
 * the provider setting; everything else falls back to the raw message.
 */
export function isNetworkError(err) {
  const code = err?.cause?.code ?? err?.code;
  return NETWORK_CODES.has(code) || err?.message === 'fetch failed';
}
