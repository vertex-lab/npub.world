<script>
  import { settings, setProvider, setAlgo, toggleTheme } from '$lib/settings.svelte.js';
  import PressableProfilePicture from '$lib/components/PressableProfilePicture.svelte';

  let { data } = $props();

  const DEFAULT_PROVIDER = 'https://ranking.vertexlab.io';

  let searchAlgos   = $derived(data.capabilities?.['/search/pubkeys']    ?? []);
  let discoverAlgos = $derived(data.capabilities?.['/recommend/pubkeys'] ?? []);

  let providerInput = $state(settings.provider || '');

  function onProviderChange(e) {
    setProvider(e.target.value.trim());
  }

  function onSearchAlgoChange(e) {
    setAlgo('/search/pubkeys', e.target.value);
  }

  function onDiscoverAlgoChange(e) {
    setAlgo('/recommend/pubkeys', e.target.value);
  }
</script>

<svelte:head>
  <title>Settings – npub.world</title>
</svelte:head>

<div class="centered">
  <div class="card">

    <!-- Profile section -->
    <div class="profile-section">
      <div class="avatar-wrapper">
        <PressableProfilePicture picture={null} pictureURL={null} />
      </div>

      <button class="login-button" disabled>
        Log in to personalize your experience
      </button>
    </div>

    <div class="separator"></div>

    <!-- Settings table -->
    <div class="settings-table">

      <div class="setting-row">
        <label for="provider">Provider</label>
        <div class="setting-control">
          <input
            id="provider"
            list="provider-options"
            placeholder="Vertex (default)"
            value={providerInput}
            oninput={onProviderChange}
            spellcheck="false"
            autocomplete="off"
          />
          <datalist id="provider-options">
            <option value={DEFAULT_PROVIDER}>Vertex</option>
          </datalist>
        </div>
      </div>

      <div class="setting-row">
        <label for="search-algo">Search</label>
        <div class="setting-control">
          <select id="search-algo" value={settings.algorithms['/search/pubkeys']} onchange={onSearchAlgoChange}>
            {#each searchAlgos as algo}
              <option value={algo.id}>{algo.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="setting-row">
        <label for="discover-algo">Discover</label>
        <div class="setting-control">
          <select id="discover-algo" value={settings.algorithms['/recommend/pubkeys']} onchange={onDiscoverAlgoChange}>
            {#each discoverAlgos as algo}
              <option value={algo.id}>{algo.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="setting-row">
        <label for="theme-toggle">Theme</label>
        <div class="setting-control">
          <button id="theme-toggle" class="theme-toggle" onclick={toggleTheme} title="Toggle dark/light mode" aria-label="Toggle theme">
            {#if settings.theme === 'dark'}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7 12a5 5 0 1 1 5 5 5 5 0 0 1-5-5zm5-7a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1zm-1 15v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-2 0zm10-9h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zM3 13h1a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2zm14.657-5.657a1 1 0 0 0 .707-.293l.707-.707a1 1 0 1 0-1.414-1.414l-.707.707a1 1 0 0 0 .707 1.707zM5.636 16.95l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0-1.414-1.414zm11.314 0a1 1 0 0 0 0 1.414l.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 0zM5.636 7.05A1 1 0 0 0 7.05 5.636l-.707-.707a1 1 0 0 0-1.414 1.414z" fill="#d48319" stroke="none"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 128 128"><path d="M77.849 82.92a32.765 32.765 0 0 1-17.59-60.411 41.663 41.663 0 1 0 45.232 45.232A32.736 32.736 0 0 1 77.849 82.92z" fill="#ffc82c" stroke="none"/></svg>
            {/if}
          </button>
        </div>
      </div>

    </div>
  </div>
</div>

<style>
  .centered {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .card {
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: var(--shadow-elevation-low);
    padding: 1.5rem;
  }

  /* Profile section */
  .profile-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .avatar-wrapper {
    flex-shrink: 0;
  }

  .avatar-wrapper :global(.profile-avatar) {
    --size: 150px;
  }

  .login-button {
    padding: 10px 20px;
    font-size: 0.9rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--card-background);
    color: var(--secondary-text);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .separator {
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 1.5rem;
  }

  /* Settings table */
  .settings-table {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  label {
    font-size: 0.9rem;
    color: var(--secondary-text);
    width: 80px;
    flex-shrink: 0;
  }

  .setting-control {
    flex: 1;
  }

  select,
  input {
    width: 100%;
    padding: 8px 12px;
    font-size: 0.9rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--card-background);
    color: var(--primary-text);
    box-sizing: border-box;
  }

  .theme-toggle {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: var(--secondary-text);
  }

  select:focus,
  input:focus {
    outline: none;
    border-color: var(--secondary-text);
  }

  @media (max-width: 576px) {
    .profile-section {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
</style>
