/**
 * Dijkstra's Shortest Path Algorithm
 *
 * Computes the shortest path from a starting node to all other nodes in a weighted graph.
 * Used for:
 * 1. Road distance computation from Depot to waste bins.
 * 2. Service zone eligibility validation.
 * 3. Stop-to-stop shortest path routing for TSP.
 */

export function dijkstra(graph, startNodeId) {
  const nodes = Object.keys(graph.nodes);
  const distances = {};
  const predecessors = {};
  const visited = new Set();
  const visitedOrder = [];

  // Initialize distances
  nodes.forEach(nodeId => {
    distances[nodeId] = Infinity;
    predecessors[nodeId] = null;
  });

  if (!graph.nodes[startNodeId]) {
    return { distances, predecessors, visitedOrder, error: `Start node ${startNodeId} not found in graph.` };
  }

  distances[startNodeId] = 0;

  // Unvisited node pool
  const unvisited = new Set(nodes);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest known distance
    let currentNodeId = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentNodeId = nodeId;
      }
    }

    // If remaining nodes are unreachable, stop
    if (currentNodeId === null || minDistance === Infinity) {
      break;
    }

    unvisited.delete(currentNodeId);
    visited.add(currentNodeId);
    visitedOrder.push(currentNodeId);

    // Examine neighbors from adjacency list
    const neighbors = graph.adjacencyList[currentNodeId] || [];
    for (const edge of neighbors) {
      const neighborId = edge.to;
      const weight = edge.weight;

      if (!visited.has(neighborId)) {
        const alt = distances[currentNodeId] + weight;
        if (alt < distances[neighborId]) {
          distances[neighborId] = parseFloat(alt.toFixed(4));
          predecessors[neighborId] = currentNodeId;
        }
      }
    }
  }

  return { distances, predecessors, visitedOrder };
}

/**
 * Reconstructs the node path from start to target using the predecessor map
 */
export function reconstructPath(predecessors, startNodeId, targetNodeId) {
  if (startNodeId === targetNodeId) return [startNodeId];
  const path = [];
  let curr = targetNodeId;

  while (curr !== null && curr !== undefined) {
    path.unshift(curr);
    if (curr === startNodeId) break;
    curr = predecessors[curr];
  }

  if (path.length === 0 || path[0] !== startNodeId) {
    return []; // No path exists
  }

  return path;
}

/**
 * Gets path coordinates along the road graph for map polyline rendering
 */
export function getPathCoordinates(graph, path) {
  if (!path || path.length === 0) return [];
  return path.map(nodeId => {
    const node = graph.nodes[nodeId];
    return node ? [node.lat, node.lng] : null;
  }).filter(coord => coord !== null);
}

/**
 * Computes shortest path and road coordinates between two nodes
 */
export function findShortestPathBetween(graph, startNodeId, targetNodeId) {
  const { distances, predecessors } = dijkstra(graph, startNodeId);
  const distance = distances[targetNodeId];
  const path = reconstructPath(predecessors, startNodeId, targetNodeId);
  const coordinates = getPathCoordinates(graph, path);

  return {
    distance: distance === Infinity ? null : distance,
    path,
    coordinates,
    reachable: distance !== Infinity
  };
}
