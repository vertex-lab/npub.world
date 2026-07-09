<script>
  import { invalidateAll } from '$app/navigation';
  import { settings, setProvider, setAlgo, toggleTheme } from '$lib/settings.svelte.js';
  import { auth, login, logout } from '$lib/auth.svelte.js';
  import ProfileHeader from '$lib/components/ProfileHeader.svelte';
  import AlgoModal from '$lib/components/AlgoModal.svelte';

  let loginError = $state('');
  let loginLoading = $state(false);
  let showSearchModal = $state(false);
  let showDiscoverModal = $state(false);

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

  let selectedSearchAlgo   = $derived(searchAlgos.find(a => a.id === settings.algorithms['/search/pubkeys'])    ?? searchAlgos[0]   ?? null);
  let selectedDiscoverAlgo = $derived(discoverAlgos.find(a => a.id === settings.algorithms['/recommend/pubkeys']) ?? discoverAlgos[0] ?? null);
</script>

{#if loginError}
  <div class="toast">{loginError}</div>
{/if}

{#if showSearchModal}
  <AlgoModal
    algorithms={searchAlgos}
    selected={selectedSearchAlgo}
    onselect={(algo) => { setAlgo('/search/pubkeys', algo.id); showSearchModal = false; }}
    onclose={() => showSearchModal = false}
  />
{/if}

{#if showDiscoverModal}
  <AlgoModal
    algorithms={discoverAlgos}
    selected={selectedDiscoverAlgo}
    onselect={(algo) => { setAlgo('/recommend/pubkeys', algo.id); showDiscoverModal = false; }}
    onclose={() => showDiscoverModal = false}
  />
{/if}

<svelte:head>
  <title>Settings – npub.world</title>
</svelte:head>

<div class="centered">
  <div class="card">

    <!-- Profile -->
    <ProfileHeader profile={data.user ?? { name: 'Not logged in', nip05: 'Log in to personalize your experience', picture: null, pictureURL: null }}>
      {#snippet action()}
        {#if data.user}
          <button class="action-btn" onclick={() => { logout(); invalidateAll(); }}>
            <span class="btn-text">Log out</span>
            <span class="btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m19 16-3 3"/><path d="M2 21a8 8 0 0 1 12.664-6.5"/><path d="M22 19h-6l3 3"/><circle cx="10" cy="8" r="5"/>
              </svg>
            </span>
          </button>
        {:else}
          <button class="action-btn" onclick={handleLogin} disabled={loginLoading}>
            <span class="btn-text">{loginLoading ? 'Wait…' : 'Log in'}</span>
            <span class="btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M19 16v6"/><path d="M22 19h-6"/>
              </svg>
            </span>
          </button>
        {/if}
      {/snippet}
    </ProfileHeader>

    <!-- Theme -->
    <div class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Theme</h2>
          <p class="section-subtitle">Customize the look to make it yours</p>
        </div>
        <button class="theme-toggle" onclick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
          {#if settings.theme === 'dark'}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7 12a5 5 0 1 1 5 5 5 5 0 0 1-5-5zm5-7a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1zm-1 15v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-2 0zm10-9h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zM3 13h1a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2zm14.657-5.657a1 1 0 0 0 .707-.293l.707-.707a1 1 0 1 0-1.414-1.414l-.707.707a1 1 0 0 0 .707 1.707zM5.636 16.95l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0-1.414-1.414zm11.314 0a1 1 0 0 0 0 1.414l.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 0zM5.636 7.05A1 1 0 0 0 7.05 5.636l-.707-.707a1 1 0 0 0-1.414 1.414z" fill="#d48319" stroke="none"/></svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 128 128"><path d="M77.849 82.92a32.765 32.765 0 0 1-17.59-60.411 41.663 41.663 0 1 0 45.232 45.232A32.736 32.736 0 0 1 77.849 82.92z" fill="#ffc82c" stroke="none"/></svg>
          {/if}
        </button>
      </div>
    </div>

    <div class="separator"></div>

    <!-- Provider -->
    <div class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Provider</h2>
          <p class="section-subtitle">Choose your open-ranking provider</p>
        </div>
        <input
          class="provider-input"
          list="provider-options"
          placeholder="Vertex (default)"
          value={settings.provider || ''}
          oninput={(e) => setProvider(e.target.value.trim())}
          spellcheck="false"
          autocomplete="off"
        />
        <datalist id="provider-options">
          <option value={DEFAULT_PROVIDER}>Vertex</option>
        </datalist>
      </div>
    </div>

    <div class="separator"></div>

    <!-- Search -->
    <div class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Search</h2>
          <p class="section-subtitle">Choose the algorithm to optimize your search experience</p>
        </div>
        {#if searchAlgos.length > 0}
          <button class="pill" onclick={() => showSearchModal = true}>
            {selectedSearchAlgo?.name ?? '—'}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>
            </svg>
          </button>
        {/if}
      </div>
    </div>

    <div class="separator"></div>

    <!-- Discover -->
    <div class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Discover</h2>
          <p class="section-subtitle">Choose the algorithm to power your discovery feed</p>
        </div>
        {#if discoverAlgos.length > 0}
          <button class="pill" onclick={() => showDiscoverModal = true}>
            {selectedDiscoverAlgo?.name ?? '—'}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>
            </svg>
          </button>
        {/if}
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
    color: var(--error, #e00055);
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

  /* Action button (login/logout) */
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

  .action-btn:hover { background: var(--border-color); }
  .action-btn:disabled { opacity: 0.6; cursor: default; }

  .btn-icon { display: none; align-items: center; }

  @media (max-width: 450px) {
    .action-btn { width: 40px; }
    .btn-text { display: none; }
    .btn-icon { display: flex; }
  }

  /* Sections */
  .section {
    padding: 1rem 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .section-title {
    font-size: 1rem;
    color: var(--primary-text);
    margin: 0;
  }

  .section-subtitle {
    font-size: 0.75rem;
    color: var(--secondary-text);
    margin-top: 0.4rem;
    margin-bottom: 0;
  }

  .separator {
    border-bottom: 1px solid var(--border-color);
  }

  /* Provider input */
  .provider-input {
    width: 200px;
    flex-shrink: 1;
    padding: 4px 10px;
    font-size: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 999px;
    background: var(--card-background);
    color: var(--secondary-text);
    box-sizing: border-box;
  }

  .provider-input:focus {
    outline: none;
    border-color: var(--secondary-text);
  }

  /* Theme toggle */
  .theme-toggle {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--secondary-text);
  }

  /* Algo pill */
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
    white-space: nowrap;
    flex-shrink: 0;
    transition: color 0.15s, border-color 0.15s;
  }

  .pill:hover {
    color: var(--primary-text);
    border-color: var(--secondary-text);
  }
</style>
