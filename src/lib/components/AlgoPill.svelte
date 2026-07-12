<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth.svelte.js';
  import Modal from './Modal.svelte';
  import { settings, setAlgo } from '$lib/settings.svelte.js';

  /**
   * @prop {Array}    algorithms  - List of algorithm objects for this endpoint.
   * @prop {string}   endpoint    - API endpoint key, e.g. '/search/pubkeys'.
   * @prop {boolean}  [loading]   - When true, shows "Loading…" and disables the button.
   * @prop {boolean}  [showLabel] - When true (default), shows the algo name alongside the icon.
   * @prop {boolean}  [accent]    - When true (default), uses the blue accent style.
   * @prop {Function} [onselect]  - Optional callback invoked after the algo is saved.
   */
  let { algorithms, endpoint, loading = false, showLabel = true, accent = true, onselect } = $props();

  const SUBTITLES = {
    '/search/pubkeys':    'Choose the algorithm to optimize your search experience',
    '/recommend/pubkeys': 'Choose the algorithm to power your discovery feed',
  };
  const subtitle = SUBTITLES[endpoint] ?? '';

  let selectedAlgo = $derived(
    algorithms.find(a => a.id === settings.algorithms[endpoint]) ?? algorithms[0] ?? null
  );
  let showModal = $state(false);

  function requiresPov(algo) {
    return algo.pov === true;
  }

  async function handleSelect(algo) {
    if (requiresPov(algo) && !auth.nwt) {
      showModal = false;
      if ($page.url.pathname !== '/settings') goto('/settings');
    } else {
      setAlgo(endpoint, algo.id);
      showModal = false;
      await onselect?.(algo);
    }
  }
</script>

{#if algorithms.length > 0}
  <button type="button" class="pill" class:icon-only={!showLabel} class:accent onclick={() => showModal = true} disabled={loading}>
    {#if showLabel}{loading ? 'Loading…' : (selectedAlgo?.name ?? selectedAlgo?.id ?? '')}{/if}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>
    </svg>
  </button>
{:else}
  <button type="button" class="pill" class:icon-only={!showLabel} disabled>
    {#if showLabel}Unsupported{/if}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>
    </svg>
  </button>
{/if}

{#if showModal}
  <Modal title="Algorithms" {subtitle} onclose={() => showModal = false}>
    {#each algorithms as algo}
      <button
        class="algo-option"
        class:selected={selectedAlgo?.id === algo.id}
        onclick={() => handleSelect(algo)}
      >
        <span class="algo-name">{algo.name}</span>
        {#if requiresPov(algo)}
          <span class="requires-login">requires login</span>
        {/if}
        {#if algo.description}
          <span class="algo-desc">{algo.description}</span>
        {/if}
      </button>
    {/each}
  </Modal>
{/if}

<style>
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: var(--font-body);
    color: var(--secondary-text);
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 999px;
    padding: 6px 10px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    box-shadow: var(--shadow-elevation-low);
    transition: color 0.15s, border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }

  .pill.icon-only {
    padding: 6px;
  }

  .pill:hover {
    color: var(--primary-text);
    border-color: var(--secondary-text);
    box-shadow: var(--shadow-elevation-medium);
  }

  .pill.accent {
    color: var(--blue-accent-text);
    border-color: color-mix(in srgb, var(--blue-accent-text) 35%, transparent);
  }

  .pill.accent:hover {
    background: var(--blue-accent);
    border-color: var(--blue-accent-text);
  }

  .pill:disabled {
    opacity: 0.6;
    cursor: default;
    pointer-events: none;
  }

  .algo-option {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .algo-option:hover,
  .algo-option.selected {
    background-color: var(--highlight-color);
  }

  .algo-name {
    font-size: var(--font-body);
    font-weight: var(--weight-bold);
    color: var(--primary-text);
  }

  .algo-desc {
    font-size: var(--font-body);
    color: var(--secondary-text);
    margin-top: 0.4rem;
  }

  .requires-login {
    position: absolute;
    top: 10px;
    right: 12px;
    font-size: var(--font-caption);
    color: var(--secondary-text);
    cursor: pointer;
    transition: color 0.15s;
  }

  .requires-login:hover {
    color: var(--primary-text);
  }
</style>
