<script>
    import LineChart from "$lib/components/LineChart.svelte";
    import Logo from "$lib/components/Logo.svelte";
    import SearchBox from "$lib/components/SearchBox.svelte";
    import StatsCard from "$lib/components/StatsCard.svelte";
    import { onMount } from "svelte";
  
    let { data } = $props();
</script>
  
<svelte:head>
<title>npub.world stats</title>
</svelte:head>
  
<div class="centered">
    <Logo/>

    <div class="title-section">
        <h1 class="title">Statistics</h1>
        <p class="subtitle">Nostr data you can rely on, without the spam</p>
    </div>

    <div class="chart-with-explainer">
        <LineChart datasets={data.pubkeys} title="Users"/>
        <div class="explainer">
            <ul class="table-explainer">
                <li>active users are the ones that published any of the kinds 
                    <code>0, 1, 3, 6, 7, 16, 20, 21, 22, 1111, 9321, 9735, 10000, 10002, 10063, 30023</code> on a given day.</li>
                <li>posters are users that published any of the kinds 
                    <code>1, 20, 21, 22, 30023</code> on a given day.</li>
                <li>counts are computed using
                    <a href="https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/">
                        Redis HyperLogLog
                    </a>,
                    a probabilistic data structure for counting unique elements with less than 1% error.</li>
            </ul>
        </div>
    </div>

    <div class="chart-with-explainer">
        <LineChart datasets={data.events} title="Events"/>
        <div class="explainer">
            <ul class="table-explainer">
                <li>events from the same user on the same day are counted separately, even if replaceable or addressable.</li>
                <li>counts are computed using 
                    <a href="https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/">
                        Redis HyperLogLog
                    </a>,
                    a probabilistic data structure for counting unique elements with less than 1% error.</li>
            </ul>
        </div>
    </div>
</div>
  
<style>
    .centered {
        margin: 0 auto;
        max-width: 700px;
    }

    .title-section {
        text-align: center;
        padding: 1rem 0;
    }

    .title {
        font-size: 2.5rem;
        font-weight: 600;
        letter-spacing: 1.5px;
        margin: 0 auto;
    }

    .subtitle {
        color: var(--secondary-text);
        margin: 0.5rem auto;
    }

    .chart-with-explainer {
        margin-bottom: 2rem;
    }

    .explainer {
        font-size: 0.8rem;
        color: var(--secondary-text);
        padding: 0 2rem;
    }

    .explainer ul {
        margin: 0;
        list-style-type: none;
    }

    .explainer li {
        margin-bottom: 0.75rem;
    }

    .explainer li::before {
        content: "*";
        display: inline-flex;
        width: 1rem;
        margin-left: -1rem;
    }

    @media (max-width: 576px) {
        .explainer {
            padding: 0;
        }
    }
</style>