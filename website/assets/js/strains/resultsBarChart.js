
/**
 * Renders a brushable horizontal bar chart for average {compound} values (e.g. terpenes, cannabinoids).
 * @param {string} containerSelector - e.g. '#terpeneChart' or '#cannabinoidChart'
 * @param {Object} strainData - The strain data object with fields like avg_alpha_pinene, avg_cbd, etc.
 * @param {string[]} compoundList - Array of compound names (e.g. ['cbc','cbg','cbn'] or the terpene list)
 */
export function renderResultsBarChart(containerSelector, strainData, compoundList) {
  ///////////////////////////////////////////////////////////////////////////
  ////////////////////// 1) Prepare your compound data ///////////////////////
  ///////////////////////////////////////////////////////////////////////////

  // Build an array like: [ { key: 0, compound: 'alpha_pinene', value: 0.12 }, ... ]
  // Filter out compounds that are NaN, null, undefined, or <= 0
  let chartData = [];
  let counter = 0;
  compoundList.forEach((compound) => {
    const avgKey = 'avg_' + compound;  // e.g. "avg_alpha_pinene" or "avg_cbd"
    let val = strainData[avgKey];
    if (val && !isNaN(val) && val > 0) {
      chartData.push({
        key: counter++,
        compound: compound,
        value: val
      });
    }
  });

  // Sort descending by value
  chartData.sort((a, b) => b.value - a.value);

  // If no positive data, display a message
  if (chartData.length === 0) {
    d3.select(containerSelector).html('<p>No data available.</p>');
    return;
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////// 2) Compute chart sizes & remove old /////////////////
  ///////////////////////////////////////////////////////////////////////////

  // Remove any old chart (if re-rendering)
  d3.select(containerSelector).selectAll('*').remove();

  const barHeight = 20;
  const maxBars   = 20; // how many bars visible at once before needing to scroll
  const mainHeight = Math.min(chartData.length, maxBars) * barHeight;
  const miniHeight = mainHeight;

  const mainMargin = { top: 10, right: 10, bottom: 30, left: 140 },
        miniMargin = { top: 10, right: 10, bottom: 30, left: 10 };

  const mainWidth  = 500 - mainMargin.left - mainMargin.right; 
  const miniWidth  = 100 - miniMargin.left - miniMargin.right;

  const svgWidth  = mainWidth + mainMargin.left + mainMargin.right + miniWidth + miniMargin.left + miniMargin.right;
  const svgHeight = mainHeight + mainMargin.top + mainMargin.bottom;

  // For mousewheel zoom in the mini chart
  const zoomer = d3.behavior.zoom().on("zoom", null);

  ///////////////////////////////////////////////////////////////////////////
  /////////////////////// 3) Create the main SVG & groups ///////////////////
  ///////////////////////////////////////////////////////////////////////////

  const svg = d3.select(containerSelector)
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
    .attr("class", "mainGroupWrapper")
    .attr("transform", `translate(${mainMargin.left},${mainMargin.top})`);

  const mainGroup = mainGroupWrapper.append("g")
    .attr("clip-path", `url(#clip-${containerSelector})`)
    .style("clip-path", `url(#clip-${containerSelector})`)
    .attr("class", "mainGroup");

  // Mini group (on the right)
  const miniGroup = svg.append("g")
    .attr("class", "miniGroup")
    .attr("transform", `translate(${mainMargin.left + mainWidth + mainMargin.right + miniMargin.left},${miniMargin.top})`);

  // Brush group
  const brushGroup = svg.append("g")
    .attr("class", "brushGroup")
    .attr("transform", `translate(${mainMargin.left + mainWidth + mainMargin.right + miniMargin.left},${miniMargin.top})`);

  ///////////////////////////////////////////////////////////////////////////
  ///////////////// 4) Create scales, axes, and color mapping ///////////////
  ///////////////////////////////////////////////////////////////////////////

  // X scales
  const mainXScale = d3.scale.linear().range([0, mainWidth]);
  const miniXScale = d3.scale.linear().range([0, miniWidth]);

  // Y scales (ordinal for bars)
  const mainYScale = d3.scale.ordinal()
    .domain(chartData.map(d => d.compound))
    .rangeBands([0, mainHeight], 0.1, 0);

  const miniYScale = d3.scale.ordinal()
    .domain(chartData.map(d => d.compound))
    .rangeBands([0, miniHeight], 0.1, 0);

  // Domain for X
  mainXScale.domain([0, d3.max(chartData, d => d.value)]);
  miniXScale.domain([0, d3.max(chartData, d => d.value)]);

  // For brushing: track pixel range of the Y dimension
  const mainYZoom = d3.scale.linear()
    .range([0, mainHeight])
    .domain([0, mainHeight]);

  // Axes
  const mainXAxis = d3.svg.axis()
    .scale(mainXScale)
    .orient("bottom")
    .ticks(5);

  // Y-axis labels
  const mainYAxis = d3.svg.axis()
    .scale(mainYScale)
    .orient("left")
    .tickSize(0)
    .tickFormat(d => formatCompoundName(d));

  // Append x-axis (unclipped)
  mainGroupWrapper.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${mainHeight})`)
    .call(mainXAxis);

  // Append y-axis (clipped)
  mainGroup.append("g")
    .attr("class", "y axis")
    .call(mainYAxis);

  // Make each label clickable:
  mainGroup.selectAll(".y.axis .tick text")
  .style("cursor", "pointer")
  .on("click", function(d) {
    const analyteId = compoundToAnalyteId(d);
    window.location.href = `/analytes/${analyteId}`;
  });

  // Color scale for each compound
  const colorScale = d3.scale.category20()
    .domain(chartData.map(d => d.compound));

  // Create a tooltip (once) for this chart
  const tooltip = d3.select("body")
  .append("div")
  .attr("class", "bar-tooltip")   // so you can style it with CSS
  .style("position", "absolute")
  .style("padding", "5px 8px")
  .style("background", "rgba(0, 0, 0, 0.7)")
  .style("color", "#fff")
  .style("border-radius", "4px")
  .style("font-size", "12px")
  .style("pointer-events", "none")
  .style("opacity", 0)           // start hidden
  .style("z-index", 9999);

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////// 5) Define the brush behavior ////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  // E.g., show ~1/3 of the data or at least 6 bars by default
  const defaultExtentCount = Math.max(6, Math.round(chartData.length * 0.33));
  const brush = d3.svg.brush()
    .y(miniYScale)
    .extent([
      miniYScale(chartData[0].compound),
      miniYScale(
        chartData[defaultExtentCount]
          ? chartData[defaultExtentCount].compound
          : chartData[chartData.length - 1].compound
      )
    ])
    .on("brush", brushmove);

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

  // Re-center on background click
  gBrush.select(".background")
    .on("mousedown.brush", brushcenter)
    .on("touchstart.brush", brushcenter);

  ///////////////////////////////////////////////////////////////////////////
  ////////////////// 6) Clip path (so main bars don’t overflow) /////////////
  ///////////////////////////////////////////////////////////////////////////

  const defs = svg.append("defs");
  defs.append("clipPath")
    .attr("id", `clip-${containerSelector}`)
    .append("rect")
    .attr("x", -mainMargin.left)
    .attr("width", mainWidth + mainMargin.left)
    .attr("height", mainHeight);


  // A glow filter for the bar strokes
  const filter = defs.append('filter')
  .attr('id', 'bar-glow'); // you can use a dynamic ID if needed

  filter.append('feGaussianBlur')
  .attr('stdDeviation', '2.5')
  .attr('result', 'coloredBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////// 7) Render the “mini” bar chart //////////////////////
  ///////////////////////////////////////////////////////////////////////////

  const miniBars = miniGroup.selectAll(".mini-bar")
    .data(chartData, d => d.key);

  miniBars.enter().append("rect")
    .attr("class", "mini-bar")
    .attr("x", 0)
    .attr("y", d => miniYScale(d.compound))
    .attr("width", d => miniXScale(d.value))
    .attr("height", miniYScale.rangeBand())
    .style("fill", d => colorScale(d.compound));

  miniBars.exit().remove();

  // Start the brush
  gBrush.call(brush.event);

  ///////////////////////////////////////////////////////////////////////////
  ////////////////////////// 8) Main bars update /////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  function updateMainBars() {
    const bars = mainGroup.selectAll(".bar").data(chartData, d => d.key);
  
    // ENTER
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .on("mouseover", function(d) {
        tooltip
          .style('opacity', 1)
          // Format the content.
          .html(`
            <strong>${d.compound}</strong><br/>
            Avg.: ${d.value.toFixed(2)}%
          `);
      })
      .on("mousemove", function(d) {
        // Position the tooltip near the cursor.
        tooltip
          .style('left', (d3.event.pageX + 10) + 'px')
          .style('top',  (d3.event.pageY - 20) + 'px');
      })
      .on("mouseout", function() {
        // Hide tooltip.
        tooltip.style('opacity', 0);
      });
  
    // UPDATE
    bars
      .attr("y", d => mainYScale(d.compound))
      .attr("height", mainYScale.rangeBand())
      .attr("width", d => mainXScale(d.value))
      .style("fill", d => colorScale(d.compound))
      .style("fill-opacity", 0.2)
      .style("stroke", d => colorScale(d.compound))
      .style("stroke-width", 2)
      .style("filter", "url(#bar-glow)");
  
    // EXIT
    bars.exit().remove();
  }
 

  ///////////////////////////////////////////////////////////////////////////
  //////////////////////// 9) Brush & scroll functions //////////////////////
  ///////////////////////////////////////////////////////////////////////////

  function brushmove() {
    const extent = brush.extent();

    // Re-map mainYZoom to the brush’s selection
    const originalRange = mainYZoom.range();
    mainYZoom.domain(extent);

    // Update mainYScale’s range
    mainYScale.rangeBands(
      [ mainYZoom(originalRange[0]), mainYZoom(originalRange[1]) ],
      0.1, 0
    );

    // Redraw y-axis
    mainGroup.select(".y.axis").call(mainYAxis);

    // Determine which mini bars are within the brush’s extent
    const selectedCompounds = miniYScale.domain().filter(d => {
      const barTop = miniYScale(d);
      const barBottom = barTop + miniYScale.rangeBand();
      return barTop >= extent[0] && barBottom <= extent[1];
    });

    // Update color of mini bars outside the brush
    miniGroup.selectAll(".mini-bar")
      .style("fill", d => selectedCompounds.indexOf(d.compound) > -1
        ? colorScale(d.compound)
        : "#ccc"
      );

    // Update main bars
    updateMainBars();
  }

  function brushcenter() {
    const target = d3.event.target,
          extent = brush.extent(),
          size = extent[1] - extent[0],
          range = miniYScale.range(),
          y0 = d3.min(range) + size / 2,
          y1 = d3.max(range) + miniYScale.rangeBand() - size / 2,
          center = Math.max(y0, Math.min(y1, d3.mouse(target)[1]));

    d3.event.stopPropagation();
    gBrush
      .call(brush.extent([ center - size / 2, center + size / 2 ]))
      .call(brush.event);
  }

  function scroll() {
    const extent = brush.extent(),
          size = extent[1] - extent[0],
          range = miniYScale.range(),
          y0 = d3.min(range),
          y1 = d3.max(range) + miniYScale.rangeBand(),
          dy = d3.event.deltaY;
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


/**
 * For display in the label: underscores -> hyphens,
 * alpha -> α, beta -> β, gamma -> γ, delta -> δ, etc.
 */
function formatCompoundName(compound) {
  /** 
   * Format the compound name for display by:
   * 1. Converting underscores to hyphens
   * 2. Replacing English spellings of Greek letters with symbols
   * 3. Capitalizing the first letter of each word (except Greek symbols)
   */
  let display = compound.replace(/_/g, '-');
  const greekMap = {
    alpha: 'α',
    beta: 'β',
    gamma: 'γ',
    delta: 'δ'
  };
  Object.keys(greekMap).forEach(eng => {
    const re = new RegExp(eng, 'g');
    display = display.replace(re, greekMap[eng]);
  });
  let words = display.split('-');
  words = words.map(word => {
    if (Object.values(greekMap).includes(word)) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return words.join('-');
}

/**
 * For the URL: simply convert underscores -> hyphens (kebab-case).
 * We do NOT replace alpha->α in the URL unless your routes specifically require that.
 */
function compoundToAnalyteId(compound) {
  return compound.replace(/_/g, '-');
}