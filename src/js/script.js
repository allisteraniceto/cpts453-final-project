/*
TODO:
- visualize graph BEFORE force directed (input)
- visualize graph AFTER force directed (output)
- ways to measure results:
  - edge crossings: Compare all pairs of edges for intersection (this is computationally expensive for large graphs).
  - node overlap: Check if circles overlap by calculating distances between nodes.
  - density of nodes 
  - symmetry of graph
*/

/*
TASKS:
- button to toggle forces on/off (alexia)
- make graph/nodes without force (kidist)
- have a way to turn on/off forces (angelica)
- boundary for nodes (allister)
  - notes:
    - after 125 nodes, the nodes have too much force and they go off the screen
*/

let useForce = false;
let simulation;
let link, node, label;
let repulsionStrength = -100;
const NO_RESPULSION = 0;
let selectedNodes = [];

const rootFontSize = parseFloat(
  getComputedStyle(document.documentElement).fontSize
);

const widthOffset = 20 * rootFontSize; // subtract width of the inputs container
const heightOffset = 4 * rootFontSize; // subtract height of the header

// set up SVG dimensions based on the size of the browser
const width = window.innerWidth - widthOffset;
const height = window.innerHeight - heightOffset;

// default data for nodes and links between
let nodes = [
  { id: "Node 1" },
  { id: "Node 2" },
  { id: "Node 3" },
  { id: "Node 4" },
  { id: "Node 5" },
];

let links = [
  { source: "Node 1", target: "Node 2" },
  { source: "Node 1", target: "Node 3" },
  { source: "Node 2", target: "Node 4" },
  { source: "Node 3", target: "Node 4" },
  { source: "Node 4", target: "Node 5" },
  { source: "Node 5", target: "Node 3" },
];

// ADDEDEDEDEDED: Function to create the SVG container
function createSvgContainer() {
  d3.select(".svg-container svg").remove(); // Remove any existing SVG
  return d3
    .select(".svg-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
}

// generate random links between nodes AH
function generateRandomLinks(nodes, numLinks) {
  const links = [];
  for (let i = 0; i < numLinks; i++) {
    const source = nodes[Math.floor(Math.random() * nodes.length)].id;
    const target = nodes[Math.floor(Math.random() * nodes.length)].id;
    if (source !== target) {
      links.push({ source, target });
    }
  }
  return links;
}

function renderForceGraph() {
  console.log("here rendering force graph");
  // create SVG container

  const svg = createSvgContainer();

  // create the simulation with forces
  simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(repulsionStrength)) // set repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.1))
    .force("y", d3.forceY(height / 2).strength(0.1));

  // create initial link, node, and label groups
  link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke-width", 2);

  node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "lightgreen")
    .call(drag(simulation))
    .on("click", handleNodeClick);

  label = svg
    .append("g")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text((d) => d.id)
    .attr("x", 15)
    .attr("y", 5)
    .attr("font-size", "12px")
    .attr("fill", "#333");

  // update positions on each tick of the simulation
  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    label.attr("x", (d) => d.x + 15).attr("y", (d) => d.y + 5);
  });

  // dragging behavior for nodes
  function drag(simulation) {
    return d3
      .drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }

  calculateAndLogMetrics(nodes, links, "Force Graph");
}

// update nodes and links dynamically
function updateNodes() {
  console.log("here updating nodes");
  const nodeCount = parseInt(document.getElementById("nodeCount").value, 10); // Get # of nodes
  if (isNaN(nodeCount) || nodeCount < 1) {
    alert("Please enter a valid number of nodes.");
    return;
  }

  // generate new nodes
  nodes = d3.range(nodeCount).map((i) => ({
    id: `Node ${i + 1}`,
    x: (i + 1) * (width / (nodeCount + 1)),
    y: height / 2,
  }));

  links = generateRandomLinks(nodes, nodeCount + 5);

  if (useForce) {
    updateForce(nodes, links, nodeCount);
  } else {
    updateStatic(nodes, links);
  }
}

