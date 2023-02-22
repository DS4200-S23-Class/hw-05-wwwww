const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500;
const MARGINS = { left: 50, right: 50, top: 50, bottom: 50 };

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

const CIRCLE_COLOR = "blue";
const RECT_COLOR = "green";

const FRAME1 = d3
  .select("#scatterplot")
  .append("svg")
  .attr("height", FRAME_HEIGHT)
  .attr("width", FRAME_WIDTH)
  .attr("class", "frame");

const FRAME2 = d3
  .select("#barchart")
  .append("svg")
  .attr("height", FRAME_HEIGHT)
  .attr("width", FRAME_WIDTH)
  .attr("class", "frame");

const USER_ADDED_POINTS = [];

const drawScatterplot = () => {
  d3.csv("../data/scatter-data.csv").then((data) => {
    const MAX_X = d3.max(data, (d) => parseInt(d.x));
    const X_SCALE = d3
      .scaleLinear()
      .domain([0, MAX_X + 1])
      .range([0, VIS_WIDTH]);

    const MAX_Y = d3.max(data, (d) => parseInt(d.y));
    const Y_SCALE = d3
      .scaleLinear()
      .domain([0, MAX_Y + 1])
      .range([VIS_HEIGHT, 0]);

    FRAME1.html("")
      .selectAll("circle")
      .data([...data, ...USER_ADDED_POINTS])
      .enter()
      .append("circle")
      .attr("cx", (d) => X_SCALE(d.x) + MARGINS.left)
      .attr("cy", (d) => Y_SCALE(d.y) + MARGINS.top)
      .attr("r", 10)
      .attr("fill", () => CIRCLE_COLOR)
      .attr("stroke-width", 3)
      .on("mouseenter", (e) => {
        const circle = e.target;
        circle.setAttribute("fill", "green");
      })
      .on("mouseleave", (e) => {
        const circle = e.target;
        circle.setAttribute("fill", CIRCLE_COLOR);
      })
      .on("click", (e, d) => {
        const circle = e.target;
        const lastClick = document.querySelector("#last-click");
        lastClick.innerHTML = `Last point clicked: (${d.x},${d.y})`;
        if (circle.getAttribute("stroke")) {
          circle.removeAttribute("stroke");
        } else {
          circle.setAttribute("stroke", "red");
        }
      });

    FRAME1.append("g")
      .attr(
        "transform",
        `translate(${MARGINS.left},${VIS_HEIGHT + MARGINS.top})`
      )
      .call(d3.axisBottom(X_SCALE).ticks(10))
      .attr("font-size", "20px");

    FRAME1.append("g")
      .attr("transform", `translate(${MARGINS.left},${MARGINS.top})`)
      .call(d3.axisLeft(Y_SCALE).ticks(10))
      .attr("font-size", "20px");
  });
};

// Dynamic value display
const xAxisSlider = document.querySelector("#xAxis");
const xAxisOutput = document.querySelector("#xOutput");
const yAxisSlider = document.querySelector("#yAxis");
const yAxisOutput = document.querySelector("#yOutput");
xAxisOutput.innerHTML = xAxisSlider.value;
yAxisOutput.innerHTML = yAxisSlider.value;

// Update the current slider value (each time you drag the slider handle)
xAxisSlider.oninput = (val) => {
  xAxisOutput.innerHTML = val.target.value;
};
yAxisSlider.oninput = (val) => {
  yAxisOutput.innerHTML = val.target.value;
};

const addPoint = () => {
  USER_ADDED_POINTS.push({ x: xAxisSlider.value, y: yAxisSlider.value });
  drawScatterplot();
};

// Bar chart
const drawBarchart = async () => {
  const data = await d3.csv("../data/bar-data.csv");

  const X_SCALE = d3
    .scaleBand()
    .domain(data.map((row) => row.category))
    .range([0, VIS_WIDTH])
    .padding(0.5);

  const MAX_Y = d3.max(data, (d) => parseInt(d.amount));
  const Y_SCALE = d3.scaleLinear().domain([0, MAX_Y]).range([VIS_HEIGHT, 0]);

  const TOOLTIP = d3
    .select("#barchart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  FRAME2.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => X_SCALE(d.category) + MARGINS.left)
    .attr("y", (d) => Y_SCALE(d.amount) + MARGINS.top)
    .attr("width", X_SCALE.bandwidth())
    .attr("height", (d) => VIS_HEIGHT - Y_SCALE(d.amount))
    .attr("fill", RECT_COLOR)
    .on("mouseover", (e) => {
      TOOLTIP.style("opacity", 1);
      const rect = e.target;
      rect.setAttribute("fill", "red");
    })
    .on("mouseleave", (e) => {
      TOOLTIP.style("opacity", 0);
      const rect = e.target;
      rect.setAttribute("fill", RECT_COLOR);
    })
    .on("mousemove", (e, d) => {
      // position the tooltip and fill in information
      TOOLTIP.html("Category: " + d.category + "<br>Value: " + d.amount)
        .style("left", e.pageX + 10 + "px") //add offset
        // from mouse
        .style("top", e.pageY - 50 + "px");
    });

  FRAME2.append("g")
    .attr("transform", `translate(${MARGINS.left},${VIS_HEIGHT + MARGINS.top})`)
    .call(d3.axisBottom(X_SCALE).ticks(10))
    .attr("font-size", "20px");

  FRAME2.append("g")
    .attr("transform", `translate(${MARGINS.left},${MARGINS.top})`)
    .call(d3.axisLeft(Y_SCALE).ticks(10))
    .attr("font-size", "20px");
};

drawScatterplot();
drawBarchart();
