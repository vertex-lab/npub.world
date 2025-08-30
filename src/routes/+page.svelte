<script>
  import SearchBox from "$lib/components/SearchBox.svelte";
  import { npubEncode } from "nostr-tools/nip19";
  import { onMount } from "svelte";

  let searchQuery = $state("");
  let { data } = $props();
  let searchBoxRef;

  onMount( () => { searchBoxRef.focus() })
</script>

<svelte:head>
  <title>npub.world</title>
</svelte:head>

<div class="container">
  <div class="logo-container">
    <div class="theme-logo"></div>
    <div class="logo-text">
      <span>NPUB</span>
      <span>.WORLD</span>
    </div>
  </div>

  <div class="search-container">
    <SearchBox query={searchQuery} {data} bind:this={searchBoxRef}/>
  </div>
</div>

<style>
  @import "../../static/shared.css";

  .logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem;
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
    width: 90%;
    max-width: 550px;
    margin: 0 auto;
  }

  /* Responsive styles */
  /* Small screens (mobile) */
  @media (max-width: 576px) {
    .container {
      padding: 1rem;
      box-sizing: border-box;
    }

    .search-container {
      width: 100%;
    }
  }

</style>
