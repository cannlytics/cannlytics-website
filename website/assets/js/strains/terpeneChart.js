// List of terpenes to check
const TERPENE_LIST = [
  'alpha_bisabolol', 'alpha_cedrene', 'alpha_humulene', 'alpha_ocimene',
  'alpha_phellandrene', 'alpha_pinene', 'alpha_terpinene', 'beta_caryophyllene',
  'beta_myrcene', 'beta_ocimene', 'beta_pinene', 'borneol', 'camphene', 'camphor',
  'caryophyllene_oxide', 'cedrol', 'cineole', 'citral', 'citronellol', 'd_limonene',
  'delta_3_carene', 'dihydrocarveol', 'eucalyptol', 'fenchol', 'fenchone',
  'gamma_terpinene', 'geraniol', 'geranyl_acetate', 'guaiol', 'hexahydrothymol',
  'isoborneol', 'isopulegol', 'linalool', 'menthol', 'nerol', 'nerolidol',
  'p_cymene', 'p_mentha_1_5_diene', 'phytol', 'pulegone', 'sabinene', 'terpineol',
  'terpinolene', 'alpha_terpineol', 'trans_beta_farnesene', 'trans_nerolidol', 'valencene'
];

/**
 * Renders a brushable horizontal bar chart for average terpene values.
 * @param {Object} strainData - The strain data object with avg_ fields for terpenes.
 */
