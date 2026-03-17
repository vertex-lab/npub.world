<script>
  import Logo from "$lib/components/Logo.svelte";
  import SearchBox from "$lib/components/SearchBox.svelte";
  import { onMount } from "svelte";

  let searchBoxRef;

  onMount( () => { searchBoxRef.focus() })
</script>

<svelte:head>
  <title>npub.world</title>
</svelte:head>

<div class="centered">
  <header class="header">
    <Logo/>

    <div class="search-container">
      <SearchBox bind:this={searchBoxRef}/>
    </div>
  </header>
</div>

<style>
  .centered {
    margin: 0 auto;
    max-width: 700px;
  }

  .header {
    margin: 0 1rem 1rem 1rem;
  }

  .search-container {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
