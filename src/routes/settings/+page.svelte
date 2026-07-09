<script>
  import { invalidateAll } from '$app/navigation';
  import { settings, setProvider, setAlgo, toggleTheme } from '$lib/settings.svelte.js';
  import { auth, login, logout } from '$lib/auth.svelte.js';
  import ProfileHeader from '$lib/components/ProfileHeader.svelte';

  let loginError = $state('');
  let loginLoading = $state(false);

  async function handleLogin() {
    loginError = '';
    loginLoading = true;
    try {
      await login();
      await invalidateAll();
    } catch (e) {
      loginError = e.message;
      setTimeout(() => loginError = '', 3000);
    } finally {
      loginLoading = false;
    }
  }

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

{#if loginError}
  <div class="toast">{loginError}</div>
{/if}

<svelte:head>
  <title>Settings – npub.world</title>
</svelte:head>

<div class="centered">
  <div class="card">

    <!-- Profile section -->
    <ProfileHeader profile={data.user ?? { name: 'Not logged in', nip05: 'Log in to personalize your experience', picture: null, pictureURL: null }}>
      {#snippet action()}
        {#if data.user}
          <button class="action-btn" onclick={() => { logout(); invalidateAll(); }}>
            <span class="btn-text">Log out</span>
            <span class="btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m19 16-3 3"/>
                <path d="M2 21a8 8 0 0 1 12.664-6.5"/>
                <path d="M22 19h-6l3 3"/>
                <circle cx="10" cy="8" r="5"/>
              </svg>
            </span>
          </button>
        {:else}
          <button class="action-btn" onclick={handleLogin} disabled={loginLoading}>
            <span class="btn-text">{loginLoading ? 'Wait…' : 'Log in'}</span>
            <span class="btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 21a8 8 0 0 1 13.292-6"/>
                <circle cx="10" cy="8" r="5"/>
                <path d="M19 16v6"/>
                <path d="M22 19h-6"/>
              </svg>
            </span>
          </button>
        {/if}
      {/snippet}
    </ProfileHeader>

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
  .toast {
    position: fixed;
    top: 33%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    text-align: center;
    color: var(--error);
    font-size: 0.9rem;
    z-index: 9999;
    pointer-events: none;
  }

  .centered {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .card {
    background-color: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: var(--shadow-elevation-medium);
    padding: 1rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 90px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    border: 1px solid var(--border-color);
    background-color: var(--card-background);
    color: var(--primary-text);
    font-size: 0.9rem;
    transition: background 0.2s ease;
  }

  .action-btn:hover {
    background: var(--border-color);
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .btn-icon {
    display: none;
    align-items: center;
  }

  @media (max-width: 450px) {
    .action-btn {
      width: 40px;
    }
    .btn-text {
      display: none;
    }
    .btn-icon {
      display: flex;
    }
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


</style>
