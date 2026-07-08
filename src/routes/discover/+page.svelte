<script>
  import { deserialize } from '$app/forms';
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
  import { onEsc } from '$lib/events';
  import Logo from '$lib/components/Logo.svelte';
  import ProfileCard from './ProfileCard.svelte';

  let { data, form } = $props();

  let profiles = $state(form?.profiles ?? data.profiles);
  let selectedAlgo = $state(data.algorithms[0] ?? null);
  let showModal = $state(false);
  let loading = $state(false);

  function openModal() { showModal = true; }
  function closeModal() { showModal = false; }

  async function selectAlgo(algo) {
    selectedAlgo = algo;
    closeModal();
    loading = true;

    const params = new FormData();
    params.set('algorithm', algo.id);

    const response = await fetch('?/recommend', { method: 'POST', body: params });
    const result = deserialize(await response.text());
    if (result.data?.profiles) profiles = result.data.profiles;

    loading = false;
  }

  onMount(() => { if (browser) document.addEventListener('keydown', onEsc(closeModal)); });
  onDestroy(() => { if (browser) document.removeEventListener('keydown', onEsc(closeModal)); });
</script>

<svelte:head>
  <title>Discover – npub.world</title>
</svelte:head>

<div class="centered">
  <Logo />

  <div class="top-section">
    <h1 class="title">Discover</h1>
    <p class="subtitle">Discover Nostr through a new pair of eyes. Yours.</p>
  </div>

  {#if profiles?.length}
    <div class="grid-wrapper">
      <div class="grid-header">
        <button class="pill" onclick={openModal} disabled={loading}>
          {loading ? 'Loading…' : `Discovered with ${selectedAlgo?.name ?? selectedAlgo?.id ?? ''}`}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <div class="grid">
        {#each profiles as profile}
          <ProfileCard {profile} />
        {/each}
      </div>
    </div>
  {/if}
</div>

{#if showModal}
  <div
    class="modal-overlay"
    role="button"
    tabindex="0"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? closeModal() : null}
    aria-label="Close modal"
  >
    <div class="modal" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <p class="modal-title">Algorithm</p>
        <button class="close-button" onclick={closeModal} aria-label="Close">✕</button>
      </div>

      {#each data.algorithms as algo}
        <button
          class="algo-option"
          class:selected={selectedAlgo?.id === algo.id}
          onclick={() => selectAlgo(algo)}
        >
          <span class="algo-name">{algo.name}</span>
          {#if algo.description}
            <span class="algo-desc">{algo.description}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .centered {
    margin: 0 auto;
    max-width: 700px;
  }

  .top-section {
    text-align: center;
    padding-top: 1rem;
    padding-bottom: 2rem;
  }

  .title {
    font-size: 2.5rem;
    font-weight: 600;
    letter-spacing: 1.5px;
    margin: 0;
  }

  .subtitle {
    color: var(--secondary-text);
    margin-top: 0.5rem;
  }

  .grid-wrapper {
    width: 1100px;
    max-width: calc(100vw - 2rem);
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }

  .grid-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.6rem;
    padding: 0 0.25rem;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: var(--secondary-text);
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 999px;
    padding: 4px 10px;
    cursor: pointer;
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

  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay-color);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .modal {
    background: var(--card-background);
    box-shadow: var(--shadow-elevation-modal);
    padding: 1rem;
    border-radius: 12px;
    width: 80%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .modal-title {
    margin: 10px;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--secondary-text);
  }

  .close-button {
    background: none;
    border: none;
    color: var(--primary-text);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
  }

  .algo-option {
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
    background: var(--border-color);
  }

  .algo-name {
    font-size: 1rem;
    color: var(--primary-text);
  }

  .algo-desc {
    font-size: 0.75rem;
    color: var(--secondary-text);
    margin-top: 2px;
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 700px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 540px) {
    .grid { grid-template-columns: repeat(1, 1fr); }
  }
</style>
