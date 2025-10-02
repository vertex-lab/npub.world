<script>
    import LineChart from "$lib/components/LineChart.svelte";

    let { datasets, title, explainers } = $props();
</script>
  
<div class="chart-with-explainer">
    <LineChart {datasets} {title} />
  
    <div class="explainer">
        <ul class="table-explainer">
            {#each explainers as explainer}
                <li>{@html explainer}</li>
            {/each}
                <li>counts are computed using 
                    <a href="https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/">
                        Redis HyperLogLog
                    </a>,
                    a probabilistic data structure for counting unique elements with less than 1% error.
                </li>
        </ul>
    </div>
</div>

<style>
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