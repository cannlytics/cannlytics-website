import { RadarChart } from './RadarChart.js';

/**
 * Configuration object defining how to process and display compound data
 * @typedef {Object} CompoundConfig
 * @property {string} containerId - The HTML element ID for the chart
 * @property {string[]} compoundList - List of compounds to check
 * @property {number} [maxCompounds] - Maximum number of compounds to show (optional)
 * @property {number} [maxValue] - Maximum value for the radar chart (optional)
 * @property {Function} formatLabel - Function to format compound names
 * @property {string[]} [colors] - Array of colors to use for the chart
 */

/**
 * Renders a radar chart showing the chemical compound profile of a strain
 * @param {Object} strainData - The strain data object with avg_ fields
 * @param {CompoundConfig} config - Configuration for the visualization
 */
export function renderCompoundRadarChart(strainData, config) {
  // First process the data into the format needed for the radar chart
  const processedData = processCompoundData(strainData, config);
  
  // If no compound data available, display a message
  if (processedData[0].length === 0) {
    d3.select(`#${config.containerId}`).html('<p>No compound data available.</p>');
    return;
  }

  // Set up the basic dimensions with responsive sizing
  const margin = {top: 100, right: 100, bottom: 100, left: 100};
  const width = Math.min(420, window.innerWidth - 10) - margin.left - margin.right;
  const height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

  // Calculate maxValue if not provided in config
  const maxValue = config.maxValue || calculateMaxValue(processedData[0]);

  // Configure the radar chart options
  const radarChartOptions = {
    w: width,
    h: height,
    margin: margin,
    maxValue: maxValue,
    levels: 5,
    roundStrokes: true,
    color: d3.scale.ordinal().range(config.colors || ['#2E8B57']),
    opacityArea: 0.35,
    strokeWidth: 3,
    dotRadius: 4,
    labelFactor: 1.3,     // Increased from 1.2 to move labels further out
    wrapWidth: 100,       // Increased from 80 to allow more text
    opacityCircles: 0.1,
    legend: false,        // No legend needed for single dataset
    axisLabel: {          // Added explicit label styling
      fontSize: '11px',
      fontFamily: 'Arial'
    },
  };

  // Call the RadarChart function
  RadarChart(`#${config.containerId}`, processedData, radarChartOptions);
}

/**
 * Process the strain data into the format needed for the radar chart
 * @param {Object} strainData - The raw strain data
 * @param {CompoundConfig} config - Configuration object
 * @returns {Array} - Array containing one array of compound values
 */
function processCompoundData(strainData, config) {
  // Create array of {axis: "name", value: number} objects
  let compoundData = config.compoundList
    .map(compound => {
      const avgKey = 'avg_' + compound;
      let value = strainData[avgKey];
      
      // Only include if we have a valid positive value
      if (value && !isNaN(value) && value > 0) {
        return {
          compound: compound,
          axis: config.formatLabel(compound),
          value: value / 100  // Convert percentage to decimal
        };
      }
      return null;
    })
    .filter(item => item !== null);

  // Sort by value descending
  compoundData.sort((a, b) => b.value - a.value);

  // If maxCompounds is specified, limit to that number
  if (config.maxCompounds && config.maxCompounds > 0) {
    compoundData = compoundData.slice(0, config.maxCompounds);
  }

  // Return as an array containing one dataset
  return [compoundData];
}

/**
 * Calculate the maximum value for the radar chart scale
 * @param {Array} data - The processed compound data
 * @returns {number} - The maximum value to use for the chart
 */
function calculateMaxValue(data) {
  const maxDataValue = Math.max(...data.map(d => d.value));
  // Round up to the next 0.1 increment for a nice scale
  return Math.ceil(maxDataValue * 10) / 10;
}

// Example usage for cannabinoids:
export function renderCannabinoidRadarChart(strainData) {
  renderCompoundRadarChart(strainData, {
    containerId: 'cannabinoidChart',
    compoundList: [
      'cbc', 'cbca', 'cbcv', 'cbd', 'cbda', 'cbdv', 'cbdva', 'cbg', 'cbga',
      'cbl', 'cbla', 'cbn', 'cbna', 'cbt', 'delta_8_thc', 'delta_9_thc',
      'thcv', 'thcva'
    ],
    formatLabel: (name) => {
      if (name === 'delta_8_thc') return 'Δ8-THC';
      if (name === 'delta_9_thc') return 'Δ9-THC';
      return name.toUpperCase().replace(/_/g, ' ');
    },
    colors: ['#2E8B57'],  // Sea Green
    maxValue: 0.05,
  });
}

// Example usage for terpenes:
export function renderTerpeneRadarChart(strainData) {
  renderCompoundRadarChart(strainData, {
    containerId: 'terpeneChart',
    compoundList: [
      'alpha_bisabolol', 'alpha_cedrene', 'alpha_humulene', 'alpha_ocimene',
      'alpha_phellandrene', 'alpha_pinene', 'alpha_terpinene', 'beta_caryophyllene',
      'beta_myrcene', 'beta_ocimene', 'beta_pinene', 'borneol', 'camphene', 'camphor',
      'caryophyllene_oxide', 'cedrol', 'cineole', 'citral', 'citronellol', 'd_limonene',
      'delta_3_carene', 'dihydrocarveol', 'eucalyptol', 'fenchol', 'fenchone',
      'gamma_terpinene', 'geraniol', 'geranyl_acetate', 'guaiol', 'hexahydrothymol',
      'isoborneol', 'isopulegol', 'linalool', 'menthol', 'nerol', 'nerolidol',
      'p_cymene', 'p_mentha_1_5_diene', 'phytol', 'pulegone', 'sabinene', 'terpineol',
      'terpinolene', 'alpha_terpineol', 'trans_beta_farnesene', 'trans_nerolidol',
      'valencene'
    ],
    maxCompounds: 6,  // Limit to top 8 terpenes
    formatLabel: (name) => {
      // Special cases for common terpene prefixes
      const formatted = name
        .replace('alpha_', 'α-')
        .replace('beta_', 'β-')
        .replace('gamma_', 'γ-')
        .replace('delta_', 'δ-')
        .replace('trans_', 'trans-')
        .replace(/_/g, ' ')
        .toUpperCase();
      
      // Break long names into multiple lines if needed
      const parts = formatted.split(' ');
      if (parts.length > 2) {
        return parts[0] + '\n' + parts.slice(1).join(' ');
      }
      return formatted;
    },
    colors: ['#4682B4'],  // Steel Blue
    maxValue: 0.02,
  });
}
