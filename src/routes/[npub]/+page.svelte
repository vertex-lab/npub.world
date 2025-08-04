<script>
  import { decode } from "nostr-tools/nip19";
  import InfoTable from "./InfoTable.svelte";
  import DetailedProfile from "./DetailedProfile.svelte"
  import SearchBox from "$lib/components/SearchBox.svelte";
  import { onMount } from "svelte";
  import ProfilePicture from "$lib/components/ProfilePicture.svelte";
  import ReputationBadge from "$lib/components/ReputationBadge.svelte";
  import PressableProfile from "$lib/components/PressableProfile.svelte";

  const { data } = $props();
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

  const apps = [
    { name: "Default App", href: `nostr:${data.npub}` },
    { name: "Nostrudel", href: `https://nostrudel.ninja/#/u/${data.npub}` },
    { name: "Coracle", href: `https://coracle.social/${data.npub}` },
    { name: "Primal", href: `https://primal.net/p/${data.npub}` },
    { name: "Snort", href: `https://snort.social/${data.npub}` },
    { name: "Nosta", href: `https://nosta.me/${data.npub}` },
  ];
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

  <main>
    <div class="card">

      <div>
        <DetailedProfile profile={data} />
      </div>

      <div class="profile-details">
        <InfoTable profile={data} />
      </div>

      <div class="section-card">
        <h2 class="section-title">Top Followers</h2>
        <div class="followers-grid">
          {#each data.topFollowers.slice(0, visibleFollowers) as profile}
            <PressableProfile {profile}/>
          {/each}
        </div>
      </div>

      <div class="section-card">
        <h2 class="section-title">Open With</h2>
        <div class="app-grid">
          {#each apps as app}
            <div class="app">
              <a href={app.href}
              target="_blank"
              rel="noopener noreferrer">{app.name}</a>
            </div>
          {/each}
        </div>
      </div>

    </div>
  </main>
</div>

<style>
  @import "../../../static/shared.css";

  .section-card {
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
