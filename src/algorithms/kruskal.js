/**
 * Kruskal's Minimum Spanning Tree Algorithm using Disjoint Set Union (DSU)
 *
 * Employs greedy strategy by sorting all unique graph edges by weight and adding
 * them if they do not create a cycle.
 */

export class DisjointSet {
  constructor(elements) {
    this.parent = {};
    this.rank = {};

    elements.forEach(el => {
      this.parent[el] = el;
      this.rank[el] = 0;
    });
  }

  find(item) {
    if (this.parent[item] === undefined) {
      this.parent[item] = item;
      this.rank[item] = 0;
      return item;
    }
    // Path compression
    if (this.parent[item] !== item) {
      this.parent[item] = this.find(this.parent[item]);
    }
    return this.parent[item];
  }

  union(setA, setB) {
    const rootA = this.find(setA);
    const rootB = this.find(setB);

    if (rootA === rootB) return false; // Cycle detected

    // Union by rank
    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA] += 1;
    }
    return true;
  }
}

/**
 * Extracts unique undirected edges from the graph
 */
export function extractUniqueEdges(graph) {
  const edges = [];
  const seen = new Set();

  Object.entries(graph.adjacencyList).forEach(([u, neighbors]) => {
    neighbors.forEach(edge => {
      const v = edge.to;
      const key = [u, v].sort().join('___');
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({
          from: u,
          to: v,
          weight: edge.weight,
          roadName: edge.roadName || `${u} — ${v}`
        });
      }
    });
  });

  return edges;
}

/**
 * Solves MST using Kruskal's algorithm
 */
export function kruskalMST(graph) {
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

  const allEdges = extractUniqueEdges(graph);
  // Sort edges ascending by weight
  allEdges.sort((a, b) => a.weight - b.weight);

  const dsu = new DisjointSet(nodeKeys);
  const mstEdges = [];
  const stepHistory = [];
  let totalWeight = 0;

  for (const edge of allEdges) {
    const rootFrom = dsu.find(edge.from);
    const rootTo = dsu.find(edge.to);

    if (rootFrom !== rootTo) {
      dsu.union(rootFrom, rootTo);
      mstEdges.push(edge);
      totalWeight += edge.weight;
      stepHistory.push({
        status: 'ADDED',
        edge,
        reason: `Connects component ${rootFrom} with ${rootTo}`
      });

      if (mstEdges.length === totalNodesCount - 1) {
        break; // Full MST reached
      }
    } else {
      stepHistory.push({
        status: 'SKIPPED',
        edge,
        reason: `Both vertices already in component ${rootFrom} (Cycle prevention)`
      });
    }
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(4));

  // Determine connected components count
  const componentRoots = new Set(nodeKeys.map(n => dsu.find(n)));
  const componentsCount = componentRoots.size;
  const isConnected = componentsCount === 1 && mstEdges.length === totalNodesCount - 1;

  return {
    algorithm: "Kruskal's Algorithm",
    edges: mstEdges,
    totalWeight: parseFloat(totalWeight.toFixed(3)),
    executionTimeMs,
    isConnected,
    isSpanningTree: isConnected,
    componentsCount,
    totalGraphNodes: totalNodesCount,
    totalCandidateEdges: allEdges.length,
    stepHistory: stepHistory.slice(0, 50), // Sample for visual inspector
    message: isConnected
      ? `Successfully selected ${mstEdges.length} edges forming a minimal spanning tree of total weight ${totalWeight.toFixed(3)} km.`
      : `Graph is DISCONNECTED into ${componentsCount} components. Kruskal formed a minimal spanning forest.`
  };
}
