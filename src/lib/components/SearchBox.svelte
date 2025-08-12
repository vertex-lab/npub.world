<script>
  import { onMount, tick } from "svelte";
  import PressableProfile from "./PressableProfile.svelte";

  let query = $state("");
  let data = $state({});

  let inputRef;
  let searchTimeout;

  let isLoading = $state(false);
  let isMobile = $state(false);
  let hasFocus = $state(true);

  const showResult = () => { return hasFocus && data && data.length > 0 }

  onMount(() => {
    document.addEventListener("click", handleOutsideClick);
    isMobile = /Mobi|Android/i.test(navigator.userAgent);
    return () => { document.removeEventListener("click", handleOutsideClick) };
  });

  const handleOutsideClick = (event) => {
    if (!inputRef.contains(event.target)) {
      hasFocus = false;
    }
  };

  function automaticSearch(event) {
    query = event.target.value.trim();
    if (!query || query.length < 3) return

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      search();
    }, 300);  // 300ms delay
  }

  async function search(event) {
    if (!query.trim()) return;

    isLoading = true;
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
      hasFocus = true;
      isLoading = false;

      if (data.redirect) {
        window.location.href = `/${data.redirect}`;
      }

      if (!isMobile) {
        await tick()
        inputRef.focus()
      }
    }
  }
</script>

<div class="search-wrapper">
  <div class="search-container" class:active={showResult()}>
    <form onsubmit={search} class="search-box">
      <span class="search-icon"></span>
      <input
        type="text"
        name="q"
        placeholder="Search nostr profiles"
        bind:value={query}
        bind:this={inputRef}
        autocomplete="off"
        spellcheck="off"
        oninput={automaticSearch}
        onfocus={() => (hasFocus = true)}
      />
      {#if isLoading}
        <span class="spinner"></span>
      {/if}
    </form>
  </div>

  {#if data && data.error}
    <div class="search-results">
      <p class="error">{data.error}</p>
    </div>
  {/if}

  {#if showResult()}
    <div class="search-results">
      {#each data as profile}
        <PressableProfile profile={profile} style="padding-left: 15px;"/>
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
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .search-container.active {
    border-radius: 8px 8px 0 0;
    border-bottom: none;
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
    font-size: 1rem;
    box-sizing: border-box;

    box-shadow: none !important;
    border: none !important;
    outline: none !important;
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
    top: 100%;
    left: 0;
    right: 0;
    max-height: 400px;
    overflow-y: auto;
    z-index: 10;

    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background-color: var(--card-background);
    border-radius: 0 0 8px 8px;
    border: 1px solid var(--border-color);
  }

  /* Responsive adjustments */
  @media (max-width: 576px) {
    input[type="text"] {
      padding: 12px 12px 12px 36px;
    }
  }
</style>
