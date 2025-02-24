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

<div style="min-height: 30vh;">
  <div class="search-container">
    <form action="/" method="GET" onsubmit={handleSubmit}>
      <input
        type="text"
        name="q"
        id="searchInput"
        placeholder="Search nostr profile..."
      />
      <button
        type="submit"
        id="searchButton"
        disabled={loading}
        class={loading ? "loading" : ""}
        >{loading ? "Searching..." : "Search"}</button
      >
    </form>
  </div>

  <div class="results-container">
    {#if data.data}
      {#each data.data as profile}
        <div class="card">
          <a href={"/" + profile.npub} class="profile-container">
            <img src={profile.picture} alt="Profile" class="profile-picture" />
            <div class="profile-info">
              <strong>{profile.name}</strong>
            </div>
            {#if profile.nip05}
              <div class="nip05">
                ({profile.nip05})
              </div>
            {/if}
          </a>
        </div>
      {:else}
        <p>No profiles found</p>
      {/each}
    {/if}
  </div>
</div>

<style>
  form {
    margin: 0;
  }
  .card {
    background-color: white;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .search-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  #searchInput {
    font-size: 1.2rem;
    padding: 1rem;
    border: none;
    border-radius: 5px 0 0 5px;
    outline: none;
    width: 400px;
  }

  #searchButton {
    font-size: 1.2rem;
    padding: 1rem;
    border: none;
    border-radius: 0 5px 5px 0;
    background-color: #0053ac;
    color: white;
    cursor: pointer;
    margin-left: -5px;
    width: 150px;
  }

  .nip05 {
    margin-left: 0.5em;
  }

  .loading {
    background-color: #4c6988 !important;
    cursor: not-allowed !important;
  }

  @media (max-width: 768px) {
    #searchInput {
      font-size: 1em;
      width: 200px;
    }
    #searchButton {
      font-size: 1em;
      width: 100px;
    }
    .nip05 {
      font-size: 0.8em;
    }
  }
</style>
