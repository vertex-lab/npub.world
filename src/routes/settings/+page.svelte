<script>
  import { invalidateAll } from '$app/navigation';
  import { settings, setTheme } from '$lib/settings.svelte.js';
  import { auth, login, logout } from '$lib/auth.svelte.js';
  import ProfileHeader from '$lib/components/ProfileHeader.svelte';
  import AlgoPill from '$lib/components/AlgoPill.svelte';
  import ProviderPill from '$lib/components/ProviderPill.svelte';

  let loginError = $state('');
  let loginLoading = $state(false);

  async function handleLogin() {
    loginError = '';
    loginLoading = true;
    try {
      await login(settings.provider);
      await invalidateAll();
    } catch (e) {
      loginError = e.message;
      setTimeout(() => loginError = '', 3000);
    } finally {
      loginLoading = false;
    }
  }

  let { data } = $props();

  let searchAlgos   = $derived(data.capabilities?.['/search/pubkeys']    ?? []);
  let discoverAlgos = $derived(data.capabilities?.['/recommend/pubkeys'] ?? []);
</script>

{#if loginError}
  <div class="toast">{loginError}</div>
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
      <p class="section-title">Love it?</p>
      <p class="section-subtitle">You can help us improve and grow</p>
      <div class="support-links">
          <a href="https://github.com/vertex-lab/npub.world" target="_blank" rel="noopener noreferrer" class="support-link">
            <svg width="25" height="25" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.29183 21V18.4407L9.3255 16.6219C9.36595 16.0561 9.58639 15.5228 9.94907 15.11C9.95438 15.1039 9.95972 15.0979 9.9651 15.0919C9.9791 15.0763 9.96988 15.0511 9.94907 15.0485V15.0485C7.52554 14.746 5.0005 13.7227 5.0005 9.26749C4.9847 8.17021 5.3427 7.10648 6.00437 6.27215C6.02752 6.24297 6.05103 6.21406 6.07492 6.18545V6.18545C6.10601 6.1482 6.11618 6.09772 6.10194 6.05134C6.10107 6.04853 6.10021 6.04571 6.09935 6.04289C6.0832 5.9899 6.06804 5.93666 6.05388 5.88321C5.81065 4.96474 5.86295 3.98363 6.20527 3.09818C6.20779 3.09164 6.21034 3.08511 6.2129 3.07858C6.22568 3.04599 6.25251 3.02108 6.28698 3.01493V3.01493C6.50189 2.97661 7.37036 2.92534 9.03298 4.07346C9.08473 4.10919 9.13724 4.14609 9.19053 4.18418V4.18418C9.22901 4.21168 9.27794 4.22011 9.32344 4.20716C9.32487 4.20675 9.32631 4.20634 9.32774 4.20593C9.41699 4.18056 9.50648 4.15649 9.59617 4.1337C11.1766 3.73226 12.8234 3.73226 14.4038 4.1337C14.4889 4.1553 14.5737 4.17807 14.6584 4.20199C14.6602 4.20252 14.6621 4.20304 14.6639 4.20356C14.7174 4.21872 14.7749 4.20882 14.8202 4.17653V4.17653C14.8698 4.14114 14.9187 4.10679 14.967 4.07346C16.6257 2.92776 17.4894 2.9764 17.7053 3.01469V3.01469C17.7404 3.02092 17.7678 3.04628 17.781 3.07946C17.7827 3.08373 17.7843 3.08799 17.786 3.09226C18.1341 3.97811 18.1894 4.96214 17.946 5.88321C17.9315 5.93811 17.9159 5.9928 17.8993 6.04723V6.04723C17.8843 6.09618 17.8951 6.14942 17.9278 6.18875C17.9289 6.18998 17.9299 6.19121 17.9309 6.19245C17.9528 6.21877 17.9744 6.24534 17.9956 6.27215C18.6573 7.10648 19.0153 8.17021 18.9995 9.26749C18.9995 13.747 16.4565 14.7435 14.0214 15.015V15.015C14.0073 15.0165 14.001 15.0334 14.0105 15.0439C14.0141 15.0479 14.0178 15.0519 14.0214 15.0559C14.2671 15.3296 14.4577 15.6544 14.5811 16.0103C14.7101 16.3824 14.7626 16.7797 14.7351 17.1754V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M4 17C4.36915 17.0523 4.72159 17.1883 5.03065 17.3975C5.3397 17.6068 5.59726 17.8838 5.7838 18.2078C5.94231 18.4962 6.15601 18.7504 6.41264 18.9557C6.66927 19.161 6.96379 19.3135 7.27929 19.4043C7.59478 19.4952 7.92504 19.5226 8.25112 19.485C8.5772 19.4475 8.89268 19.3457 9.17946 19.1855" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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

    <div class="separator"></div>

    <!-- Theme -->
    <div class="section">
      <p class="section-title">Theme</p>
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
          <p class="section-title">Provider</p>
          <p class="section-subtitle">Choose your open-ranking provider</p>
        </div>
        <ProviderPill />
      </div>
    </div>

    <div class="separator"></div>

    <!-- Search -->
    <div class="section">
      <div class="section-header">
        <div>
          <p class="section-title">Search</p>
          <p class="section-subtitle">Choose the algorithm to optimize your search experience</p>
        </div>
        <AlgoPill algorithms={searchAlgos} endpoint="/search/pubkeys" accent={false} />
      </div>
    </div>

    <div class="separator"></div>

    <!-- Discover -->
    <div class="section">
      <div class="section-header">
        <div>
          <p class="section-title">Discover</p>
          <p class="section-subtitle">Choose the algorithm to power your discovery feed</p>
        </div>
        <AlgoPill algorithms={discoverAlgos} endpoint="/recommend/pubkeys" accent={false} />
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
    font-size: var(--font-body);
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
    font-size: var(--font-body);
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
    padding: 1.25rem 0.25rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .section-title {
    font-size: var(--font-body);
    font-weight: var(--weight-bold);
    color: var(--primary-text);
    margin: 0;
  }

  .section-subtitle {
    font-size: var(--font-body);
    color: var(--secondary-text);
    margin-top: 0.4rem;
    margin-bottom: 0;
  }

  .separator {
    border-bottom: 1px solid var(--border-color);
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
    font-size: var(--font-caption);
    color: var(--secondary-text);
  }

  .theme-card.selected .theme-label {
    color: var(--primary-text);
    font-weight: var(--weight-bold);
  }

  @media (max-width: 576px) {
    .section-header:not(.section-header--inline) {
      flex-direction: column;
      align-items: flex-start;
    }

  }

  .support-links {
    display: flex;
    flex-direction: row;
    gap: 1.5rem;
    margin-top: 1.25rem;
  }

  .support-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-body);
    color: var(--secondary-text);
    text-decoration: none;
    transition: color 0.15s;
  }

  .support-link:hover {
    color: var(--primary-text);
  }
</style>
