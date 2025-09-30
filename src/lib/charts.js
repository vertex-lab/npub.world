import { theme } from "./theme.svelte"

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

/**
 * Crop an array of datasets to the last N points.
 * 
 * @param {Dataset[]} datasets - Array of dataset objects.
 * @param {number} maxPoints - Maximum number of points to keep per dataset.
 * @returns {Dataset[]} - New array of datasets with cropped points.
 */
 export function cropDatasets(datasets, maxPoints) {
  const result = new Array(datasets.length);

  for (let i = 0; i < datasets.length; i++) {
    const dataset = datasets[i];
    const points = dataset.points;
    const croppedPoints = points.length > maxPoints ? points.slice(-maxPoints) : points;
    result[i] = { ...dataset, points: croppedPoints };
  }

  return result;
}

// change these colors if the correspondent colors in shared.css change
export const color = {
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

export function textColor() { return theme.isDark ? color.dark.text : color.light.text };
export function gridColor() { return theme.isDark ? color.dark.grid : color.light.grid };

  // tooltip have the opposite background and text colors
export function tooltipTextColor() { return theme.isDark ? color.light.text : color.dark.text };
export function tooltipBackgroundColor() { return theme.isDark ? color.light.background : color.dark.background };

export const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 0,
});

export function simpleNumbers(value) {
  return formatter.format(value);
};

export const labels = {
    usePointStyle: true,
    pointStyle: "line",

    generateLabels: (chart) => {
      return chart.data.datasets.map((dataset, i) => {
        const isVisible = chart.isDatasetVisible(i);

        return {
          text: dataset.label,
          hidden: !isVisible,
          strokeStyle: dataset.borderColor || dataset.backgroundColor || "#000",
          fontColor: isVisible ? textColor() : gridColor(),
          lineWidth: 3,
          pointStyle: "line",
          datasetIndex: i,
        };
      });
    },
};

export const tooltip = {
    titleColor: tooltipTextColor(),
    bodyColor: tooltipTextColor(),
    backgroundColor: tooltipBackgroundColor(),

    usePointStyle: true,
    callbacks: {
      labelPointStyle: function(context) {
        return { pointStyle: "line" }
      }
    }
};