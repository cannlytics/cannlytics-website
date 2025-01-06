import { RadarChart } from './RadarChart.js';

// List of cannabinoids we want to display
const CANNABINOID_LIST = [
  'cbc', 'cbca', 'cbcv', 'cbd', 'cbda', 'cbdv', 'cbdva', 'cbg', 'cbga', 
  'cbl', 'cbla', 'cbn', 'cbna', 'cbt', 'delta_8_thc', 'delta_9_thc', 
  'thcv', 'thcva', // 'thca',
];

/**
 * Renders a radar chart showing the cannabinoid profile of a strain
 * @param {Object} strainData - The strain data object with avg_ fields for cannabinoids
 */
export function renderCannabinoidChart(strainData) {
  // First process the data into the format needed for the radar chart
  const processedData = processData(strainData);
  
  // If no cannabinoid data available, display a message
  if (processedData[0].length === 0) {
    d3.select('#cannabinoidChart').html('<p>No cannabinoid data available.</p>');
    return;
  }

  // Set up the basic dimensions
  const margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

  // Configure the radar chart options
  const radarChartOptions = {
    w: width,
    h: height,
    margin: margin,
    maxValue: 0.05,           // Typical max percentage for cannabinoids
    levels: 5,               // Number of circles in the radar
    roundStrokes: true,      // Make the shape smoother
    color: d3.scale.ordinal().range(['#2E8B57']),  // Sea Green color
    opacityArea: 0.35,       // Opacity of the fill
    strokeWidth: 3,          // Width of the outline
    dotRadius: 4,            // Size of the dots at each point
    labelFactor: 1.2,        // How far out to place the labels
    wrapWidth: 80,           // When to wrap label text
    opacityCircles: 0.1      // Opacity of the background circles
  };

  // Call the RadarChart function
  RadarChart("#cannabinoidChart", processedData, radarChartOptions);
}

/**
 * Process the strain data into the format needed for the radar chart
 * @param {Object} strainData - The raw strain data
 * @returns {Array} - Array containing one array of cannabinoid values
 */
function processData(strainData) {
  // Create array of {axis: "name", value: number} objects
  const cannabinoidData = CANNABINOID_LIST
    .map(cannabinoid => {
      const avgKey = 'avg_' + cannabinoid;
      let value = strainData[avgKey];
      
      // Only include if we have a valid positive value
      if (value && !isNaN(value) && value > 0) {
        return {
          axis: formatCannabinoidName(cannabinoid),
          value: value / 100  // Convert percentage to decimal
        };
      }
      return null;
    })
    .filter(item => item !== null); // Remove null entries

  // Return as an array containing one dataset
  return [cannabinoidData];
}

/**
 * Format cannabinoid names for display
 * @param {string} name - The raw cannabinoid name
 * @returns {string} - Formatted name for display
 */
function formatCannabinoidName(name) {
  // Handle special cases
  if (name === 'delta_8_thc') return 'Δ8-THC';
  if (name === 'delta_9_thc') return 'Δ9-THC';
  
  // Convert to uppercase and remove underscores
  return name.toUpperCase().replace(/_/g, ' ');
}