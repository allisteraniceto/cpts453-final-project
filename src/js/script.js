// set up SVG dimensions
const width = window.innerWidth;
const height = window.innerHeight;

// default data for nodes and links
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
];

// create SVG container
const svg = d3.select("svg").attr("width", width).attr("height", height);

// // create SVG container if it doesn't exist
// const svg = d3.select("svg").empty()
//   ? d3.select("body").append("svg").attr("width", width).attr("height", height)
//   : d3.select("svg");

// create the simulation with forces
const simulation = d3
  .forceSimulation(nodes)
  .force(
    "link",
    d3
      .forceLink(links)
      .id((d) => d.id)
      .distance(100)
  )
  .force("charge", d3.forceManyBody().strength(-300)) // set repulsion strength here (or can make it variable later)
  .force("center", d3.forceCenter(width / 2, height / 2));

// create initial link, node, and label groups
let link = svg
  .append("g")
  .attr("stroke", "#999")
  .attr("stroke-opacity", 0.6)
  .selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("stroke-width", 2);

let node = svg
  .append("g")
  .selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("fill", "steelblue")
  .call(drag(simulation));

let label = svg
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

// update nodes and links dynamically
function updateNodes() {
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
    .attr("fill", "steelblue")
    .merge(node)
    .call(drag(simulation));
}

// attach event listener to button
document.getElementById("updateNodes").addEventListener("click", updateNodes);

// attach event listener for 'Enter' key press
document.getElementById("nodeCount").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    updateNodes();
  }
});
