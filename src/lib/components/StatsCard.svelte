<script>
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import { theme } from "$lib/theme.svelte";

    /**
    * A single dataset for a chart.
    * 
    * @typedef {Object} Dataset
    * @property {string} label - The name of the dataset (shown in the legend).
    * @property {Array<Point>} points - An array of data points for the dataset.
  */
  
  /**
    * A single point in a dataset.
    * 
    * @typedef {Object} Point
    * @property {string|number} x - The x-axis value of the point.
    * @property {number} y - The y-axis value of the point.
  */
  let { datasets, title } = $props();
  let chart;
  let canvas;

    // change these colors if the correspondent colors in shared.css change
    const color = {
    light: {
      text: "#333",
      background: "#fff",
    },

    dark: {
      text: "#e1e1e1",
      background: "#1e1e1e",
    },
  }

  function textColor() { return theme.isDark ? color.dark.text : color.light.text };
  function tooltipTextColor() { return theme.isDark ? color.light.text : color.dark.text };
  function tooltipBackgroundColor() { return theme.isDark ? color.light.background : color.dark.background };

  Chart.register(...registerables);
  Chart.defaults.font.family = "Ubuntu";
  Chart.defaults.color = textColor();

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
        labels: {
          usePointStyle: true,
          pointStyle: "line",
        },
      },

      tooltip: {
        titleColor: tooltipTextColor(),
        bodyColor: tooltipTextColor(),
        backgroundColor: tooltipBackgroundColor(),

        usePointStyle: true,
        callbacks: {
          labelPointStyle: function(context) {
            return { pointStyle: "line" }
          }
        }
      }
    },

    scales: {
      x: { display: false },
      y: { display: false },
    },

  };
  
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 0,
  });
  
  onMount(() => {
    chart = new Chart(canvas, { type: "line", data: data, options: options});
  });

  $effect(() => {
    if (chart) {
      chart.options.plugins.legend.labels.color = textColor();
      chart.options.plugins.tooltip.titleColor = tooltipTextColor();
      chart.options.plugins.tooltip.bodyColor = tooltipTextColor();
      chart.options.plugins.tooltip.backgroundColor = tooltipBackgroundColor();
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
  