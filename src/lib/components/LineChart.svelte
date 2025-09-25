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

  let { datasets, title } = $props();
  let canvas;

  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 0,
  });

  Chart.register(...registerables);
  Chart.defaults.font.family = "Ubuntu";

  const data = {
    datasets: datasets.map(d => ({
      label: d.label,
      data: d.points,
      fill: false,
      tension: 0.1
    })),
  };

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
        ticks: {
          padding: 10, 
        }
      },

      y: {
        ticks : {
          count: 5,
          callback: function(value) {
            return formatter.format(value);
          },
        }
      }
    }
};

  onMount(() => {
    new Chart(canvas, { type: "line", data: data, options: options});
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