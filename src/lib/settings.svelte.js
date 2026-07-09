import { browser } from '$app/environment';

const STORAGE_KEY = 'npub.world.settings';
const COOKIE_KEY  = 'npub_world_settings';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const DEFAULTS = {
  provider:   '',     // '' = use the default provider
  theme:      'carbon',
  algorithms: {
    '/search/pubkeys':    '',
    '/recommend/pubkeys': '',
  },
};

function load() {
  if (!browser) return structuredClone(DEFAULTS);
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? structuredClone(DEFAULTS);
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function save() {
  if (!browser) return;
  const value = JSON.stringify({
    provider:   settings.provider,
    theme:      settings.theme,
    algorithms: settings.algorithms,
  });
  localStorage.setItem(STORAGE_KEY, value);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export const settings = $state(load());

export function setTheme(theme) {
  settings.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  console.log('setTheme', theme);
  save();
}

export function setProvider(url) {
  settings.provider = url;
  save();
}

export function setAlgo(endpoint, algoId) {
  settings.algorithms[endpoint] = algoId;
  save();
}

export function resetAlgos() {
  settings.algorithms = structuredClone(DEFAULTS.algorithms);
  save();
}
