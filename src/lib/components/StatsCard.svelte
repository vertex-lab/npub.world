<script>
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import * as utils from "$lib/charts.js";

  let { datasets, title } = $props();
  let chart;
  let canvas;

  Chart.register(...registerables);
  Chart.defaults.font.family = "Ubuntu";
  Chart.defaults.color = utils.textColor();

  const data = {
    datasets: datasets.map(d => ({
      label: d.label,
      data: d.points,
      fill: false,
      tension: 0.3,
    })),
  };

  const options = {
    responsive: true,
    aspectRatio: 1.25,

    plugins: {
      legend: {
        labels: utils.labels,
        },

        tooltip: utils.tooltip,
      },

    scales: {
      x: { display: false },
      y: { display: false },
    },
  };
  
  onMount(() => {
    chart = new Chart(canvas, { type: "line", data: data, options: options});
  });

  $effect(() => {
    if (chart) {
      chart.options.plugins.legend.labels.color = utils.textColor();
      chart.options.plugins.tooltip.titleColor = utils.tooltipTextColor();
      chart.options.plugins.tooltip.bodyColor = utils.tooltipTextColor();
      chart.options.plugins.tooltip.backgroundColor = utils.tooltipBackgroundColor();
      chart.update();
    }
  });
  </script>
  
  <div class="card">
    <p class="title">{title}</p>
    <div class="chart-container">
      <canvas bind:this={canvas}></canvas>
    </div>
  </div>

<style>
    .card {
        box-shadow: var(--shadow-elevation-low);
        min-width: 0;
    }

    .chart-container {
      position: relative;
      min-width: 0;
    }

    .title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      text-align: center;
    }
</style>
  