<script>
  import AlgoModal from './AlgoModal.svelte';
  import { settings, setAlgo } from '$lib/settings.svelte.js';

  /**
   * @prop {Array}    algorithms  - List of algorithm objects for this endpoint.
   * @prop {string}   endpoint    - API endpoint key, e.g. '/search/pubkeys'.
   * @prop {boolean}  [loading]   - When true, shows "Loading…" and disables the button.
   * @prop {boolean}  [showLabel] - When true (default), shows the algo name alongside the icon.
   * @prop {Function} [onselect]  - Optional callback invoked after the algo is saved.
   */
  let { algorithms, endpoint, loading = false, showLabel = true, onselect } = $props();

  let selectedAlgo = $derived(
    algorithms.find(a => a.id === settings.algorithms[endpoint]) ?? algorithms[0] ?? null
  );
  let showModal = $state(false);

  async function handleSelect(algo) {
    setAlgo(endpoint, algo.id);
    showModal = false;
    await onselect?.(algo);
  }
</script>

{#if algorithms.length > 0}
  <button class="pill" class:icon-only={!showLabel} onclick={() => showModal = true} disabled={loading}>
    {#if showLabel}{loading ? 'Loading…' : (selectedAlgo?.name ?? selectedAlgo?.id ?? '')}{/if}
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>
    </svg>
  </button>
{/if}

{#if showModal}
  <AlgoModal
    {algorithms}
    selected={selectedAlgo}
    onselect={handleSelect}
    onclose={() => showModal = false}
  />
{/if}

<style>
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: var(--font-caption);
    color: var(--secondary-text);
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 999px;
    padding: 6px 10px;
  }

  .pill.icon-only {
    padding: 6px 6px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: color 0.15s, border-color 0.15s;
  }

  .pill:hover {
    color: var(--primary-text);
    border-color: var(--secondary-text);
  }

  .pill:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>
