<script>
    import LineChart from "$lib/components/LineChart.svelte";
    import Logo from "$lib/components/Logo.svelte";
    import SearchBox from "$lib/components/SearchBox.svelte";
    import StatsCard from "$lib/components/StatsCard.svelte";
    import { onMount } from "svelte";
    import { cropDatasets, formatDate, toJSON } from "$lib/charts";
  
    let { data } = $props();

    let timeframe = $state(90);
    let users = $derived( normalizeDatasets(data.users, timeframe) );
    let events = $derived( normalizeDatasets(data.events, timeframe) );

    // crops the datasets and format the dates (x-axis)
    function normalizeDatasets(datasets, timeframe) {
        const cropped = cropDatasets(datasets, timeframe);
        return cropped.map(ds => {
            ds.points.forEach(p => { p.x = formatDate(p.x) });
            return ds;
        });
    }

    function exportJSON(data) {
        return function() {
            const formatted = {
                "users": toJSON(data.users),
                "events": toJSON(data.events),
            };

            const json = JSON.stringify(formatted, null, 2);
            const blob = new Blob([json], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "npub_world_stats.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
  }
</script>
  
<svelte:head>
<title>npub.world stats</title>
</svelte:head>
  
<div class="centered">
    <Logo/>

    <div class="top-section">
        <h1 class="title">Statistics</h1>
        <p class="subtitle">Nostr data you can rely on, without the spam</p>

        <div class="bar">
            <div class="timeframes">
                <button onclick={() => timeframe = Infinity } class:selected={timeframe === Infinity} aria-label="All" long-title="All" short-title="All"></button>
                <button onclick={() => timeframe = 365 } class:selected={timeframe === 365 } aria-label="1 year" long-title="1 year" short-title="1y"></button>
                <button onclick={() => timeframe = 90 } class:selected={timeframe === 90 } aria-label="3 months" long-title="3 months" short-title="3m"></button>
            </div>
        
            <div>
                <button onclick={exportJSON(data)} class="export" aria-label="Export to JSON" long-title="Export to JSON" short-title="Export"></button>
            </div>
        </div>
    </div>

    <div class="chart-with-explainer">
        <LineChart datasets={users} title="Users"/>
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
        <LineChart datasets={events} title="Events"/>
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

    .top-section {
        text-align: center;
        padding-top: 1rem;
        padding-bottom: 2rem;
    }

    .bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;

        border: 1px solid var(--border-color);
        border-radius: 12px;
        background: var(--card-background);
        box-shadow: var(--shadow-elevation-low);
    }
  
    .timeframes {
        display: flex;
        gap: 8px;
    }
  
    button {        
        cursor: pointer;
        user-select: none;
        padding: 8px 14px;
        cursor: pointer;
        transition: background 0.2s ease;
        font-size: 0.9rem;

        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: var(--card-background);
        color: var(--primary-text);
    }
  
    button:hover {
        background: var(--border-color);
    }

    .selected {
        background: var(--border-color);
    }

    button::after {
        content: attr(long-title);
    }

    .title {
        font-size: 2.5rem;
        font-weight: 600;
        letter-spacing: 1.5px;
        margin: 0 auto;
    }

    .subtitle {
        color: var(--secondary-text);
        margin-top: 0.5rem;
        margin-bottom: 1.25rem;
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

        button::after {
            content: attr(short-title);
        }
    }
</style>