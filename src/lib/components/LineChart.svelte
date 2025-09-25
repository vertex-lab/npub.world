<script>
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
  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";
  import { Chart, layouts, registerables } from "chart.js";
  import { theme } from "$lib/theme.svelte";

  let { datasets, title } = $props();
  let chart;
  let canvas;

  // change these colors if the correspondent colors in shared.css change
  const color = {
    light: {
      text: "#333",
      grid: "#0000001a",
    },

    dark: {
      text: "#e1e1e1",
      grid: "#ffffff1a",
    },
  }

  Chart.register(...registerables);
  Chart.defaults.font.family = "Ubuntu";
  Chart.defaults.color = theme.isDark ? color.dark.text : color.light.text;

  const data = {
    datasets: datasets.map(d => ({
      label: d.label,
      data: d.points,
      fill: false,
      tension: 0.1
    })),
  };

  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 0,
  });

  const options = {
    aspectRatio: 1.5,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: "line",
        },
      }
    },

    scales: {
      x: {
        type: 'category',

        grid: {
          color: theme.isDark ? color.dark.grid : color.light.grid,
        }
      },

      y: {
        ticks : {
          count: 5,
          callback: function(value) {
            return formatter.format(value);
          },
        },

        grid: {
          color: theme.isDark ? color.dark.grid : color.light.grid,
        }
      },
    }
};

  onMount(() => {
    chart = new Chart(canvas, { type: "line", data: data, options: options});
  });

  $effect(() => {
    if (chart) {
      chart.options.plugins.legend.labels.color = theme.isDark ? color.dark.text : color.light.text;
      chart.options.scales.x.ticks.color = theme.isDark ? color.dark.text : color.light.text;
      chart.options.scales.y.ticks.color = theme.isDark ? color.dark.text : color.light.text;

      chart.options.scales.x.grid.color = theme.isDark ? color.dark.grid : color.light.grid;
      chart.options.scales.y.grid.color = theme.isDark ? color.dark.grid : color.light.grid;
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