import { browser } from '$app/environment';

const STORAGE_KEY = 'npub.world.settings';

const DEFAULTS = {
  provider:   '',     // '' = use the default provider
  theme:      'dark',
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    provider:   settings.provider,
    theme:      settings.theme,
    algorithms: settings.algorithms,
  }));
}

export const settings = $state(load());

export function setTheme(theme) {
  settings.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  save();
}

export function toggleTheme() {
  setTheme(settings.theme === 'dark' ? 'light' : 'dark');
}

export function setProvider(url) {
  settings.provider = url;
  save();
}

export function setAlgo(endpoint, algoId) {
  settings.algorithms[endpoint] = algoId;
  save();
}
