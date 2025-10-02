<script>
    import LineChart from "$lib/components/LineChart.svelte";
    import Logo from "$lib/components/Logo.svelte";
    import SearchBox from "$lib/components/SearchBox.svelte";
    import StatsCard from "$lib/components/StatsCard.svelte";
    import { onMount } from "svelte";
    import { cropDatasets, formatDate, toJSON } from "$lib/charts";
    import ChartWithExplainer from "./ChartWithExplainer.svelte";
  
    let { data } = $props();

    let timeframe = $state(90);
    let users = $derived( normalizeDatasets(data.users, timeframe) );
    let contentEvents = $derived( normalizeDatasets(data.contentEvents, timeframe) );
    let engagementEvents = $derived( normalizeDatasets(data.engagementEvents, timeframe) );
    let profileEvents = $derived( normalizeDatasets(data.profileEvents, timeframe) );

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
                "content": toJSON(data.contentEvents),
                "engagement": toJSON(data.engagementEvents),
                "profile": toJSON(data.profileEvents),
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
<title>statistics - npub.world</title>
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

    <ChartWithExplainer
        title="Users"
        datasets={users}
        explainers={[
            'active users are the ones that published any of the kinds <code>0, 1, 3, 6, 7, 16, 20, 21, 22, 1111, 9321, 9735, 10000, 10002, 10063, 30023</code> on a given day.',
            'posters are users that published any of the kinds <code>1, 20, 21, 22, 1111, 30023</code> on a given day.',
        ]}
    />

    <ChartWithExplainer
        title="Content"
        datasets={contentEvents}
        explainers={[
            'events from the same user on the same day are counted separately, even if replaceable or addressable.',
        ]}
    />

    <ChartWithExplainer
        title="Engagement"
        datasets={engagementEvents}
        explainers={[
            'events from the same user on the same day are counted separately, even if replaceable or addressable.',
        ]}
    />

    <ChartWithExplainer
        title="Profile"
        datasets={profileEvents}
        explainers={[
            'events from the same user on the same day are counted separately, even if replaceable or addressable.',
        ]}
    />
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

    @media (max-width: 576px) {
        button::after {
            content: attr(short-title);
        }
    }
</style>