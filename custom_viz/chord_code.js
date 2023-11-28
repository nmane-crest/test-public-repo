looker.plugins.visualizations.add({
  create: function (element, config) {
    // Create a container element for the visualization
    var container = element.appendChild(document.createElement("div"));
    container.className = "my-chord-container";

    // Initialize the visualization properties
    this.chart = d3.select(container).append("svg");

    // Apply styles to the container
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "scroll";

    // Apply styles to the SVG
    this.chart.style("width", "100%");
    this.chart.style("height", "100%");
    this.chart.style("overflow-x", "scroll");
  },

  updateAsync: function (data, element, config, queryResponse, details, doneRendering) {
    // Clear any existing content
    this.chart.selectAll("*").remove();

    // Extract data from Looker response
    var matrix = [];
    var dimensionNames = [];

    data.forEach(function (row) {
      var rowData = [];
      queryResponse.fields.dimension_like.forEach(function (field, i) {
        rowData.push(row[field.name].value);
        if (i === 0) dimensionNames.push(row[field.name].value);
      });
      matrix.push(rowData);
    });

    // Set up the chord layout
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    var outerRadius = Math.min(width, height) * 0.5 - 40;
    var innerRadius = outerRadius - 30;

    var chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending);

    var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    var ribbon = d3.ribbon()
      .radius(innerRadius);

    // Create a color scale with a vibrant color scheme
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create chord data
    var chordData = chord(matrix);

    // Center the chart within its container
    var svg = this.chart.attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Draw chords with gradient fill for a wow effect
    svg.append("g")
      .selectAll("path")
      .data(chordData)
      .enter().append("path")
      .attr("d", ribbon)
      .style("fill", function (d) {
        return "url(#gradient" + d.source.index + ")";
      })
      .style("stroke", "white")
      .style("stroke-width", "1px");

    // Define gradients for each chord
    var gradients = svg.append("defs").selectAll("linearGradient")
      .data(chordData)
      .enter().append("linearGradient")
      .attr("id", function (d) {
        return "gradient" + d.source.index;
      })
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", function (d) {
        return Math.cos((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2);
      })
      .attr("y1", function (d) {
        return Math.sin((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2);
      })
      .attr("x2", function (d) {
        return Math.cos((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2);
      })
      .attr("y2", function (d) {
        return Math.sin((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2);
      });

    // Set color stops for gradients
    gradients.append("stop")
      .attr("offset", "0%")
      .attr("style", function (d) {
        return "stop-color:" + colorScale(d.source.index);
      });

    gradients.append("stop")
      .attr("offset", "100%")
      .attr("style", function (d) {
        return "stop-color:" + colorScale(d.target.index);
      });

    // Draw groups with vibrant fill
    var group = svg.append("g")
      .selectAll("g")
      .data(chordData.groups)
      .enter().append("g");

    group.append("path")
      .style("fill", function (d) {
        return colorScale(d.index);
      })
      .style("stroke", "white")
      .style("stroke-width", "1px")
      .attr("d", arc);

    group.append("text")
      .each(function (d) {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr("dy", ".35em")
      .attr("transform", function (d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
          "translate(" + (innerRadius + 26) + ")" +
          (d.angle > Math.PI ? "rotate(180)" : "");
      })
      .style("text-anchor", function (d) {
        return d.angle > Math.PI ? "end" : null;
      })
      .text(function (d) {
        return dimensionNames[d.index];
      })
      .style("fill", "white");

    // Signal that the rendering is complete
    doneRendering();
  },
});
