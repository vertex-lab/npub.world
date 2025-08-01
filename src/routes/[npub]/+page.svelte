<script>
  import { decode } from "nostr-tools/nip19";
  import InfoTable from "./InfoTable.svelte";
  import SearchBox from "$lib/components/SearchBox.svelte";
  import { onMount } from "svelte";
  import ProfilePicture from "$lib/components/ProfilePicture.svelte";
  import Checkmark from "$lib/components/Checkmark.svelte";
  import ProfileItem from "$lib/components/ProfileItem.svelte";

  let { data, error } = $props();
  let title = $state("");
  $effect(() => {title = data.name ?? data.npub;});

  let visibleFollowers = $state(0);
  onMount(() => {
    const width = window.innerWidth;
    if (width <= 576) {
      visibleFollowers = 5;   // for mobile
    } else if (width <= 992) {
      visibleFollowers = 9;   // for tablets
    } else {
      visibleFollowers = 10;  // for desktop
    }
  })

</script>

<svelte:head>
  <title>{title} - npub.world</title>
</svelte:head>

<div class="container">
  <header class="header">
    <div class="logo-wrapper">
      <a href="/" aria-label="Home">
        <div class="theme-logo theme-logo-small"></div>
      </a>
    </div>

    <div class="search-container">
      <SearchBox results={[]} />
    </div>
  </header>

  {#if error}
    <main>
      <div class="card">
        <h2>Error</h2>{error}
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
          <ProfilePicture source={data.picture} size="100px"></ProfilePicture>
          <div class="profile-identity">
            <h1 class="profile-name">
              {data.name}
              <Checkmark reputation={data.reputation} tooltip=true size={22}></Checkmark>
            </h1>
            <p class="profile-handle">{@html data.nip05 ?? "&nbsp;"}</p>
            <div class="profile-stats">
              <div class="stat-pair">
                <span>Following:</span>
                <span class="stat">{data.following}</span>
              </div>
              <div class="stat-pair">
                <span>Followers:</span>
                <span class="stat">{data.followers}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-details">
          <InfoTable profile={data} />
        </div>

        <div class="followers-card">
          <h2 class="section-title">Top Followers</h2>
          <div class="followers-grid">
            {#each data.topFollowers.slice(0, visibleFollowers) as profile}
              <ProfileItem {profile}/>
            {/each}
          </div>
        </div>

        <div class="followers-card">
          <h2 class="section-title">Open With</h2>
          <div class="app-grid">
            <div class="app" target="_blank">
              <a href={"nostr:" + data.npub}>Default App</a>
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

  .profile-identity {
    flex-grow: 1;
  }

  .profile-name {
    font-size: 1.5rem;
    vertical-align: middle;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
  }

  .profile-handle {
    font-size: 0.95rem;
    color: var(--light-text);
    margin: 0 0 12px 0;
  }

  .profile-stats {
    color: var(--secondary-text);
    font-size: 0.9rem;
    display: flex;
    gap: 1rem;
  }

  .stat-pair {
    display: flex;
    gap: 0.25rem;
  }

  .stat {
    font-weight: bold;
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
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
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
    white-space: nowrap;
  }

  .app-grid {
    display: grid;
    align-items: center;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 16px;
  }

  /* Responsive styles */
  /* Small screens (mobile) */
  @media (max-width: 576px) {
    .container {
      padding: 0rem;
      padding-bottom: 1rem;
    }

    .header {
      flex-direction: row;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 0.5rem;
    }

    .logo-wrapper {
      margin-right: 0.25rem;
    }

    .theme-logo-small {
    width: 80px;
    height: 80px;
    margin: -1rem;
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

    .profile-identity {
      margin-bottom: 1rem;
      text-align: center;
    }

    .profile-name {
      margin-top: 0;
    }

    .profile-stats {
    flex-wrap: nowrap;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .stat-pair {
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .followers-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}

  /* Medium screens (tablet) */
  @media (min-width: 577px) and (max-width: 992px) {
    .container {
      padding: 1rem;
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
      width: auto;
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
  }
</style>
