<script>
  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";
  import { Chart, layouts, registerables } from "chart.js";
  import * as utils from "$lib/charts.js";

  let { datasets, title } = $props();
  let isDense = $derived(datasets?.[0]?.points.length > 100 ?? false);

  let chart;
  let canvas;

  Chart.register(...registerables);
  Chart.defaults.font.family = "Ubuntu";
  Chart.defaults.color = utils.textColor();

  const data = $derived({
    datasets: datasets.map(d => ({
      label: d.label,
      data: d.points,
      fill: false,
    })),
  });

  const options = {
    aspectRatio: 1.25,

    plugins: {
      legend: {
        labels: utils.labels,
      },

      tooltip: utils.tooltip,
    },

    scales: {
      x: {
        ticks: {
          maxTicksLimit: 5,
        }
      },

      y: {
        ticks: {
          maxTicksLimit: 5,
          callback: utils.simpleNumbers,
        },

        grid: {
          color: utils.gridColor(),
        }
      },
    }
};

  onMount(() => {
    chart = new Chart(canvas, { type: "line", data: data, options: options});
  });

  $effect(() => {
    if (chart) {
      chart.data = data;
      chart.options.elements.point.radius = isDense ? 0 : 2;

      chart.options.plugins.legend.labels.color = utils.textColor();
      chart.options.plugins.tooltip.titleColor = utils.tooltipTextColor();
      chart.options.plugins.tooltip.bodyColor = utils.tooltipTextColor();
      chart.options.plugins.tooltip.backgroundColor = utils.tooltipBackgroundColor();
      chart.options.scales.y.ticks.color = utils.textColor();
      chart.options.scales.y.border.color = utils.gridColor();
      chart.options.scales.y.grid.color = utils.gridColor();
      chart.update();
    }
  });
</script>

<div class="chart-container">
  <p class="title">{title}</p>
  <canvas bind:this={canvas}></canvas>
</div>
  
<style>
  .chart-container {
    position: relative;
    margin: 0 auto;
    padding: 1rem;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    text-align: center;
  }

  @media (max-width: 576px) {
    .chart-container {
      padding: 0.5rem
    }
  }
</style>