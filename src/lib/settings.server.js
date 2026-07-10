import { DEFAULT_PROVIDER_URL } from '$lib/open-ranking.js';

const COOKIE_KEY = 'npub_world_settings';

function parse(cookies) {
  try {
    return JSON.parse(decodeURIComponent(cookies.get(COOKIE_KEY) ?? '{}'));
  } catch {
    return {};
  }
}

/**
 * Reads and returns all user settings from the request cookie.
 * Use this in +layout.server.js to make settings available to all child pages,
 * or directly in actions (which can't use parent()).
 */
export function getSettings(cookies) {
  const stored = parse(cookies);
  return {
    provider:   stored?.provider   || DEFAULT_PROVIDER_URL,
    algorithms: stored?.algorithms ?? {},
  };
}
