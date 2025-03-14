<script>
  import { onMount } from "svelte";

  let query = $state("");
  let loading = $state(false);
  let showResults = $state(true);
  let data = $state({});
  let inputRef;

  onMount(() => {
    const handleOutsideClick = (event) => {
      if (!inputRef.contains(event.target)) {
        showResults = false;
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  });

  async function handleSubmit(event) {
    if (!query.trim()) return;

    loading = true;
    data = [];

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        body: JSON.stringify({ q: query }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      data = await response.json();
    } catch (error) {
      // $status = 'Error: ' + error.message;
    } finally {
      showResults = true;
      loading = false;
    }
  }
</script>

<div class="search-wrapper">
  <div class="search-container">
    <form onsubmit={handleSubmit} class="search-box">
      <span class="search-icon"></span>
      <input
        type="text"
        name="q"
        placeholder="Search nostr profiles"
        bind:this={inputRef}
        bind:value={query}
        disabled={loading}
        onfocus={() => (showResults = true)}
      />
      {#if loading}
        <span class="spinner"></span>
      {/if}
    </form>
  </div>

  {#if data && data.error}
    <p class="error">{data.error}</p>
  {/if}

  {#if showResults && data && data.length > 0}
    <div class="search-results">
      {#each data as profile}
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
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-wrapper {
    position: relative;
    width: 100%;
    margin: 0 auto;
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

  input[type="text"] {
    width: 100%;
    padding: 15px 15px 15px 40px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
  }

  .spinner {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 1;
  }

  @keyframes spin {
    0% {
      transform: translateY(-50%) rotate(0deg);
    }
    100% {
      transform: translateY(-50%) rotate(360deg);
    }
  }

  .error {
    color: var(--error-color);
    text-align: center;
    margin-top: 1rem;
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

  /* Responsive adjustments */
  @media (max-width: 576px) {
    input[type="text"] {
      padding: 12px 12px 12px 36px;
      font-size: 0.9rem;
    }
  }
</style>
