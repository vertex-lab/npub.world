<script>
  import { onMount } from "svelte";
    import ProfileItem from "./ProfileItem.svelte";

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

      if (data.redirect) {
        window.location.href = `/${data.redirect}`;
      }
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
    <div class="search-results">
      <p class="error">{data.error}</p>
    </div>
  {/if}

  {#if showResults && data && data.length > 0}
    <div class="search-results">
      {#each data as profile}
        <ProfileItem profile={profile} style="padding-left: 15px;"/>
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
    left: 0;
    top: 100%; /* Position directly below the search container */
    width: 100%; /* Match the width of the search container */
    max-height: 400px;
    overflow-y: auto;
    z-index: 10;

    background-color: var(--card-background);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    border-radius: 8px;
    border: 1px solid var(--border-color);
    border-top: none;
  }

  /* Responsive adjustments */
  @media (max-width: 576px) {
    input[type="text"] {
      padding: 12px 12px 12px 36px;
      font-size: 0.9rem;
    }
  }
</style>