export function renderTerpeneChart(strainData) {

  ///////////////////////////////////////////////////////////////////////////
  ////////////////////// 1) Prepare your terpene data ///////////////////////
  ///////////////////////////////////////////////////////////////////////////

  // Build an array of objects like: [ {key: 0, terpene: 'alpha_pinene', value: 0.12}, ... ]
  // Filter out terpenes that are NaN, null, undefined, or <= 0
  let terpeneData = [];
  let counter = 0;
  TERPENE_LIST.forEach((terp) => {
    const avgKey = 'avg_' + terp; // e.g. avg_alpha_pinene
    let val = strainData[avgKey];
    if (val && !isNaN(val) && val > 0) {
      terpeneData.push({
        key: counter++,
        terpene: terp,
        value: val
      });
    }
  });

  // Sort descending by value
  terpeneData.sort((a, b) => b.value - a.value);

  // If no positive terpene data, display a message instead
  if (terpeneData.length === 0) {
    d3.select('#terpeneChart').html('<p>No terpene data available.</p>');
    return;
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////// 2) Compute chart sizes & remove old /////////////////
  ///////////////////////////////////////////////////////////////////////////

  // Remove any old chart (if re-rendering)
  d3.select('#terpeneChart').selectAll('*').remove();

  // Fix bar height so bars aren't too tall
  // We'll allow up to 20 bars visible at once before scrolling
  const barHeight = 20;
  const maxBars   = 20;
  // Height for the main chart: clamp to show at most 20 bars (plus a bit for brush)
  const mainHeight = Math.min(terpeneData.length, maxBars) * barHeight;
  // We can keep mini chart the same overall height or you can fix it
  const miniHeight = mainHeight;

  // Margins for main & mini
  const mainMargin = { top: 10, right: 10, bottom: 30, left: 140 },
        miniMargin = { top: 10, right: 10, bottom: 30, left: 10 };

  const mainWidth  = 500 - mainMargin.left - mainMargin.right; // Adjust as you wish
  const miniWidth  = 100 - miniMargin.left - miniMargin.right;

  // Overall SVG dimension
  const svgWidth  = mainWidth + mainMargin.left + mainMargin.right + miniWidth + miniMargin.left + miniMargin.right;
  const svgHeight = mainHeight + mainMargin.top + mainMargin.bottom;

  // For mousewheel zoom in the mini chart
  const zoomer = d3.behavior.zoom().on("zoom", null);

  ///////////////////////////////////////////////////////////////////////////
  /////////////////////// 3) Create the main SVG & groups ///////////////////
  ///////////////////////////////////////////////////////////////////////////

  const svg = d3.select('#terpeneChart')
    .append('svg')
    .attr('width',  svgWidth)
    .attr('height', svgHeight)
    .call(zoomer)
    .on("wheel.zoom", scroll)
    // Disable other default zoom behaviors
    .on("mousedown.zoom", null)
    .on("touchstart.zoom", null)
    .on("touchmove.zoom", null)
    .on("touchend.zoom", null);

  // Main group wrapper + clip
  const mainGroupWrapper = svg.append("g")
    .attr("class","mainGroupWrapper")
    .attr("transform", `translate(${mainMargin.left},${mainMargin.top})`);

  const mainGroup = mainGroupWrapper.append("g")
    .attr("clip-path", "url(#clip)")
    .style("clip-path", "url(#clip)")
    .attr("class","mainGroup");

  // Mini group (to the right)
  const miniGroup = svg.append("g")
    .attr("class","miniGroup")
    .attr("transform", `translate(${mainMargin.left + mainWidth + mainMargin.right + miniMargin.left},${miniMargin.top})`);

  // Brush group
  const brushGroup = svg.append("g")
    .attr("class","brushGroup")
    .attr("transform", `translate(${mainMargin.left + mainWidth + mainMargin.right + miniMargin.left},${miniMargin.top})`);

  ///////////////////////////////////////////////////////////////////////////
  ///////////////// 4) Create scales, axes, and color mapping ///////////////
  ///////////////////////////////////////////////////////////////////////////

  // X scales
  const mainXScale = d3.scale.linear().range([0, mainWidth]);
  const miniXScale = d3.scale.linear().range([0, miniWidth]);

  // Y scales (ordinal for bars)
  // We don’t use rangeBands(...) with big leftover if we want a fixed barHeight,
  // but to leverage brushing, we can do this:
  const mainYScale = d3.scale.ordinal()
    .domain(terpeneData.map(d => d.terpene))
    .rangeBands([0, mainHeight], 0.1, 0);

  const miniYScale = d3.scale.ordinal()
    .domain(terpeneData.map(d => d.terpene))
    .rangeBands([0, miniHeight], 0.1, 0);

  // Domain for X scales
  mainXScale.domain([0, d3.max(terpeneData, d => d.value)]);
  miniXScale.domain([0, d3.max(terpeneData, d => d.value)]);

  // For brushing: just track pixel range of the Y dimension
  const mainYZoom = d3.scale.linear()
    .range([0, mainHeight])
    .domain([0, mainHeight]);

  // Create axes
  const mainXAxis = d3.svg.axis()
    .scale(mainXScale)
    .orient("bottom")
    .ticks(5);

  const mainYAxis = d3.svg.axis()
    .scale(mainYScale)
    .orient("left")
    .tickSize(0);

  // Append x axis in mainGroupWrapper (so it’s not clipped)
  mainGroupWrapper.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${mainHeight})`)
    .call(mainXAxis);

  // Append y axis in mainGroup
  mainGroup.append("g")
    .attr("class", "y axis")
    .call(mainYAxis);

  // A color scale that assigns a consistent color to each terpene
  // (Uses d3 v3’s category20)
  const colorScale = d3.scale.category20()
    .domain(terpeneData.map(d => d.terpene));

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////// 5) Define the brush behavior ////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  // Set a default brush window to ~33% of the data or 6 bars, whichever is larger.
  const defaultExtentCount = Math.max(6, Math.round(terpeneData.length * 0.33));
  const brush = d3.svg.brush()
    .y(miniYScale)
    .extent([
      miniYScale(terpeneData[0].terpene),
      miniYScale(
        terpeneData[defaultExtentCount]
          ? terpeneData[defaultExtentCount].terpene
          : terpeneData[terpeneData.length - 1].terpene
      )
    ])
    .on("brush", brushmove);

  // Add the brush to the brushGroup
  const gBrush = brushGroup.append("g")
    .attr("class", "brush")
    .call(brush);

  gBrush.selectAll(".resize")
    .append("line")
    .attr("x2", miniWidth);

  gBrush.selectAll(".resize")
    .append("path")
    .attr("d", d3.svg.symbol().type("triangle-up").size(20))
    .attr("transform", function(d, i) {
      // Flip the triangle for bottom handle
      return i
        ? `translate(${miniWidth / 2},4) rotate(180)`
        : `translate(${miniWidth / 2},-4) rotate(0)`;
    });

  gBrush.selectAll("rect")
    .attr("width", miniWidth);

  // Recentering the brush if user clicks on background
  gBrush.select(".background")
    .on("mousedown.brush", brushcenter)
    .on("touchstart.brush", brushcenter);

  ///////////////////////////////////////////////////////////////////////////
  ////////////////// 6) Clip path (so main bars don’t overflow) /////////////
  ///////////////////////////////////////////////////////////////////////////

  const defs = svg.append("defs");

  defs.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", -mainMargin.left)
    .attr("width", mainWidth + mainMargin.left)
    .attr("height", mainHeight);

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////// 7) Render the “mini” bar chart //////////////////////
  ///////////////////////////////////////////////////////////////////////////

  // Mini bars
  const miniBars = miniGroup.selectAll(".mini-bar")
    .data(terpeneData, d => d.key);

  miniBars.enter().append("rect")
    .attr("class", "mini-bar")
    .attr("x", 0)
    .attr("y", d => miniYScale(d.terpene))
    .attr("width", d => miniXScale(d.value))
    .attr("height", miniYScale.rangeBand())
    .style("fill", d => colorScale(d.terpene));

  miniBars.exit().remove();

  // Start the brush programmatically
  gBrush.call(brush.event);

  ///////////////////////////////////////////////////////////////////////////
  ////////////////////////// 8) Main bars update /////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  // Function to redraw the main bars
  function updateMainBars() {
    const bars = mainGroup.selectAll(".bar")
      .data(terpeneData, d => d.key);

    // Enter
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0);

    // Update
    bars
      .attr("y", d => mainYScale(d.terpene))
      .attr("height", mainYScale.rangeBand())
      .attr("width", d => mainXScale(d.value))
      .style("fill", d => colorScale(d.terpene));

    // Exit
    bars.exit().remove();
  }

  ///////////////////////////////////////////////////////////////////////////
  //////////////////////// 9) Brush & scroll functions //////////////////////
  ///////////////////////////////////////////////////////////////////////////

  // On brush move, update which bars are visible in main chart
  function brushmove() {
    const extent = brush.extent();

    // Re-map the mainYZoom domain to the brush’s selection
    const originalRange = mainYZoom.range();
    mainYZoom.domain(extent);

    // Update mainYScale to reflect new domain
    mainYScale.rangeBands(
      [ mainYZoom(originalRange[0]), mainYZoom(originalRange[1]) ],
      0.1,
      0
    );

    // Redraw the main y-axis
    mainGroup.select(".y.axis").call(mainYAxis);

    // Determine which mini bars are within the brush’s extent
    const selectedTerpenes = miniYScale.domain().filter(d => {
      const barTop = miniYScale(d);
      const barBottom = barTop + miniYScale.rangeBand();
      return barTop >= extent[0] && barBottom <= extent[1];
    });

    // Update color of mini bars outside the brush
    miniGroup.selectAll(".mini-bar")
      .style("fill", d =>
        selectedTerpenes.indexOf(d.terpene) > -1
          ? colorScale(d.terpene)
          : "#ccc"
      );

    // Update main bars
    updateMainBars();
  }

  // Recenters the brush window if user clicks on the background
  function brushcenter() {
    const target = d3.event.target,
          extent = brush.extent(),
          size   = extent[1] - extent[0],
          range  = miniYScale.range(),
          y0     = d3.min(range) + size / 2,
          y1     = d3.max(range) + miniYScale.rangeBand() - size / 2,
          center = Math.max(y0, Math.min(y1, d3.mouse(target)[1]));

    d3.event.stopPropagation();
    gBrush
      .call(brush.extent([center - size / 2, center + size / 2]))
      .call(brush.event);
  }

  // Mouse wheel scroll on the mini chart
  function scroll() {
    const extent = brush.extent(),
          size   = extent[1] - extent[0],
          range  = miniYScale.range(),
          y0     = d3.min(range),
          y1     = d3.max(range) + miniYScale.rangeBand(),
          dy     = d3.event.deltaY;
    let topSection;

    if (extent[0] - dy < y0) {
      topSection = y0;
    } else if (extent[1] - dy > y1) {
      topSection = y1 - size;
    } else {
      topSection = extent[0] - dy;
    }

    d3.event.stopPropagation();
    d3.event.preventDefault();

    gBrush
      .call(brush.extent([topSection, topSection + size]))
      .call(brush.event);
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////// 10) Initialize main bars ////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  updateMainBars();
}
