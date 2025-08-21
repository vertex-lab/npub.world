<script>
  import { onMount, tick } from "svelte";
  import PressableProfile from "./PressableProfile.svelte";

  let query = $state("");
  let data = $state({});  // the list of results, or the error
  let searchTimeout;

  let inputRef = $state(null)
  let resultsRef = $state(null);
  let selectedResult = $state(-1); // the index of the seleted search result

  let isLoading = $state(false);
  let isMobile = $state(false);
  let hasFocus = $state(true);

  const showResult = () => {
    if (!hasFocus || !data) {
      return false
    }
    return data.error || data.length > 0
  }

  onMount(() => {
    isMobile = /Mobi|Android/i.test(navigator.userAgent);

    document.addEventListener("click", closeOnOutsideClick);
    return () => { document.removeEventListener("click", closeOnOutsideClick) };
  });

  const closeOnOutsideClick = (event) => {
    if (!inputRef.contains(event.target)) {
      hasFocus = false;
    }
  };

  const automaticSearch = (event) => {
    query = event.target.value;
    if (!query.trim() || query.length < 3) return

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      search();
    }, 300);  // 300ms delay
  }

  async function search(event) {
    if (!query.trim()) return;
    isLoading = true;

    const response = await fetch("/api/query", {
      method: "POST",
      body: JSON.stringify({ q: query }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    let result = await response.json();

    if (!response.ok) {
      data = { error: result.error || `Server error: ${response.status}` };
    } else {
      data = result
    }

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

  const moveWithArrows = (event) => {
    if (!data || data.length === 0) return;
    if (!resultsRef) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        selectedResult = (selectedResult + 1) % data.length;
        ensureVisible()
        break;

      case "ArrowUp":
        event.preventDefault();
        selectedResult = Math.max( (selectedResult - 1) % data.length, -1);
        ensureVisible()
        break;

      case "Enter":
        if (selectedResult >= 0) {
          event.preventDefault();
          const profile = data[selectedResult];
          window.location.href = `/${profile.npub}`;
        }
        break;
    }
  }

  function ensureVisible() {
    if (!resultsRef || selectedResult < 0) return;
    const top = resultsRef.scrollTop;
    const bottom = top + resultsRef.clientHeight;

    const selected = resultsRef.children[selectedResult];
    if (!selected) return;

    const selectedTop = selected.offsetTop;
    const selectedBottom = selectedTop + selected.offsetHeight;

    if (selectedTop < top) {
      // selected above the view
      resultsRef.scrollTop = selectedTop;
    } 
    
    if (selectedBottom > bottom) {
      // selected below the view
      resultsRef.scrollTop = selectedBottom - resultsRef.clientHeight;
    }
  }

  // allow caller to focus on the search bar
  export function focus() {
    inputRef?.focus();
  }
</script>

<div class="search-wrapper">
  <div class="search-container" class:active={showResult()}>
    <form onsubmit={search} class="search-box">
      {#if isLoading}
        <span class="spinner"></span>
      {:else}
        <span class="search-icon"></span>
      {/if}

      <input
        type="text"
        name="q"
        class:active={showResult()}
        placeholder="Search nostr profiles"
        bind:value={query}
        bind:this={inputRef}
        autocomplete="off"
        spellcheck="off"
        oninput={automaticSearch}
        onkeydown={moveWithArrows}
        onfocus={() => (hasFocus = true)}
      />
    </form>
  </div>

  {#if hasFocus && data.error}
    <div class="search-results">
      <p style="text-align: center;">{data.error}</p>
    </div>
  {/if}

  {#if showResult()}
    <div class="search-results" bind:this={resultsRef}>
      {#each data as profile, i}
        <PressableProfile
          profile={profile} 
          style={i === selectedResult 
            ? "padding-left: 15px; background-color: var(--highlight-color);" 
            : "padding-left: 15px;"}
        />
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
    border-bottom: 1px solid transparent;
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
    border-radius: 7px;
    font-size: 1rem;
    box-sizing: border-box;

    box-shadow: none !important;
    border: none !important;
    outline: none !important;
  }

  .search-container.active input[type="text"] {
    border-radius: 7px 7px 0 0;
  }

  .spinner {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
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
