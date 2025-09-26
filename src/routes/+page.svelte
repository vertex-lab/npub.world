<script>
  import Logo from "$lib/components/Logo.svelte";
  import LineChart from "$lib/components/LineChart.svelte";
  import SearchBox from "$lib/components/SearchBox.svelte";
  import StatsCard from "$lib/components/StatsCard.svelte";
  import { npubEncode } from "nostr-tools/nip19";
  import { onMount } from "svelte";

  let searchQuery = $state("");
  let { data } = $props();
  let searchBoxRef;

  const pubkeyStats = [
  {
    label: "total",
    points: [
      { x: "17 Sep", y: "370562" },
      { x: "18 Sep", y: "372100" },
      { x: "19 Sep", y: "374000" },
      { x: "20 Sep", y: "375800" },
      { x: "21 Sep", y: "377000" },
      { x: "22 Sep", y: "378500" },
      { x: "23 Sep", y: "379800" },
      { x: "24 Sep", y: "380562" }
    ]
  },
  {
    label: "active",
    points: [
      { x: "17 Sep", y: "40000" },
      { x: "18 Sep", y: "42000" },
      { x: "19 Sep", y: "46000" },
      { x: "20 Sep", y: "50000" },
      { x: "21 Sep", y: "58000" },
      { x: "22 Sep", y: "62000" },
      { x: "23 Sep", y: "67000" },
      { x: "24 Sep", y: "69000" }
    ]
  },
  {
    label: "creators",
    points: [
      { x: "17 Sep", y: "27000" },
      { x: "18 Sep", y: "28000" },
      { x: "19 Sep", y: "28500" },
      { x: "20 Sep", y: "29000" },
      { x: "21 Sep", y: "31000" },
      { x: "22 Sep", y: "32000" },
      { x: "23 Sep", y: "34000" },
      { x: "24 Sep", y: "35000" }
    ]
  }
];


const eventStats = [
  {
    label: "kind 0",
    points: [
      { x: "17 Sep", y: "1000" },
      { x: "18 Sep", y: "1100" },
      { x: "19 Sep", y: "1150" },
      { x: "20 Sep", y: "1200" },
      { x: "21 Sep", y: "1320" },
      { x: "22 Sep", y: "1400" },
      { x: "23 Sep", y: "1500" },
      { x: "24 Sep", y: "1532" }
    ]
  },
  {
    label: "kind 1",
    points: [
      { x: "17 Sep", y: "15000" },
      { x: "18 Sep", y: "18500" },
      { x: "19 Sep", y: "20000" },
      { x: "20 Sep", y: "23900" },
      { x: "21 Sep", y: "21000" },
      { x: "22 Sep", y: "17500" },
      { x: "23 Sep", y: "14500" },
      { x: "24 Sep", y: "13870" }
    ]
  },
  {
    label: "kind 3",
    points: [
      { x: "17 Sep", y: "4000" },
      { x: "18 Sep", y: "4200" },
      { x: "19 Sep", y: "4500" },
      { x: "20 Sep", y: "4789" },
      { x: "21 Sep", y: "4400" },
      { x: "22 Sep", y: "4100" },
      { x: "23 Sep", y: "3900" },
      { x: "24 Sep", y: "3872" }
    ]
  },
  {
    label: "kind 6",
    points: [
      { x: "17 Sep", y: "55" },
      { x: "18 Sep", y: "52" },
      { x: "19 Sep", y: "49" },
      { x: "20 Sep", y: "49" },
      { x: "21 Sep", y: "60" },
      { x: "22 Sep", y: "70" },
      { x: "23 Sep", y: "90" },
      { x: "24 Sep", y: "111" }
    ]
  },
  {
    label: "kind 7",
    points: [
      { x: "17 Sep", y: "45" },
      { x: "18 Sep", y: "40" },
      { x: "19 Sep", y: "38" },
      { x: "20 Sep", y: "37" },
      { x: "21 Sep", y: "20" },
      { x: "22 Sep", y: "10" },
      { x: "23 Sep", y: "5" },
      { x: "24 Sep", y: "1" }
    ]
  },
  {
    label: "kind 69420",
    points: [
      { x: "17 Sep", y: "5543" },
      { x: "18 Sep", y: "5443" },
      { x: "19 Sep", y: "4549" },
      { x: "20 Sep", y: "4549" },
      { x: "21 Sep", y: "6450" },
      { x: "22 Sep", y: "7430" },
      { x: "23 Sep", y: "9440" },
      { x: "24 Sep", y: "21031" }
    ]
  },
];

  onMount( () => { searchBoxRef.focus() })
</script>

<svelte:head>
  <title>npub.world</title>
</svelte:head>

<div class="centered">
  <header class="header">
    <Logo/>

    <div class="search-container">
      <SearchBox query={searchQuery} {data} bind:this={searchBoxRef}/>
    </div>
  </header>

  <div class="stats-grid">
    <StatsCard datasets={pubkeyStats} title="Pubkeys"></StatsCard>
    <StatsCard datasets={eventStats} title="Events"></StatsCard>
  </div>
</div>

<style>
  .centered {
    margin: 0 auto;
    max-width: 700px;
  }

  .header {
    margin: 0.5rem 1rem 2rem 1rem;
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
</style>
