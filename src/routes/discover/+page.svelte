<script>
  import { enhance } from '$app/forms';
  import Logo from '$lib/components/Logo.svelte';
  import ProfileCard from './ProfileCard.svelte';

  let { data, form } = $props();

  let profiles = $derived(form?.profiles ?? data.profiles);
  let loading = $state(false);
  let selectedAlgo = $state(data.algorithms[0] ?? null);
  let requiresPov = $derived(selectedAlgo?.pov === true);
</script>

<svelte:head>
  <title>Discover – npub.world</title>
</svelte:head>

<div class="centered">
  <Logo />

  <div class="top-section">
    <div class="title-row">
      <div class="gear-spacer"></div>
      <h1 class="title">Discover</h1>
      <button class="gear" aria-label="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
    <p class="subtitle">Discover Nostr through a new pair of eyes. Yours.</p>

    {#if data.algorithms.length > 0}
      <form
        class="bar"
        method="POST"
        action="?/recommend"
        use:enhance={() => {
          loading = true;
          return ({ update }) => { loading = false; update(); };
        }}
      >
        <input type="hidden" name="algorithm" value={selectedAlgo?.id ?? ''} />

        <div class="pills">
          {#each data.algorithms as algo}
            <button
              type="button"
              class:selected={selectedAlgo?.id === algo.id}
              onclick={() => selectedAlgo = algo}
            >{algo.id}</button>
          {/each}
        </div>

        {#if requiresPov}
          <input type="text" name="pubkey" placeholder="npub1… or hex pubkey" autocomplete="off" spellcheck="false" />
        {/if}

        <button type="submit" disabled={loading}>{loading ? 'Loading…' : 'Explore'}</button>
      </form>
    {/if}
  </div>

  {#if profiles?.length}
    <div class="grid">
      {#each profiles as profile}
        <ProfileCard {profile} />
      {/each}
    </div>
  {/if}

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
</div>

<style>
  .centered {
    margin: 0 auto;
    max-width: 700px;
  }

  .top-section {
    text-align: center;
    padding-top: 1rem;
    padding-bottom: 5rem;
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
    margin-bottom: 1.25rem;
  }

  .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--card-background);
    box-shadow: var(--shadow-elevation-low);
  }

  .pills {
    display: flex;
    gap: 8px;
  }

  .bar button {
    cursor: pointer;
    user-select: none;
    padding: 8px 14px;
    font-size: 0.9rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--card-background);
    color: var(--primary-text);
    transition: background 0.2s ease;
  }

  .bar button:hover,
  .bar button.selected {
    background: var(--border-color);
  }

  .bar button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .bar input[type="text"] {
    font-family: monospace;
    font-size: 0.9rem;
    padding: 8px 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--card-background);
    color: var(--primary-text);
    width: 260px;
  }

  .bar input[type="text"]:focus {
    outline: none;
    border-color: var(--secondary-text);
  }

  .title-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;
  }

  .gear-spacer {
    width: 20px;
    flex-shrink: 0;
  }

  .gear {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--secondary-text);
    display: flex;
    align-items: center;
    transition: color 0.15s;
    flex-shrink: 0;
  }

  .gear:hover {
    color: var(--primary-text);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    width: 1100px;
    max-width: calc(100vw - 2rem);
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }

  .error {
    margin: 0.75rem 1rem 0;
    color: var(--error, #e05);
    font-size: 0.875rem;
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 700px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 540px) {
    .grid {
      grid-template-columns: repeat(1, 1fr);
    }
  }
</style>
