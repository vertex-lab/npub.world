<script>
  import Logo from "$lib/components/Logo.svelte";
  import SearchBox from "$lib/components/SearchBox.svelte";
  import StatsCard from "$lib/components/StatsCard.svelte";
  import { onMount } from "svelte";

  let { data } = $props();
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

  <div class="stats-grid">
    <StatsCard datasets={data.users} title="Users"/>
    <StatsCard datasets={data.events} title="Events"/>
  </div>

  <a href="/stats" class="stats-link">
    <p>View more statistics</p>
  </a>
</div>

<style>
  .centered {
    margin: 0 auto;
    max-width: 700px;
  }

  .header {
    margin: 0 1rem 2rem 1rem;
  }

  .search-container {
    max-width: 600px;
    margin: 0 auto;
  }

  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .stats-link {
    font-size: 0.8rem;
		color: var(--secondary-text);
    text-align: center;
  }
</style>
