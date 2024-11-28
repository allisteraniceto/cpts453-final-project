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

// variable to toggle forces on/off
let useForce = false;
let simulation;
let link, node, label;
let repulsionStrength = -300;
const NO_RESPULSION = 0;

// set up SVG dimensions based on the size of the browser
const width = window.innerWidth;
const height = window.innerHeight;

// default data for nodes and links between 
const nodes = [
  { id: "Node 1" },
  { id: "Node 2" },
  { id: "Node 3" },
  { id: "Node 4" },
  { id: "Node 5" },
];

const links = [
  { source: "Node 1", target: "Node 2" },
  { source: "Node 1", target: "Node 3" },
  { source: "Node 2", target: "Node 4" },
  { source: "Node 3", target: "Node 4" },
  { source: "Node 4", target: "Node 5" },
  { source: "Node 5", target: "Node 3" },
];

function renderForceGraph() {
  console.log("here rendering force graph");
  // create SVG container
  const svg = d3.select("body").insert("svg", ".cloud-container + *") // insert after 
    .attr("width", width)
    .attr("height", height);
  
  // create the simulation with forces
  simulation = d3
    .forceSimulation(nodes)
    .force("link",d3.forceLink(links).id((d) => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300)) // set repulsion strength here (or can make it variable later)
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
    .call(drag(simulation));

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
  const newNodes = d3.range(nodeCount).map((i) => ({ id: `Node ${i + 1}` }));

  // generate new links (connecting each node to the next one)
  const newLinks = d3.range(nodeCount - 1).map((i) => ({
    source: newNodes[i],
    target: newNodes[i + 1],
  }));

  if (useForce) {
    updateForce(newNodes, newLinks, nodeCount);
  } else {
    updateStatic(d3.select("svg"), nodeCount);
  }
}

function updateForce(newNodes, newLinks, nodeCount){
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
      .call(drag(simulation));
}

// Main renderStatic function
function renderStaticGraph() {
  console.log("here rendering static graph");
  const svg = createSvgContainer();
  // Initial static positions
  renderLinks(svg, links);
  renderNodes(svg, nodes);
  renderLabels(svg, nodes);
}
// ADDEDEDEDEDED: Function to create the SVG container
function createSvgContainer() {
  d3.select("svg").remove(); // Remove any existing SVG
  return d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
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

// Function to render static links
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

// Function to render static nodes
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

// Function to render static labels
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

// Function to update nodes and links
function updateStatic(svg, nodeCount) {
  if (isNaN(nodeCount) || nodeCount < 1) {
    alert("Please enter a valid number of nodes.");
    return;
  }

  // Generate new nodes and links
  const newNodes = d3.range(nodeCount).map((i) => ({
    id: `Node ${i + 1}`,
    x: (i + 1) * (width / (nodeCount + 1)),
    y: height / 2,
  }));

  const newLinks = d3.range(nodeCount - 1).map((i) => ({
    source: newNodes[i],
    target: newNodes[i + 1],
  }));

  // Update links
  let linksSelection = svg.selectAll("line").data(newLinks);
  linksSelection.exit().remove();
  linksSelection = linksSelection
    .enter()
    .append("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2)
    .merge(linksSelection)
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  // Update nodes
  let nodesSelection = svg.selectAll("circle").data(newNodes);
  nodesSelection.exit().remove();
  nodesSelection = nodesSelection
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "pink")
    .merge(nodesSelection)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

  // Update labels
  let labelsSelection = svg.selectAll("text").data(newNodes);
  labelsSelection.exit().remove();
  labelsSelection = labelsSelection
    .enter()
    .append("text")
    .merge(labelsSelection)
    .text((d) => d.id)
    .attr("x", (d) => d.x + 10)
    .attr("y", (d) => d.y + 5)
    .attr("font-size", "12px")
    .attr("fill", "#333");
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
  if (useForce) {
    simulation.force("charge", d3.forceManyBody().strength(repulsionStrength));
  }
});

// Attach an event listener to the toggle button
document.getElementById("toggleMode").addEventListener("click", () => {
  useForce = !useForce;
  // Remove the existing SVG element >> ensure removal of exisiting SVG container before rendering new 
  d3.select("svg").remove();
  if (useForce) {
    d3.select("#toggleMode").text("Force");
    renderForceGraph();
  } else {
    d3.select("#toggleMode").text("Static");
    renderStaticGraph();
  }
});