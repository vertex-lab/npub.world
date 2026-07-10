<script>
  import { invalidateAll } from '$app/navigation';
  import { settings, setProvider, setAlgo, setTheme } from '$lib/settings.svelte.js';
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

    <!-- Support -->
    <div class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Enjoying npub.world?</h2>
          <p class="section-subtitle">If it helped you discover awesome people, consider showing some love</p>
        </div>
        <div class="support-links">
          <a href="https://github.com/vertex-lab/npub.world" target="_blank" rel="noopener noreferrer" class="support-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Star us on Github
          </a>
          <a href="/npub176p7sup477k5738qhxx0hk2n0cty2k5je5uvalzvkvwmw4tltmeqw7vgup" class="support-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>
            </svg>
            Zap me a coffee
          </a>
        </div>
      </div>
    </div>

    <div class="separator"></div>

    <!-- Theme -->
    <div class="section">
      <h2 class="section-title">Theme</h2>
      <p class="section-subtitle">Customize the theme and make the app truly yours</p>
      <div class="theme-picker">
        <button
          class="theme-card"
          class:selected={settings.theme === 'carbon'}
          onclick={() => setTheme('carbon')}
          aria-label="Carbon theme"
        >
          <div class="theme-preview">
            <img src="/themes/carbon.jpg" alt="Carbon" />
          </div>
          <span class="theme-label">Carbon</span>
        </button>
        <button
          class="theme-card"
          class:selected={settings.theme === 'snow'}
          onclick={() => setTheme('snow')}
          aria-label="Snow theme"
        >
          <div class="theme-preview">
            <img src="/themes/snow.jpg" alt="Snow" />
          </div>
          <span class="theme-label">Snow</span>
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
    padding: 1rem 0.25rem;
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

  /* Theme picker */
  .theme-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    width: 180px;
  }

  @media (max-width: 576px) {
    .theme-card {
      width: calc(50% - 0.5rem);
    }
  }

  .theme-preview {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    transition: border-color 0.2s ease;
  }

  .theme-card:hover .theme-preview {
    border-color: var(--secondary-text);
  }

  .theme-card.selected .theme-preview {
    border-color: var(--primary-text);
  }

  .theme-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .theme-label {
    font-size: 0.75rem;
    color: var(--secondary-text);
  }

  .theme-card.selected .theme-label {
    color: var(--primary-text);
    font-weight: 600;
  }

  /* Algo pill */
  @media (max-width: 576px) {
    .section-header:not(.section-header--inline) {
      flex-direction: column;
      align-items: flex-start;
    }

    .provider-input {
      width: 100%;
    }
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
    white-space: nowrap;
    flex-shrink: 0;
    transition: color 0.15s, border-color 0.15s;
  }

  .pill:hover {
    color: var(--primary-text);
    border-color: var(--secondary-text);
  }

  .support-links {
    display: flex;
    flex-direction: row;
    gap: 1.5rem;
    margin-top: 0.75rem;
  }

  .support-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--secondary-text);
    text-decoration: none;
    transition: color 0.15s;
  }

  .support-link:hover {
    color: var(--primary-text);
  }
</style>
