<script>
  import Logo from '$lib/components/Logo.svelte';
  import ProfileCard from './ProfileCard.svelte';

  let { data, form } = $props();

  let profiles = $derived(form?.profiles ?? data.profiles);
</script>

<svelte:head>
  <title>Explore – npub.world</title>
</svelte:head>

<div class="centered">
  <Logo />

  <div class="top-section">
    <h1 class="title">Explore</h1>
    <p class="subtitle">Discover Nostr through a new pair of eyes. Yours.</p>
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
    max-width: 1100px;
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
    margin: 0 auto;
  }

  .subtitle {
    color: var(--secondary-text);
    margin-top: 0.5rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    padding: 0 1rem;
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

  @media (max-width: 560px) {
    .grid {
      grid-template-columns: repeat(1, 1fr);
    }
  }
</style>
