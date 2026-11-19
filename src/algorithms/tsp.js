/**
 * Traveling Salesperson Problem (TSP) using Held-Karp Dynamic Programming
 *
 * Finds the minimum distance tour starting at the Depot, visiting each selected
 * waste bin exactly once, and returning to the Depot.
 *
 * Distances between stops are shortest-path road distances computed via Dijkstra.
 */

import { dijkstra, reconstructPath, getPathCoordinates } from './dijkstra.js';

export const MAX_TSP_BINS = 10; // Maximum bins for exact Held-Karp demonstration

/**
 * Builds the distance matrix and road paths between Depot and selected bins using Dijkstra
 *
 * @param {Object} graph - Road network graph
 * @param {string} depotNodeId - Node ID of the central depot
 * @param {Array} bins - Array of selected bin objects [{ id, nodeId, ... }]
 */
export function buildDistanceMatrix(graph, depotNodeId, bins) {
  // Stops: index 0 is Depot, indices 1..k are bins
  const stops = [
    { id: 'DEPOT', name: 'Central Depot', nodeId: depotNodeId, isDepot: true },
    ...bins.map(b => ({ id: b.id, name: `Bin ${b.id}`, nodeId: b.nodeId, bin: b }))
  ];

  const n = stops.length;
  const distMatrix = Array.from({ length: n }, () => Array(n).fill(Infinity));
  const pathMatrix = Array.from({ length: n }, () => Array(n).fill(null));

  // Run Dijkstra from each unique node among stops
  const uniqueNodes = Array.from(new Set(stops.map(s => s.nodeId)));
  const dijkstraResults = {};

  uniqueNodes.forEach(nodeId => {
    dijkstraResults[nodeId] = dijkstra(graph, nodeId);
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        distMatrix[i][j] = 0;
        pathMatrix[i][j] = [stops[i].nodeId];
      } else {
        const fromNode = stops[i].nodeId;
        const toNode = stops[j].nodeId;
        const res = dijkstraResults[fromNode];
        const dist = res ? res.distances[toNode] : Infinity;
        distMatrix[i][j] = dist !== undefined ? dist : Infinity;

        if (res && res.predecessors) {
          pathMatrix[i][j] = reconstructPath(res.predecessors, fromNode, toNode);
        }
      }
    }
  }

  return { stops, distMatrix, pathMatrix };
}

/**
 * Solves TSP using the Held-Karp DP algorithm with bitmasking.
 *
 * @param {Object} graph - Road network graph
 * @param {string} depotNodeId - Node ID of the depot
 * @param {Array} bins - Array of selected bins
 * @returns {Object} Solution with optimal order, distances, detailed road legs, and map coordinates
 */
export function solveTSP(graph, depotNodeId, bins) {
  if (!bins || bins.length === 0) {
    return {
      success: true,
      stopsOrder: ['DEPOT'],
      detailedStops: [{ id: 'DEPOT', name: 'Central Depot', nodeId: depotNodeId, isDepot: true }],
      legs: [],
      totalDistanceKm: 0,
      roadCoordinates: [],
      message: 'No bins selected for this route.'
    };
  }

  if (bins.length > MAX_TSP_BINS) {
    return {
      success: false,
      error: 'LIMIT_EXCEEDED',
      message: `Exact Held-Karp TSP DP limit is ${MAX_TSP_BINS} bins per truck due to O(n² 2ⁿ) computational complexity. Selected ${bins.length} bins. Please adjust truck capacity or service zone.`,
      stopsOrder: [],
      totalDistanceKm: 0,
      legs: [],
      roadCoordinates: []
    };
  }

  const { stops, distMatrix, pathMatrix } = buildDistanceMatrix(graph, depotNodeId, bins);
  const n = stops.length; // 1 (depot) + k (bins)

  // memo[mask][u] = min cost to visit all vertices in mask ending at u
  // mask is a bitmask of size 2^n, where bit i represents stops[i]
  const numStates = 1 << n;
  const memo = Array.from({ length: numStates }, () => Array(n).fill(Infinity));
  const parent = Array.from({ length: numStates }, () => Array(n).fill(-1));

  // Base case: starting at depot (node 0) with mask = 1 (only node 0 visited)
  memo[1][0] = 0;

  // DP transitions
  for (let mask = 1; mask < numStates; mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u))) continue;
      if (memo[mask][u] === Infinity) continue;

      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue; // already visited
        const nextMask = mask | (1 << v);
        const nextDist = memo[mask][u] + distMatrix[u][v];

        if (nextDist < memo[nextMask][v]) {
          memo[nextMask][v] = nextDist;
          parent[nextMask][v] = u;
        }
      }
    }
  }

  // Complete the tour: from the last visited node back to the depot (node 0)
  const fullMask = (1 << n) - 1;
  let minTotalDist = Infinity;
  let lastNode = -1;

  for (let u = 1; u < n; u++) {
    const returnCost = memo[fullMask][u] + distMatrix[u][0];
    if (returnCost < minTotalDist) {
      minTotalDist = returnCost;
      lastNode = u;
    }
  }

  if (lastNode === -1 || minTotalDist === Infinity) {
    return {
      success: false,
      error: 'UNREACHABLE_NODES',
      message: 'One or more waste bins cannot be reached via the road network from the depot.',
      stopsOrder: [],
      totalDistanceKm: 0,
      legs: [],
      roadCoordinates: []
    };
  }

  // Reconstruct optimal tour sequence
  const tourIndices = [];
  let currMask = fullMask;
  let currNode = lastNode;

  while (currNode !== -1 && currNode !== 0) {
    tourIndices.push(currNode);
    const prevNode = parent[currMask][currNode];
    currMask ^= (1 << currNode);
    currNode = prevNode;
  }

  // Sequence: depot -> stop1 -> stop2 -> ... -> depot
  tourIndices.reverse();
  const sequenceIndices = [0, ...tourIndices, 0];

  // Build legs and road coordinates along the road network graph
  const legs = [];
  const fullCoordinates = [];
  const detailedStops = sequenceIndices.map((idx, stepNum) => ({
    stepNumber: stepNum,
    ...stops[idx]
  }));

  for (let i = 0; i < sequenceIndices.length - 1; i++) {
    const u = sequenceIndices[i];
    const v = sequenceIndices[i + 1];
    const legDist = distMatrix[u][v];
    const nodePath = pathMatrix[u][v] || [];
    const coords = getPathCoordinates(graph, nodePath);

    legs.push({
      fromStop: stops[u].id,
      toStop: stops[v].id,
      fromName: stops[u].name,
      toName: stops[v].name,
      distanceKm: parseFloat(legDist.toFixed(3)),
      nodePath,
      coordinates: coords
    });

    // Add coordinates to overall polyline, avoiding duplicate consecutive points
    coords.forEach((pt, idx) => {
      if (fullCoordinates.length === 0 || idx > 0) {
        fullCoordinates.push(pt);
      }
    });
  }

  return {
    success: true,
    totalDistanceKm: parseFloat(minTotalDist.toFixed(3)),
    stopsOrder: detailedStops.map(s => s.id),
    detailedStops,
    legs,
    roadCoordinates: fullCoordinates,
    algorithm: 'Held-Karp Dynamic Programming (O(n²2ⁿ))'
  };
}
