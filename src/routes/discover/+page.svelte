<script>
  import { deserialize } from '$app/forms';
  import Logo from '$lib/components/Logo.svelte';
  import AlgoModal from '$lib/components/AlgoModal.svelte';
  import ProfileCard from './ProfileCard.svelte';
  import { settings, setAlgo } from '$lib/settings.svelte.js';

  let { data, form } = $props();

  let profiles = $state(form?.profiles ?? data.profiles);
  let discoverAlgos = $derived(data.capabilities?.['/recommend/pubkeys'] ?? []);
  let selectedAlgo = $derived(
    discoverAlgos.find(a => a.id === settings.algorithms['/recommend/pubkeys']) ?? discoverAlgos[0] ?? null
  );
  let showModal = $state(false);
  let loading = $state(false);

  function openModal() { showModal = true; }
  function closeModal() { showModal = false; }

  async function selectAlgo(algo) {
    setAlgo('/recommend/pubkeys', algo.id);
    closeModal();
    loading = true;

    const params = new FormData();
    params.set('algorithm', algo.id);

    const response = await fetch('?/recommend', { method: 'POST', body: params });
    const result = deserialize(await response.text());
    if (result.data?.profiles) profiles = result.data.profiles;

    loading = false;
  }


</script>

<svelte:head>
  <title>Discover – npub.world</title>
</svelte:head>

<div class="centered">
  <Logo />

  <div class="top-section">
    <h1 class="title">Discover</h1>
    <p class="subtitle">Meet the people that make Nostr so special.</p>
    <button class="pill" onclick={openModal} disabled={loading}>
      {loading ? 'Loading…' : `${selectedAlgo?.name ?? selectedAlgo?.id ?? ''}`}
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>
      </svg>
    </button>
  </div>

  {#if profiles?.length}
    <div class="grid-wrapper">
      <div class="grid">
        {#each profiles as profile}
          <ProfileCard {profile} />
        {/each}
      </div>
    </div>
  {/if}
</div>

{#if showModal}
  <AlgoModal
    algorithms={discoverAlgos}
    selected={selectedAlgo}
    onselect={selectAlgo}
    onclose={closeModal}
  />
{/if}

<style>
  .centered {
    margin: 0 auto;
    max-width: 700px;
  }

  .top-section {
    text-align: center;
    padding-top: 1rem;
    padding-bottom: 3rem;
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
    margin-bottom: 0.75rem;
  }

  .grid-wrapper {
    width: 1100px;
    max-width: calc(100vw - 2rem);
    position: relative;
    left: 50%;
    transform: translateX(-50%);
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
