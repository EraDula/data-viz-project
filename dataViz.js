const scrollToTopButton = document.getElementById('scroll-to-top');

scrollToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// set the dimensions and margins of the graph
var margin = { top: 10, right: 20, bottom: 30, left: 50 },
  width = 760 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right + 10)
  .attr("height", height + margin.top + margin.bottom + 15)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .style("position", "absolute");

//Read the data
d3.csv("KAG_conversion_data.csv", function (data) {
  // List of groups (here I have one group per column)
  var allGroup = ["Clicks", "Spent", "Total_Conversion"];

  // add the options to the button
  d3.select("#selectButton")
    .selectAll("myOptions")
    .data(allGroup)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    }) // text showed in the menu
    .attr("value", function (d) {
      return d;
    });
  // corresponding value returned by the button

  // Add X axis --> it is a date format
  var x = d3.scaleLinear().domain([0, 500]).range([0, width]);
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // append x axis label
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 30) + ")"
    )
    .style("text-anchor", "middle")
    .text("Clicks (X)");

  // Add Y axis
  var y = d3.scaleLinear().domain([0, 30]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // add y axis label
  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Approved Conversions (Y)");

  var z = d3.scaleLinear().domain([0, 3100000]).range([4, 20]);

  var color = d3
    .scaleOrdinal()
    .domain(allGroup)
    .range(["#EB8B8B", "#00A6CE", "#B4DBB6"]);

  var tooltip = d3
    .select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("z-index", 2)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white");

  var showTooltip = function (d) {
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip
      .html(
        "Clicks: " +
          d.Clicks +
          "<br>" +
          "Approved Conversion: " +
          d.Approved_Conversion +
          "<br>" +
          "Impressions: " +
          d.Impressions
      )
      .style("left", d3.mouse(this)[0] + 30 + "px")
      .style("top", d3.mouse(this)[1] + 30 + "px");
  };
  var moveTooltip = function (d) {
    tooltip
      .style("left", d3.mouse(this)[0] + 30 + "px")
      .style("top", d3.mouse(this)[1] + 30 + "px");
  };
  var hideTooltip = function (d) {
    tooltip.transition().duration(200).style("opacity", 0);
  };

  // Initialize dots with group a
  var dot = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "bubbles")
    .on("mouseover", showTooltip)
    .on("mouseleave", hideTooltip)
    .attr("cx", function (d) {
      return x(+d.Clicks);
    })
    .attr("cy", function (d) {
      return y(+d.Approved_Conversion);
    })
    .attr("r", function (d) {
      return z(d.Impressions);
    })
    .style("fill", function (d) {
      return color("Clicks");
    });
    

  var valuesToShow = [1, 1000000, 3500000];
  var xCircle = 600;
  var xLabel = 550;
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function (d) {
      return height - 500 - z(d);
    })
    .attr("r", function (d) {
      return z(d);
    })
    .style("fill", "none")
    .attr("stroke", "black");

  // Add legend: segments
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr("x1", function (d) {
      return xCircle + z(d);
    })
    .attr("x2", xLabel)
    .attr("y1", function (d) {
      return height - 500 - z(d);
    })
    .attr("y2", function (d) {
      return height - 500 - z(d);
    })
    .attr("stroke", "black")
    .style("stroke-dasharray", "2,2");

  // Add legend: labels
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr("x", xLabel - 40)
    .attr("y", function (d) {
      return height - 500 - z(d);
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", 10)
    .attr("alignment-baseline", "middle");

  // Legend title
  svg
    .append("text")
    .attr("x", xCircle)
    .attr("y", height - 500 + 30)
    // .text("Impressions (I)")
    .attr("text-anchor", "middle")
    .html("<tspan font-weight='bold'>Size: </tspan>Number of AD impressions");

  function findMaxXValue(dataFilter) {
    return d3.max(dataFilter, function (d) {
      return +d.value;
    });
  }
  // A function that update the chart
  function update(selectedGroup) {
    // Create new data with the selection?
    var dataFilter = data.map(function (d) {
      return {
        value: d[selectedGroup],
        Approved_Conversion: d.Approved_Conversion,
        Impressions: d.Impressions,
      };
    });

    x.domain([0, findMaxXValue(dataFilter)]);

    svg.select(".x-axis").transition().duration(1500).call(d3.axisBottom(x));

    svg.select(".x-axis-label").text(selectedGroup + " (X)");

    dot
      .data(dataFilter)
      .on("mouseover", function (d) {
        tooltip.transition().duration(200);
        tooltip
          .style("opacity", 1)
          .html(
            selectedGroup +
              ": " +
              d.value +
              "<br>" +
              "Approved Conversion: " +
              d.Approved_Conversion +
              "<br>" +
              "Impressions: " +
              d.Impressions
          )
          .style("left", d3.mouse(this)[0] + 30 + "px")
          .style("top", d3.mouse(this)[1] + 30 + "px");
      })
      .on("mouseleave", hideTooltip)
      .transition()
      .duration(1500)
      .attr("cx", function (d) {
        return x(+d.value);
      })
      .attr("cy", function (d) {
        return y(+d.Approved_Conversion);
      })
      .style("fill", function (d) {
        return color(selectedGroup);
      });

    var showLine = d3.select("#flexSwitchCheckDefault").property("checked");
    addRegression(selectedGroup, showLine);
  }

  function calculateRegressionValues(dataPoints) {
    console.log(dataPoints);
    let sumXY = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (const point of dataPoints) {
      let xValue = parseFloat(point.value);
      let yValue = parseFloat(point.Approved_Conversion);
      sumXY += xValue * yValue;
      sumX += xValue;
      sumY += yValue;
      sumXSquared += xValue * xValue;
      sumYSquared += yValue * yValue;
    }

    let gradient = parseFloat(
      (
        (dataPoints.length * sumXY - sumX * sumY) /
        (dataPoints.length * sumXSquared - sumX * sumX)
      ).toFixed(3)
    );
    let intercept = parseFloat(
      ((sumY - gradient * sumX) / dataPoints.length).toFixed(3)
    );
    let r = parseFloat(
      (
        (dataPoints.length * sumXY - sumX * sumY) /
        Math.sqrt(
          (dataPoints.length * sumXSquared - sumX * sumX) *
            (dataPoints.length * sumYSquared - sumY * sumY)
        )
      ).toFixed(5)
    );

    return { gradient, intercept, r };
  }

  function addRegression(selectedGroup, showLine) {
    svg.select(".regression-line").remove();
    // Create new data with the selection?
    let dataFilter = data.map(function (d) {
      return {
        value: d[selectedGroup],
        Approved_Conversion: d.Approved_Conversion,
      };
    });

    let { gradient, intercept, r } = calculateRegressionValues(dataFilter);
    console.log(gradient, intercept);
    let lineEquation = (x) => gradient * x + intercept;

    let xScale = d3
      .scaleLinear()
      .domain([0, findMaxXValue(dataFilter)])
      .range([0, width]);

    let yScale = d3.scaleLinear().domain([0, 30]).range([height, 0]);

    let lineData = d3
      .range(0, 700, 0.1)
      .map((x) => ({ x: x, y: lineEquation(x) }));

    var showRegressionTip = function (d) {
      tooltip.transition().duration(200);
      tooltip
        .style("opacity", 1)
        .html(
          "Line: Y = " +
            gradient +
            "X" +
            " + " +
            intercept +
            "<br>" +
            "R (Correlation Coefficient): " +
            r
        )
        .style("left", d3.mouse(this)[0] + 30 + "px")
        .style("top", d3.mouse(this)[1] + 30 + "px");
    };
    // Remove the line from the graph if showLine is false
    if (!showLine) {
      svg.select(".regression-line").remove();
      return;
    }
    // Add the line to the graph
    svg
      .append("path")
      .attr("class", "regression-line")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 4)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y))
          .curve(d3.curveLinear)
      )
      .on("mouseover", showRegressionTip)
      .on("mousemove", moveTooltip)
      .on("mouseleave", hideTooltip);

  }

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function (d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value");
    // run the updateChart function with this selected option
    update(selectedOption);
  });

  // When the button is changed, run the updateChart function
  d3.select("#flexSwitchCheckDefault").on("change", function (d) {
    // recover the option that has been chosen
    var selectedOption = d3.select("#selectButton").property("value");
    var showLine = d3.select(this).property("checked");
    addRegression(selectedOption, showLine);
  });
});
