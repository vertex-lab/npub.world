<script>
  import { decode } from "nostr-tools/nip19";
  import CopyText from "./CopyPill.svelte";
  import Follower from "./Follower.svelte";
  import FlexTable from "./FlexTable.svelte";
  import SearchBox from "$lib/components/SearchBox.svelte";

  let { data, error } = $props();

  let title = $state("");

  $effect(() => {
    title = data.name ?? data.npub;
  });
</script>

<svelte:head>
  <title>{title} - npub.world</title>
</svelte:head>

<div class="container">
  <header class="header">
    <div class="logo-wrapper">
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <a href="/">
        <div class="theme-logo theme-logo-small"></div>
      </a>
    </div>

    <div class="search-container">
      <SearchBox results={[]} />
    </div>
  </header>

  {#if data.error}
    <main>
      <div class="card">
        <h2>Error</h2>
        {data.error}
      </div>
    </main>
  {:else if Object.keys(data).length === 0}
    <main>
      <div class="card">
        <h2>Profile not found</h2>
      </div>
    </main>
  {:else}
    <main>
      <div class="profile-card card">
        <div class="profile-header">
          <div class="profile-avatar">
            <img src={data.picture} alt="Profile Avatar" />
          </div>
          <div class="profile-identity">
            <h1 class="profile-name">{data.name}</h1>
            <p class="profile-handle">{@html data.nip05 ?? "&nbsp;"}</p>
            <div class="profile-stats">
              <span>Following:</span> <span class="stat">{data.following}</span>
              <span>Reputable followers:</span>
              <span class="stat">{data.followers}</span>
            </div>
          </div>
          <div class="profile-actions"></div>
        </div>

        <div class="profile-details">
          <FlexTable profile={data} />
        </div>

        <div class="followers-card">
          <h2 class="section-title">Top Reputable Followers:</h2>
          <div class="followers-grid">
            {#each data.reputable as profile}
              <Follower {profile} />
            {/each}
          </div>
        </div>
        <div class="followers-card">
          <h2 class="section-title">Open with:</h2>
          <div class="followers-grid">
            <div class="app" target="_blank">
              <a href={"nostr:" + data.npub}>Default app</a>
            </div>
            <div class="app">
              <a href={"https://nostrudel.ninja/#/u/" + data.npub}>Nostrudel</a>
            </div>
            <div class="app">
              <a
                href={"https://coracle.social/" + data.npub}
                target="_blank"
                rel="noopener noreferrer">Coracle</a
              >
            </div>
            <div class="app">
              <a
                href={"https://primal.net/p/" + data.npub}
                target="_blank"
                rel="noopener noreferrer">Primal</a
              >
            </div>
            <div class="app">
              <a
                href={"https://snort.social/" + data.npub}
                target="_blank"
                rel="noopener noreferrer">Snort</a
              >
            </div>
            <div class="app">
              <a
                href={"https://nosta.me/" + data.npub}
                target="_blank"
                rel="noopener noreferrer">Nosta</a
              >
            </div>
          </div>
        </div>
      </div>
    </main>
  {/if}
</div>

<style>
  @import "../../../static/shared.css";

  .followers-card {
    margin-top: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .logo-wrapper {
    flex-shrink: 0;
    margin-right: 1rem;
  }

  .theme-logo-small {
    width: 110px;
    height: 110px;
    margin: -1.5rem;
  }

  .search-container {
    flex-grow: 1;
    flex-shrink: 1;
    max-width: calc(100% - 70px);
    box-sizing: border-box;
  }

  .profile-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 1.5rem;
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-identity {
    flex-grow: 1;
  }

  .profile-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 4px 0;
    margin-top: 0.8rem; /* TEMP */
  }

  .profile-handle {
    font-size: 0.95rem;
    color: var(--light-text);
    margin: 0 0 12px 0;
  }

  .profile-stats {
    color: var(--secondary-text);
    font-size: 0.9rem;
  }

  .stat {
    font-weight: bold;
    margin-right: 1rem;
  }

  .profile-actions {
    display: flex;
    gap: 8px;
  }

  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0 0 2rem 0;
    color: var(--secondary-text);
  }

  .followers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .app {
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .app a {
    color: var(--primary-color);
    text-decoration: none;
  }

  /* Responsive styles */
  /* Small screens (mobile) */
  @media (max-width: 576px) {
    .container {
      padding: 1rem;
    }

    .header {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-wrapper {
      margin-right: 0.5rem;
    }

    .search-container {
      max-width: calc(100% - 45px);
    }

    .profile-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-bottom: 0;
    }

    .profile-avatar {
      margin-right: 0;
      margin-bottom: 1rem;
    }

    .profile-identity {
      margin-bottom: 1rem;
      text-align: center;
    }

    .profile-name {
      margin-top: 0; /* TEMP */
    }

    .profile-actions {
      width: 100%;
      justify-content: center;
    }

    .followers-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }

  /* Medium screens (tablet) */
  @media (min-width: 577px) and (max-width: 992px) {
    .container {
      padding: 1.5rem;
    }

    .header {
      flex-direction: row;
      margin-bottom: 1.5rem;
    }

    .logo-wrapper {
      margin-right: 1rem;
    }

    .search-container {
      max-width: calc(100% - 60px);
    }

    .profile-header {
      flex-wrap: wrap;
    }

    .profile-identity {
      width: calc(100% - 100px - 1.5rem);
    }

    .profile-actions {
      margin-top: 1rem;
      width: 100%;
      justify-content: flex-end;
    }

    .followers-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
  }

  /* Large screens (desktop) */
  @media (min-width: 993px) {
    .header {
      flex-direction: row;
      justify-content: space-between;
    }

    .search-container {
      max-width: calc(100% - 80px);
    }

    .followers-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
</style>
