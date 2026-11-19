/**
 * Prim's Minimum Spanning Tree Algorithm
 *
 * Finds the minimum spanning tree (or forest if disconnected) for the road network.
 * Analyzes the minimum infrastructure cost required to keep all junctions connected.
 */

export function primMST(graph, startNodeId = null) {
  const startTime = performance.now();
  const nodeKeys = Object.keys(graph.nodes);
  const totalNodesCount = nodeKeys.length;

  if (totalNodesCount === 0) {
    return {
      edges: [],
      totalWeight: 0,
      executionTimeMs: 0,
      isSpanningTree: true,
      componentsCount: 0,
      message: 'Graph has no vertices.'
    };
  }

  const defaultStart = startNodeId && graph.nodes[startNodeId] ? startNodeId : nodeKeys[0];
  const globalVisited = new Set();
  const allMstEdges = [];
  let totalWeight = 0;
  const components = [];

  // Helper to run Prim on a single connected component
  const runComponentPrim = (rootNode) => {
    const compVisited = new Set([rootNode]);
    globalVisited.add(rootNode);
    const compEdges = [];
    const stepHistory = [];

    while (true) {
      let minEdge = null;
      let minWeight = Infinity;

      // Find minimum weight edge connecting a visited node to an unvisited node
      for (const u of compVisited) {
        const neighbors = graph.adjacencyList[u] || [];
        for (const edge of neighbors) {
          const v = edge.to;
          if (!compVisited.has(v)) {
            if (edge.weight < minWeight) {
              minWeight = edge.weight;
              minEdge = {
                from: u,
                to: v,
                weight: edge.weight,
                roadName: edge.roadName || `${u} — ${v}`
              };
            }
          }
        }
      }

      if (!minEdge) {
        break; // No more reachable unvisited vertices
      }

      compVisited.add(minEdge.to);
      globalVisited.add(minEdge.to);
      compEdges.push(minEdge);
      stepHistory.push({
        addedEdge: minEdge,
        treeSize: compVisited.size
      });
    }

    return {
      root: rootNode,
      nodes: Array.from(compVisited),
      edges: compEdges,
      weight: compEdges.reduce((sum, e) => sum + e.weight, 0)
    };
  };

  // Run on start node first
  const primaryComp = runComponentPrim(defaultStart);
  components.push(primaryComp);
  allMstEdges.push(...primaryComp.edges);
  totalWeight += primaryComp.weight;

  // Check if any nodes remain unvisited (disconnected components)
  for (const nId of nodeKeys) {
    if (!globalVisited.has(nId)) {
      const extraComp = runComponentPrim(nId);
      components.push(extraComp);
      allMstEdges.push(...extraComp.edges);
      totalWeight += extraComp.weight;
    }
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(4));
  const isConnected = components.length === 1 && primaryComp.nodes.length === totalNodesCount;

  return {
    algorithm: "Prim's Algorithm",
    edges: allMstEdges,
    totalWeight: parseFloat(totalWeight.toFixed(3)),
    executionTimeMs,
    isConnected,
    isSpanningTree: isConnected,
    componentsCount: components.length,
    components,
    primaryComponentNodes: primaryComp.nodes.length,
    totalGraphNodes: totalNodesCount,
    message: isConnected
      ? `Successfully constructed MST covering all ${totalNodesCount} junctions with total road weight ${totalWeight.toFixed(3)} km.`
      : `Graph is DISCONNECTED (${components.length} components). A single spanning tree does not exist. Spanning forest constructed.`
  };
}
