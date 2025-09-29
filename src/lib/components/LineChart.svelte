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
      background: "#fff",
      grid: "#00000026",
    },

    dark: {
      text: "#e1e1e1",
      grid: "#ffffff33",
      background: "#1e1e1e",
    },
  }

  function textColor() { return theme.isDark ? color.dark.text : color.light.text };
  function gridColor() { return theme.isDark ? color.dark.grid : color.light.grid };

  // tooltip have the opposite background and text colors
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
      tension: 0.1,
    })),
  };

  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 0,
  });

  const options = {
    aspectRatio: 1.25,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: "line",

          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, i) => {
              const isVisible = chart.isDatasetVisible(i);

              return {
                text: dataset.label,
                fillStyle: dataset.borderColor || dataset.backgroundColor || "#000",
                strokeStyle: dataset.borderColor || dataset.backgroundColor || "#000",
                hidden: !isVisible,
                lineCap: "butt",
                lineDash: [],
                lineDashOffset: 0,
                lineWidth: 2,
                pointStyle: "line",
                datasetIndex: i,
                fontColor: isVisible ? textColor() : gridColor(),
                textDecoration: "none",
              };
            });
          },
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
      x: {
        display: false,
      },

      y: {
        ticks: {
          maxTicksLimit: 5,
          callback: function(value) {
            return formatter.format(value);
          },
        },

        grid: {
          color: gridColor(),
        }
      },
    }
};

  onMount(() => {
    chart = new Chart(canvas, { type: "line", data: data, options: options});
  });

  $effect(() => {
    if (chart) {
      chart.options.plugins.legend.labels.color = textColor();
      chart.options.plugins.tooltip.titleColor = tooltipTextColor();
      chart.options.plugins.tooltip.bodyColor = tooltipTextColor();
      chart.options.plugins.tooltip.backgroundColor = tooltipBackgroundColor();
      chart.options.scales.y.ticks.color = textColor();
      chart.options.scales.y.border.color = gridColor();
      chart.options.scales.y.grid.color = gridColor();
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