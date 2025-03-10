<script>
  let { data } = $props();

  let loading = $state(false);

  function handleSubmit() {
    loading = true;
  }

  $effect(() => {
    if (data) {
      loading = false;
    }
  });
</script>

<div class="container">
  <div class="logo-container">
    <img src="/logo.png" alt="logo" />
    <div class="logo-text">
      <span>NPUB</span>
      <span>.WORLD</span>
    </div>
  </div>

  <div class="search-container">
    <form action="/" method="GET" onsubmit={handleSubmit} class="search-box">
      <span class="search-icon"></span>
      <input type="text" name="q" placeholder="Search nostr profiles" />
      <!-- <button
          type="submit"
          id="searchButton"
          disabled={loading}
          class={loading ? "loading" : ""}
          >{loading ? "Searching..." : "Search"}</button
        > -->
    </form>
  </div>
  <div class="search-results">
    {#if data.data}
      {#each data.data as profile}
        <a href={"/" + profile.npub}>
          <div class="search-result">
            <div class="profile-img-small">
              <img src={profile.picture} alt="Profile" />
            </div>
            <div class="profile-info">
              <div class="profile-name">{profile.name}</div>
              {#if profile.nip05}
                <div class="profile-email">
                  {profile.nip05}
                </div>
              {/if}
            </div>
          </div>
        </a>
      {:else}
        <p>No profiles found</p>
      {/each}
    {:else}
      <p class="error">{data.error}</p>
    {/if}
  </div>
</div>

<style>
  .logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
  }

  .logo-text span {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--primary-text);
    line-height: 1.1;
  }

  .search-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin: 0 auto;
    width: 90%;
    max-width: 550px;
  }

  .search-box {
    width: 100%;
    box-sizing: border-box;
    position: relative;
  }

  .search-results {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    background-color: var(--card-background);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    /* max-height: 400px;
	overflow-y: auto; */
    border: 1px solid var(--border-color);
  }

  .search-result {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.2s;
  }

  .search-result:last-child {
    border-bottom: none;
  }

  .search-result:hover {
    background-color: var(--highlight-color);
    cursor: pointer;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
  }

  .profile-img-small {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .profile-img-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-info {
    flex-grow: 1;
    overflow: hidden;
  }

  .profile-name {
    font-weight: 500;
    color: var(--primary-text);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-email {
    font-size: 0.85rem;
    color: var(--light-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Override the shared.css styles for input to ensure it doesn't overflow */
  input[type="text"] {
    width: 100%;
    padding: 15px 15px 15px 40px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
  }

  /* Responsive styles */
  /* Small screens (mobile) */
  @media (max-width: 576px) {
    .container {
      padding: 1rem;
      box-sizing: border-box;
    }

    .header {
      gap: 1rem;
    }

    .logo-text span {
      font-size: 1.4rem;
    }

    .search-container {
      width: 90%;
      max-width: 320px;
    }

    input[type="text"] {
      padding: 12px 12px 12px 36px;
      font-size: 0.9rem;
    }
  }

  /* Medium screens (tablet) */
  @media (min-width: 577px) and (max-width: 992px) {
    .container {
      padding: 1.5rem;
    }

    .logo-container {
      margin-bottom: 1rem;
    }

    .logo-text span {
      font-size: 1.6rem;
    }

    .search-container {
      width: 75%;
      max-width: 500px;
    }
  }

  /* Large screens (desktop) */
  @media (min-width: 993px) {
    .logo-container {
      margin-bottom: 2rem;
    }

    .search-container {
      width: 550px;
      max-width: 550px;
    }

    .search-results {
      width: 75%;
      max-width: 500px;
    }
  }
</style>
