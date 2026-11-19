/**
 * Automated Verification Script for WasteWise DAA Algorithms and State Logic
 * Covers Phases 1 through 9 requirements
 */

import { dijkstra, findShortestPathBetween } from './src/algorithms/dijkstra.js';
import { solveKnapsack } from './src/algorithms/knapsack.js';
import { solveTSP, MAX_TSP_BINS } from './src/algorithms/tsp.js';
import { primMST } from './src/algorithms/prim.js';
import { kruskalMST } from './src/algorithms/kruskal.js';
import { INITIAL_ROAD_GRAPH } from './src/data/roadNetwork.js';
import { INITIAL_BINS } from './src/data/initialBins.js';
import { INITIAL_TRUCKS } from './src/data/initialTrucks.js';
import { runFullOptimization, runFullOptimizationSync } from './src/services/optimizationService.js';
import {
  executeCollectionPlan,
  startNextDayCycle,
  unloadTruckAtDepot,
  unloadAllTrucksAtDepot
} from './src/services/collectionService.js';
import { fetchOsrmRoute } from './src/services/osrmService.js';

console.log('====================================================');
console.log('WASTEWISE MASTER VERIFICATION & TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  // -----------------------------------------------------------
  // TEST 1: Dijkstra Shortest Path
  // -----------------------------------------------------------
  console.log('--- TEST 1: Dijkstra Shortest Path ---');
  const dijkstraDepot = dijkstra(INITIAL_ROAD_GRAPH, '0');
  assert(dijkstraDepot.distances['0'] === 0, 'Distance from Depot (0) to Depot is 0');
  assert(dijkstraDepot.distances['1'] === 1.1, `Direct distance 0 -> 1 is 1.1 km (got ${dijkstraDepot.distances['1']})`);
  assert(dijkstraDepot.distances['5'] > 3.0 && dijkstraDepot.distances['5'] <= 6.0, `Shortest distance 0 -> 5 falls into Zone 2 (${dijkstraDepot.distances['5']} km)`);
  assert(dijkstraDepot.distances['10'] > 6.0 && dijkstraDepot.distances['10'] <= 12.0, `Shortest distance 0 -> 10 falls into Zone 3 (${dijkstraDepot.distances['10']} km)`);

  const pathBetween = findShortestPathBetween(INITIAL_ROAD_GRAPH, '0', '5');
  assert(pathBetween.reachable === true, 'Path from 0 to 5 is reachable');
  assert(pathBetween.path[0] === '0' && pathBetween.path[pathBetween.path.length - 1] === '5', `Path starts at 0 and ends at 5: ${pathBetween.path.join(' -> ')}`);

  // -----------------------------------------------------------
  // TEST 2: 0/1 Knapsack (Lexicographic: Max Count, Tie-Break Priority, Cardinality Bound)
  // -----------------------------------------------------------
  console.log('\n--- TEST 2: 0/1 Knapsack Dynamic Programming ---');
  const testBins = [
    { id: 'B1', wasteKg: 300, priority: 'Low' },
    { id: 'B2', wasteKg: 100, priority: 'Low' },
    { id: 'B3', wasteKg: 100, priority: 'High' },
    { id: 'B4', wasteKg: 100, priority: 'Medium' }
  ];
  const ksResult = solveKnapsack(testBins, 300);
  assert(ksResult.selectedCount === 3, `Selected 3 bins instead of 1 heavy bin (got ${ksResult.selectedCount})`);
  assert(ksResult.totalWaste === 300, `Total waste exactly 300 kg (got ${ksResult.totalWaste})`);
  assert(ksResult.remainingCapacity === 0, `Remaining capacity is 0 (got ${ksResult.remainingCapacity})`);
  assert(ksResult.selectedBins.some(b => b.id === 'B3'), 'B3 (High priority) was selected');

  // -----------------------------------------------------------
  // TEST 3: Held-Karp TSP Dynamic Programming
  // -----------------------------------------------------------
  console.log('\n--- TEST 3: Held-Karp TSP Dynamic Programming ---');
  const sampleSubset = INITIAL_BINS.slice(0, 3);
  const tspResult = solveTSP(INITIAL_ROAD_GRAPH, '0', sampleSubset);
  assert(tspResult.success === true, 'TSP solved successfully');
  assert(tspResult.stopsOrder[0] === 'DEPOT', 'TSP tour starts at DEPOT');
  assert(tspResult.stopsOrder[tspResult.stopsOrder.length - 1] === 'DEPOT', 'TSP tour returns to DEPOT');
  assert(tspResult.totalDistanceKm > 0, `TSP optimal tour distance: ${tspResult.totalDistanceKm} km`);

  // -----------------------------------------------------------
  // TEST 4: Prim vs Kruskal Minimum Spanning Tree
  // -----------------------------------------------------------
  console.log('\n--- TEST 4: Prim vs Kruskal MST ---');
  const prim = primMST(INITIAL_ROAD_GRAPH, '0');
  const kruskal = kruskalMST(INITIAL_ROAD_GRAPH);
  const totalNodes = Object.keys(INITIAL_ROAD_GRAPH.nodes).length;
  assert(prim.isSpanningTree === true, 'Prim produced a valid Spanning Tree');
  assert(kruskal.isSpanningTree === true, 'Kruskal produced a valid Spanning Tree');
  assert(prim.edges.length === totalNodes - 1, `Prim selected V - 1 = ${totalNodes - 1} edges`);
  assert(kruskal.edges.length === totalNodes - 1, `Kruskal selected V - 1 = ${totalNodes - 1} edges`);
  assert(Math.abs(prim.totalWeight - kruskal.totalWeight) < 0.001, `Prim weight (${prim.totalWeight}) matches Kruskal weight (${kruskal.totalWeight})`);

  // -----------------------------------------------------------
  // TEST 5: Day 1 Full Optimization (Truck 1, 2, 3 Operating Correctly)
  // -----------------------------------------------------------
  console.log('\n--- TEST 5: Day 1 Optimization & Truck 3 Verification ---');
  const day1Plan = runFullOptimizationSync(INITIAL_ROAD_GRAPH, INITIAL_BINS, INITIAL_TRUCKS);
  assert(day1Plan.truckResults.length === 3, 'Plan generated for all 3 trucks');
  const t1 = day1Plan.truckResults.find(t => t.truckId === 'TRK-01');
  const t2 = day1Plan.truckResults.find(t => t.truckId === 'TRK-02');
  const t3 = day1Plan.truckResults.find(t => t.truckId === 'TRK-03');

  assert(t1 && t1.knapsack.selectedCount > 0, `Truck 1 (Zone 1) has ${t1?.knapsack.selectedCount} bins`);
  assert(t2 && t2.knapsack.selectedCount > 0, `Truck 2 (Zone 2) has ${t2?.knapsack.selectedCount} bins`);
  assert(t3 && t3.knapsack.selectedCount > 0, `Truck 3 (Zone 3) has ${t3?.knapsack.selectedCount} bins`);
  assert(t3.totalWasteKg <= t3.capacity, `Truck 3 respects payload limit (${t3.totalWasteKg} <= ${t3.capacity} kg)`);
  assert(t3.tsp.success === true, 'Truck 3 TSP tour successfully generated');

  // Verify uniqueness of bin assignments
  const assignedIds = new Set();
  let duplicateFound = false;
  day1Plan.truckResults.forEach(tr => {
    tr.knapsack.selectedBins.forEach(b => {
      if (assignedIds.has(b.id)) duplicateFound = true;
      assignedIds.add(b.id);
    });
  });
  assert(!duplicateFound, 'Every assigned bin is uniquely allocated (no duplicate bin assignments)');

  // -----------------------------------------------------------
  // TEST 6: Collection Execution Test (Atomic State Update)
  // -----------------------------------------------------------
  console.log('\n--- TEST 6: Collection Execution Test ---');
  const execResult = executeCollectionPlan(INITIAL_BINS, INITIAL_TRUCKS, day1Plan, 1);
  assert(execResult.success === true, 'Collection executed successfully for Day 1');
  assert(execResult.newHistoryRecords.length === 3, 'Created 3 historical collection records');

  const collectedCount = execResult.updatedBins.filter(b => b.status === 'collected').length;
  assert(collectedCount === assignedIds.size, `Collected count (${collectedCount}) matches plan selected bins (${assignedIds.size})`);

  const pendingAfterTrip1 = execResult.updatedBins.filter(b => b.status === 'pending');
  assert(pendingAfterTrip1.length === INITIAL_BINS.length - assignedIds.size, `Remaining pending bins: ${pendingAfterTrip1.length}`);

  // -----------------------------------------------------------
  // TEST 7: Multi-Trip Re-optimization and Truck Unloading Test
  // -----------------------------------------------------------
  console.log('\n--- TEST 7: Additional Trip & Truck Unloading Test ---');
  // At this point, trucks are loaded/completed from trip 1.
  // Re-optimizing remaining bins without unloading yields 0 bins for loaded trucks
  const trip2NoUnload = runFullOptimizationSync(INITIAL_ROAD_GRAPH, execResult.updatedBins, execResult.updatedTrucks);
  assert(trip2NoUnload.metrics.totalSelectedBins === 0, 'No bins assigned before trucks are unloaded at depot');

  // Now unload fleet at Central Depot
  const unloadedTrucks = unloadAllTrucksAtDepot(execResult.updatedTrucks);
  assert(unloadedTrucks.every(t => t.currentLoad === 0 && t.remainingCapacity === t.totalCapacity), 'All trucks successfully unloaded with 100% capacity restored');

  // Re-optimize trip 2 on remaining pending bins
  const trip2Plan = runFullOptimizationSync(INITIAL_ROAD_GRAPH, execResult.updatedBins, unloadedTrucks);
  assert(trip2Plan.metrics.totalSelectedBins === pendingAfterTrip1.length, `Trip 2 successfully scheduled remaining ${pendingAfterTrip1.length} bins!`);

  // Execute trip 2 collection
  const execTrip2 = executeCollectionPlan(execResult.updatedBins, unloadedTrucks, trip2Plan, 1);
  assert(execTrip2.success === true, 'Trip 2 collection executed successfully');
  const allCollected = execTrip2.updatedBins.every(b => b.status === 'collected');
  assert(allCollected, 'All 20 bins collected across Trip 1 and Trip 2 on Day 1!');

  // Combine history
  const combinedHistory = [...execTrip2.newHistoryRecords, ...execResult.newHistoryRecords];
  assert(combinedHistory.length === 6, `Total 6 completed trips in history log (3 in Trip 1, 3 in Trip 2)`);

  // -----------------------------------------------------------
  // TEST 8: Day 2 Transition Cycle Test
  // -----------------------------------------------------------
  console.log('\n--- TEST 8: Day 2 Transition Cycle Test ---');
  // Suppose 2 bins were intentionally left uncollected
  const partialBins = INITIAL_BINS.map((b, idx) => ({
    ...b,
    status: idx < 15 ? 'collected' : 'pending',
    pendingDuration: idx >= 15 ? 1 : 0
  }));

  const day2Transition = startNextDayCycle(1, partialBins, INITIAL_TRUCKS, combinedHistory);
  assert(day2Transition.nextDay === 2, 'Day incremented from 1 to 2');
  assert(day2Transition.nextDayTrucks.every(t => t.currentLoad === 0 && t.remainingCapacity === t.totalCapacity), 'All trucks reset to Central Depot with full capacity');

  const carriedForwardBin = day2Transition.nextDayBins.find(b => b.id === INITIAL_BINS[15].id);
  assert(carriedForwardBin.pendingDuration === 2, `Uncollected bin pending duration incremented to ${carriedForwardBin.pendingDuration}`);
  assert(carriedForwardBin.wasteKg === INITIAL_BINS[15].wasteKg + 40, `Uncollected bin accumulated +40 kg waste (${carriedForwardBin.wasteKg} kg)`);

  // -----------------------------------------------------------
  // TEST 9: Multiple Trucks in the Same Service Zone
  // -----------------------------------------------------------
  console.log('\n--- TEST 9: Multiple Trucks in the Same Service Zone ---');
  const freshBinsForMulti = INITIAL_BINS.map(b => ({ ...b, status: 'pending' }));
  const multiZoneFleet = [
    { ...INITIAL_TRUCKS[0], currentLoad: 0, remainingCapacity: INITIAL_TRUCKS[0].totalCapacity, availability: 'available' },
    {
      id: 'TRK-01B',
      name: 'Truck 1B (Auxiliary Inner)',
      totalCapacity: 1000,
      currentLoad: 0,
      remainingCapacity: 1000,
      zoneName: 'Zone 1 (0 – 3.0 km)',
      zoneMinKm: 0.0,
      zoneMaxKm: 3.0,
      currentLocation: 'Central Depot',
      availability: 'available',
      color: '#D97706'
    },
    { ...INITIAL_TRUCKS[1], currentLoad: 0, remainingCapacity: INITIAL_TRUCKS[1].totalCapacity, availability: 'available' },
    { ...INITIAL_TRUCKS[2], currentLoad: 0, remainingCapacity: INITIAL_TRUCKS[2].totalCapacity, availability: 'available' }
  ];

  const multiOpt = runFullOptimizationSync(INITIAL_ROAD_GRAPH, freshBinsForMulti, multiZoneFleet);
  const m1 = multiOpt.truckResults.find(t => t.truckId === 'TRK-01');
  const m1B = multiOpt.truckResults.find(t => t.truckId === 'TRK-01B');

  assert(m1 && m1.knapsack.selectedCount > 0, `Truck 1 received ${m1?.knapsack.selectedCount} bins`);
  assert(m1B && m1B.knapsack.selectedCount > 0, `Truck 1B received ${m1B?.knapsack.selectedCount} bins`);
  assert(m1.knapsack.selectedCount + m1B.knapsack.selectedCount === 6, 'All 6 Zone 1 bins shared across both Zone 1 trucks without conflict');

  // -----------------------------------------------------------
  // TEST 10: TSP Cardinality & Stop Limit Guard
  // -----------------------------------------------------------
  console.log('\n--- TEST 10: TSP Stop Limit Safety Guard ---');
  const excessiveBins = Array.from({ length: 15 }, (_, i) => ({
    id: `EX-${i + 1}`,
    nodeId: '1',
    wasteKg: 50,
    priority: 'High'
  }));

  // solveKnapsack caps selection at maxItems = 10 to protect Held-Karp DP
  const guardedKnapsack = solveKnapsack(excessiveBins, 5000, MAX_TSP_BINS);
  assert(guardedKnapsack.selectedCount <= MAX_TSP_BINS, `Knapsack selection constrained to <= ${MAX_TSP_BINS} items (got ${guardedKnapsack.selectedCount})`);

  // Direct TSP call with >10 items safely returns LIMIT_EXCEEDED
  const directTspExcess = solveTSP(INITIAL_ROAD_GRAPH, '0', excessiveBins);
  assert(directTspExcess.success === false && directTspExcess.error === 'LIMIT_EXCEEDED', 'TSP safely rejects >10 items with LIMIT_EXCEEDED');

  // -----------------------------------------------------------
  // TEST 11: Real-World OSRM Routing & Fallback Integration
  // -----------------------------------------------------------
  console.log('\n--- TEST 11: Real-World OSRM Routing & Fallback ---');
  const waypoints = [
    { lat: 28.6290, lng: 77.2180 },
    { lat: 28.6360, lng: 77.2120 },
    { lat: 28.6260, lng: 77.2260 }
  ];
  const osrmRes = await fetchOsrmRoute(waypoints);
  if (osrmRes.success && osrmRes.coordinates.length > 0) {
    assert(osrmRes.isRealRoad === true, `OSRM online: returned ${osrmRes.coordinates.length} street coordinates (${osrmRes.distanceKm} km, ${osrmRes.networkTimeMs} ms)`);
  } else {
    assert(osrmRes.isRealRoad === false, 'OSRM offline/timeout: fallback correctly handled without crashing');
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runTests();
