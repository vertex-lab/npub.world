<script>
    import LineChart from "$lib/components/LineChart.svelte";

    let { datasets, title, explainers } = $props();
    let expanded = $state(false);
</script>

<div class="chart-with-explainer">
    <LineChart {datasets} {title}/>

    <div class="explainer">
        <div class="learn-more-wrapper">
            <button class="learn-more" onclick={() => expanded = !expanded} aria-expanded={expanded}>
                <span>learn more </span>
                <span class="chevron" class:flipped={expanded}>›</span>
            </button>
        </div>

        {#if expanded}
            <ul class="table-explainer">
                {#each explainers as explainer}
                    <li>{@html explainer}</li>
                {/each}
                <li>from 13 Mar 2026, relay coverage expanded beyond a static list — new relays are dynamically discovered from users' relay lists (<code>kind:10002</code>).</li>
                <li>counts are computed using
                    <a href="https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/">
                        Redis HyperLogLog
                    </a>,
                    a probabilistic data structure for counting unique elements with less than 1% error.
                </li>
            </ul>
        {/if}
    </div>
</div>

<style>
    .chart-with-explainer {
        margin-bottom: 2rem;
    }

    .explainer {
        font-size: var(--font-body);
        color: var(--secondary-text);
        padding: 0 2rem;
        text-align: left;
    }

    .learn-more-wrapper {
        text-align: center;
        margin-bottom: 0.25rem;
    }

    .learn-more {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--secondary-text);
        font-size: var(--font-body);
        user-select: none;
    }

    .learn-more:hover {
        color: var(--primary-text);
    }

    .chevron {
        display: inline-block;
        transition: transform 0.2s ease;
        transform: rotate(0deg);
    }

    .chevron.flipped {
        transform: rotate(90deg);
    }

    .table-explainer {
        margin: 0.5rem 0 0 0;
        list-style-type: none;
        padding: 0;
    }

    .table-explainer li {
        margin-bottom: 0.75rem;
    }

    .table-explainer li::before {
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