// updating force directed graph
function updateForce(newNodes, newLinks, nodeCount) {
  console.log("here updating force");
  // update the simulation with new nodes and links
  simulation.nodes(newNodes);
  simulation.force("link").links(newLinks);
  simulation.alpha(1).restart();

  // update the links
  link = link.data(newLinks);
  link.exit().remove();
  link = link.enter().append("line").attr("stroke-width", 2).merge(link);

  // update the labels
  label = label.data(newNodes);
  label.exit().remove();
  label = label
    .enter()
    .append("text")
    .merge(label)
    .text((d) => d.id)
    .attr("font-size", "12px")
    .attr("fill", "#333");

  // update the nodes
  node = node.data(newNodes);
  node.exit().remove();
  node = node
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "lightgreen")
    .merge(node)
    .call(drag(simulation))
    .on("click", handleNodeClick);

    updateLinks();

    calculateAndLogMetrics(nodes, links, "Force Graph");
}

// updating links - create and delete
function updateLinks() {
  link = link.data(links); // brings updated links data
  link.exit().remove();  // removal of not existing links
  link = link.enter().append("line").attr("stroke-width", 2).merge(link);
  simulation.force("link").links(links);  // update new link
  simulation.alpha(1).restart();

  calculateAndLogMetrics(nodes, links, "Force Graph");
}
// function to update nodes and links
function updateStatic(newNodes, newLinks) {
  if (isNaN(nodeCount) || nodeCount < 1) {
    alert("Please enter a valid number of nodes.");
    return;
  }

  // remove existing nodes and links
  d3.selectAll("circle").remove();
  d3.selectAll("line").remove();
  d3.selectAll("text").remove();

  // create SVG container
  const svg = createSvgContainer();

  // render static nodes
  node = svg
    .append("g")
    .selectAll("circle")
    .data(newNodes)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "lightgreen")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

  // render static links
  link = svg
    .append("g")
    .selectAll("line")
    .data(newLinks)
    .enter()
    .append("line")
    .attr("stroke-width", 2)
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  // render static labels
  label = svg
    .append("g")
    .selectAll("text")
    .data(newNodes)
    .enter()
    .append("text")
    .text((d) => d.id)
    .attr("x", (d) => d.x + 15)
    .attr("y", (d) => d.y + 5)
    .attr("font-size", "12px")
    .attr("fill", "#333");

    calculateAndLogMetrics(nodes, links, "Static Graph");
}

// main renderStatic function
function renderStaticGraph() {
  console.log("here rendering static graph");
  const svg = createSvgContainer();
  // initial static positions
  renderLinks(svg, links);
  renderNodes(svg, nodes);
  renderLabels(svg, nodes);

  calculateAndLogMetrics(nodes, links, "Static Graph");
}

// function to render static links
function renderLinks(svg, links) {
  return svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke-width", 2)
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);
}

// function to render static nodes
function renderNodes(svg, nodes) {
  return svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "pink")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);
}

// function to render static labels
function renderLabels(svg, nodes) {
  return svg
    .append("g")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text((d) => d.id)
    .attr("x", (d) => d.x + 10)
    .attr("y", (d) => d.y + 5)
    .attr("font-size", "12px")
    .attr("fill", "#333");
}

// dragging behavior for nodes
function drag(simulation) {
  return d3
    .drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}

// function to toggle inputs based on the current mode
function toggleInputs() {
  const nodeCountInput = document.getElementById("nodeCount");
  const updateNodesButton = document.getElementById("updateNodes");
  const repulsionStrengthInput = document.getElementById("repulsionStrength");
  const updateRepulsionButton = document.getElementById("updateRepulsion");

  if (useForce) {
    nodeCountInput.disabled = false;
    updateNodesButton.disabled = false;
    repulsionStrengthInput.disabled = false;
    updateRepulsionButton.disabled = false;
  } else {
    nodeCountInput.disabled = true;
    updateNodesButton.disabled = true;
    repulsionStrengthInput.disabled = true;
    updateRepulsionButton.disabled = true;
  }
}

