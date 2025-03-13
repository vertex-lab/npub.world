<script>
  import { goto } from "$app/navigation";

  // Props
  export let results = [];
  export let loading = false;
  export let query = '';
  export let onSubmit = undefined;

  function handleSubmit(event) {
    // Prevent default form submission
    event.preventDefault();
    
    // Get the form data
    const formData = new FormData(event.target);
    const searchQuery = formData.get('q');
    
    if (searchQuery) {
      // Navigate to the root with the search query
      goto(`/?q=${encodeURIComponent(searchQuery)}`);
    }
    
    if (onSubmit) {
      onSubmit(event);
    }
  }
</script>

<div class="search-wrapper">
  <div class="search-container">
    <form action="/" method="GET" on:submit={handleSubmit} class="search-box">
      <span class="search-icon"></span>
      <input type="text" name="q" placeholder="Search nostr profiles" value={query} />
    </form>
  </div>
  
  {#if results.length > 0 || loading}
    <div class="search-results">
      {#if loading}
        <p class="loading">Searching...</p>
      {:else if results.length > 0}
        {#each results as profile}
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
      {/if}
    </div>
  {/if}
</div>

<style>
  .search-wrapper {
    position: relative;
    width: 100%;
  }

  .search-container {
    width: 100%;
    box-sizing: border-box;
  }

  .search-box {
    width: 100%;
    box-sizing: border-box;
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
    z-index: 1;
  }

  .search-results {
    position: absolute;
    top: 100%; /* Position directly below the search container */
    left: 0;
    width: 100%; /* Match the width of the search container */
    background-color: var(--card-background);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    border: 1px solid var(--border-color);
    max-height: 400px;
    overflow-y: auto;
    margin-top: 4px; /* Small gap between search box and results */
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

  .loading {
    padding: 12px 16px;
    color: var(--light-text);
    text-align: center;
  }

  input[type="text"] {
    width: 100%;
    padding: 15px 15px 15px 40px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
  }

  /* Responsive adjustments */
  @media (max-width: 576px) {
    input[type="text"] {
      padding: 12px 12px 12px 36px;
      font-size: 0.9rem;
    }
  }
</style>