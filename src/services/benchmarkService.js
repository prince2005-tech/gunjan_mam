/**
 * DAA Algorithm Benchmarking Service
 *
 * Runs actual algorithm implementations on varying input sizes and repeats
 * them sufficiently to calculate accurate, un-fabricated execution times in milliseconds.
 */

import { dijkstra } from '../algorithms/dijkstra.js';
import { solveKnapsack } from '../algorithms/knapsack.js';
import { solveTSP } from '../algorithms/tsp.js';
import { primMST } from '../algorithms/prim.js';
import { kruskalMST } from '../algorithms/kruskal.js';

export function runComprehensiveBenchmarks(roadGraph, sampleBins) {
  const results = {
    timestamp: new Date().toISOString(),
    knapsackScaling: [],
    tspScaling: [],
    mstComparison: {},
    dijkstraBenchmark: {}
  };

  // 1. Dijkstra Benchmark (Depot to all nodes, repeated 100 times for precision)
  const dijkstraIterations = 100;
  const dStart = performance.now();
  for (let i = 0; i < dijkstraIterations; i++) {
    dijkstra(roadGraph, roadGraph.depotId || '0');
  }
  const dTotal = performance.now() - dStart;
  results.dijkstraBenchmark = {
    iterations: dijkstraIterations,
    totalTimeMs: parseFloat(dTotal.toFixed(4)),
    averageTimeMs: parseFloat((dTotal / dijkstraIterations).toFixed(4)),
    nodesCount: Object.keys(roadGraph.nodes).length,
    edgesCount: roadGraph.edges.length
  };

  // 2. 0/1 Knapsack Scaling (N = 5, 10, 15, 20, 25, 30)
  // Generate synthetic bins from sample
  const baseBins = [...sampleBins];
  while (baseBins.length < 35) {
    const idx = baseBins.length + 1;
    baseBins.push({
      id: `SYN-${idx}`,
      nodeId: `${(idx % 15) + 1}`,
      wasteKg: 100 + (idx * 23) % 400,
      priority: idx % 3 === 0 ? 'High' : idx % 2 === 0 ? 'Medium' : 'Low'
    });
  }

  const knapsackSizes = [5, 10, 15, 20, 25, 30];
  const ksIterations = 40;

  knapsackSizes.forEach(n => {
    const slice = baseBins.slice(0, n);
    const capacity = 2000;
    const start = performance.now();
    for (let i = 0; i < ksIterations; i++) {
      solveKnapsack(slice, capacity);
    }
    const duration = performance.now() - start;
    results.knapsackScaling.push({
      inputSize: n,
      label: `N=${n}`,
      avgTimeMs: parseFloat((duration / ksIterations).toFixed(4)),
      complexity: 'O(N × W)'
    });
  });

  // 3. Held-Karp TSP Scaling (K = 3, 5, 7, 9, 10)
  const tspSizes = [3, 5, 7, 9, 10];
  tspSizes.forEach(k => {
    const slice = sampleBins.slice(0, k);
    const tspIter = k <= 7 ? 20 : 5;
    const start = performance.now();
    for (let i = 0; i < tspIter; i++) {
      solveTSP(roadGraph, roadGraph.depotId || '0', slice);
    }
    const duration = performance.now() - start;
    results.tspScaling.push({
      inputSize: k,
      label: `K=${k}`,
      avgTimeMs: parseFloat((duration / tspIter).toFixed(4)),
      theoreticalOps: Math.round(Math.pow(2, k) * k * k)
    });
  });

  // 4. Prim vs Kruskal MST comparison (Repeated 80 times)
  const mstIterations = 80;

  const pStart = performance.now();
  for (let i = 0; i < mstIterations; i++) {
    primMST(roadGraph, roadGraph.depotId || '0');
  }
  const pTotal = performance.now() - pStart;

  const kStart = performance.now();
  for (let i = 0; i < mstIterations; i++) {
    kruskalMST(roadGraph);
  }
  const kTotal = performance.now() - kStart;

  results.mstComparison = {
    iterations: mstIterations,
    primAvgMs: parseFloat((pTotal / mstIterations).toFixed(4)),
    kruskalAvgMs: parseFloat((kTotal / mstIterations).toFixed(4)),
    primWeight: primMST(roadGraph).totalWeight,
    kruskalWeight: kruskalMST(roadGraph).totalWeight
  };

  return results;
}