function calculateAndLogMetrics(nodes, links, graphType) {
  const edgeCrossings = countEdgeCrossings(links);
  const nodeOverlaps = countNodeOverlaps(nodes);
  const graphDensity = calculateGraphDensity(nodes, links);

  console.log(`${graphType} - Edge Crossings: ${edgeCrossings}`);
  console.log(`${graphType} - Node Overlaps: ${nodeOverlaps}`);
  console.log(`${graphType} - Graph Density: ${graphDensity}`);
}

/* MEASUREMENTS */
// WORK IN PROGRESS

// calculations of edge crossings
function countEdgeCrossings(links) {
  let crossings = 0;
  for (let i = 0; i < links.length; i++) {
    for (let j = i + 1; j < links.length; j++) {
      if (edgesIntersect(links[i], links[j])) {
        crossings++;
      }
    }
  }
  return crossings;
}

// checks if edges intersects
function edgesIntersect(link1, link2) {
  const { x: x1, y: y1 } = link1.source;
  const { x: x2, y: y2 } = link1.target;
  const { x: x3, y: y3 } = link2.source;
  const { x: x4, y: y4 } = link2.target;

  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false; // Parallel lines

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return ua > 0 && ua < 1 && ub > 0 && ub < 1;
}

// counts node overlaps
function countNodeOverlaps(nodes) {
  let overlaps = 0;
  const radius = 10; // Assuming a fixed radius for nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = Math.sqrt(
        Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
      );
      if (distance < 2 * radius) {
        overlaps++;
      }
    }
  }
  return overlaps;
}

// calculating graph density - will be same for force and static
// ratio of the number of actual links to the number of possible links in a complete graph
function calculateGraphDensity(nodes, links) {
  const numNodes = nodes.length;
  const numLinks = links.length;
  const possibleLinks = (numNodes * (numNodes - 1)) / 2;
  return numLinks / possibleLinks;
}

/* EVENT LISTENERS HERE */
// attach event listener for when button is clicked by user
document.getElementById("updateNodes").addEventListener("click", updateNodes);

// attach event listener for 'Enter' key press by user
document.getElementById("nodeCount").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    updateNodes();
  }
});

// for repulstion strength
document.getElementById("updateRepulsion").addEventListener("click", () => {
  repulsionStrength = parseInt(document.getElementById("repulsionStrength").value, 10);
  if (isNaN(repulsionStrength)) {
    alert("Please enter a valid number for repulsion strength.");
    return;
  }
  if (useForce) {
    simulation.force("charge", d3.forceManyBody().strength(repulsionStrength));
    simulation.alpha(1).restart(); // reheat the simulation
    // delay before cooling it back down (too fast)
    setTimeout(() => {
      simulation.alpha(0).restart(); // cool it back down
    }, 500) //.5 seconds
  }
});

// attach an event listener to the toggle button
document.getElementById("toggleMode").addEventListener("click", () => {
  useForce = !useForce;
  // remove the existing SVG element >> ensure removal of exisiting SVG container before rendering new
  d3.select("svg").remove();
  if (useForce) {
    d3.select("#toggleMode").text("Force Graph");
    renderForceGraph();
  } else {
    d3.select("#toggleMode").text("Static Graph");
    renderStaticGraph();
  }
  toggleInputs();
});

// function to handle node click
function handleNodeClick(event, d) {
  // change the color of the clicked node
  d3.select(this).attr("fill", "turquoise");

  selectedNodes.push(d);
  if (selectedNodes.length === 2) {
    // check if a link already exists between the selected nodes
    const existingLinkIndex = links.findIndex(
      (link) =>
        (link.source === selectedNodes[0] && link.target === selectedNodes[1]) ||
        (link.source === selectedNodes[1] && link.target === selectedNodes[0])
    );

    if (existingLinkIndex !== -1) {
      // remove existing link
      links.splice(existingLinkIndex, 1);
    } else {
      // create new link between selected nodes
      links.push({ source: selectedNodes[0], target: selectedNodes[1] });
    }
    updateLinks();

    // delay before reverting the color of the selected nodes
    setTimeout(() => {
      selectedNodes.forEach(node => {
        d3.selectAll("circle").filter(d => d === node).attr("fill", "lightgreen");
      });

      selectedNodes = [];
    }, 500);
  }
}
