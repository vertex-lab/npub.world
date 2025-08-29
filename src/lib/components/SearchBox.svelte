<script>
  import { onDestroy, onMount, tick } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { deserialize } from '$app/forms';
  import { browser } from "$app/environment";
  import { goto } from '$app/navigation';

  import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from "$lib/string.js";
  import { onEsc, onOutsideClick } from "$lib/events.js";
  import PressableProfile from "./PressableProfile.svelte";

  let query = $state("");
  let results = $state([]);  // the list of search results, or the error
  let searchTimeout;

  let inputRef = $state(null)
  let resultsRef = $state(null);
  let selectedResult = $state(-1); // the index of the seleted search result

  let isLoading = $state(false);
  let isResultVisible = $state(false);

  const showResult = () => { isResultVisible = true; }
  const hideResult = () => { isResultVisible = false; }

  const isActive = () => {
    if (!isResultVisible || !results) return false
    return results.error || results.length > 0
  }

  onMount(() => {
    if (browser) {
      document.addEventListener("click", onOutsideClick(inputRef, hideResult));
      document.addEventListener("keydown", onEsc(hideResult));
    }
  });

  onDestroy(() => {
    if (browser) {
      document.removeEventListener("click", onOutsideClick(inputRef, hideResult));
      document.removeEventListener("keydown", onEsc(hideResult));
    }
  });

  $effect(() => {
    afterNavigate(() => {
      // hide results when navigating to a new page
      isResultVisible = false;
      selectedResult = -1;
    });
  });

  function automaticSearch(event) {
    if (!query.trim() || query.length < 3) return
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { search(event); }, 300);  // 300ms delay
  }

  async function search(event) {
    event?.preventDefault();
    query = query.trim()
    if (!query) return
    
    isLoading = true;

    if (HEXKEY_REGEXP.test(query) || NPUB_REGEXP.test(query) || NIP05_REGEXP.test(query)) {
      goto(`/${query}`);
      selectedResult = -1;
      isLoading = false;
      results = [];
      query = "";
      return
    }

    const params = new FormData();
    params.set('q', query);
    params.set('limit', 15);

    let response = await fetch('/?/search', {
      method: 'POST',
      body: params
    });

    response = deserialize(await response.text());

    if (response.data.error) {
      results = { error: response.data.error }; 
    } else {
      results = response.data;
    }

    selectedResult = -1;
    isLoading = false;
    isResultVisible = true;
    inputRef.focus();
}

  const moveWithArrows = (event) => {
    if (!results || results.length === 0) return;
    if (!resultsRef) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        selectedResult = (selectedResult + 1) % results.length;
        ensureVisible()
        break;

      case "ArrowUp":
        event.preventDefault();
        selectedResult = Math.max( (selectedResult - 1) % results.length, -1);
        ensureVisible()
        break;

      case "Enter":
        if (selectedResult >= 0) {
          event.preventDefault();
          const profile = results[selectedResult];
          goto(`/${profile.npub}`);
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

<div class="search-container">
  <form onsubmit={search} class="search-form" class:active={isActive()}>
    {#if isLoading}
      <span class="spinner"></span>
    {:else}
      <span class="search-icon"></span>
    {/if}

    <input
      type="text"
      name="q"
      class:active={isActive()}
      placeholder="Search nostr profiles"
      bind:this={inputRef}
      bind:value={query}
      autocomplete="off"
      spellcheck="off"
      oninput={automaticSearch}
      onkeydown={moveWithArrows}
      onclick={showResult}
    />
  </form>

  {#if isResultVisible && results && results.error}
    <div class="search-results">
      <p style="text-align: center;">{results.error}</p>
    </div>
  {/if}

  {#if isResultVisible && results && results.length > 0 }
    <div class="search-results" bind:this={resultsRef}>
      {#each results as profile, i}
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
  .search-container {
    position: relative;
    width: 100%;
    margin: 0 auto;
  }

  .search-form {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--border-color);
    border-radius: 8px;
	  box-shadow: var(--shadow-elevation-low);
    background-color: var(--card-background);
  }

  .search-form.active {
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid transparent;
    box-shadow: var(--shadow-elevation-high);
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

    border: none !important;
    outline: none !important;
  }

  .search-form.active input[type="text"] {
    border-radius: 7px 7px 0 0;
  }

  .spinner {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
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

    background-color: var(--card-background);
    border-radius: 0 0 8px 8px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-elevation-high);
  }

  /* Responsive adjustments */
  @media (max-width: 576px) {
    input[type="text"] {
      padding: 12px 12px 12px 36px;
    }

    .search-results {
      max-height: 340px;
    }
  }
</style>
