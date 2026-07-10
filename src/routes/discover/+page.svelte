<script>
  import { deserialize } from '$app/forms';
  import Logo from '$lib/components/Logo.svelte';
  import AlgoPill from '$lib/components/AlgoPill.svelte';
  import ProfileCard from './ProfileCard.svelte';

  let { data } = $props();

  let profiles = $state(data.profiles);
  let unsupported = $state(data.unsupported ?? false);
  let discoverAlgos = $derived(data.capabilities?.['/recommend/pubkeys'] ?? []);
  let loading = $state(false);
  let unsupportedProvider = $derived((() => { try { return new URL(data.provider ?? '').hostname; } catch { return data.provider ?? ''; } })());

  async function reload() {
    loading = true;

    const response = await fetch('?/recommend', { method: 'POST', body: new FormData() });
    const result = deserialize(await response.text());
    if (result.data?.profiles) profiles = result.data.profiles;
    if (result.data?.unsupported != null) unsupported = result.data.unsupported;

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
    <AlgoPill algorithms={discoverAlgos} endpoint="/recommend/pubkeys" {loading} onselect={reload} />
  </div>

  {#if unsupported}
    <p class="unsupported-notice">
      <strong>{unsupportedProvider}</strong> doesn't support Discovery.<br>
      To use this feature, change your provider from the <a href="/settings">settings</a>.
    </p>
  {:else if profiles?.length}
    <div class="grid-wrapper">
      <div class="grid">
        {#each profiles as profile}
          <ProfileCard {profile} />
        {/each}
      </div>
    </div>
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
    padding-bottom: 3rem;
  }

  .title {
    font-size: var(--font-hero);
    font-weight: var(--weight-bold);
    letter-spacing: 1.5px;
    margin: 0;
  }

  .unsupported-notice {
    text-align: center;
    color: var(--error);
    font-size: var(--font-body);
  }

  .unsupported-notice a {
    color: var(--error);
  }


  .subtitle {
    font-size: var(--font-body);
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
