/**
 * Optimization Orchestration Service
 *
 * Coordinates:
 * 1. Dijkstra: Distance from Depot & Service Zone filtering on academic road graph
 * 2. Multi-Truck Fleet Allocation: Grouping and capacity balancing across trucks in same/overlapping zones
 * 3. 0/1 Knapsack: Capacity-constrained bin selection (lexicographic count & priority with MAX_TSP_BINS constraint)
 * 4. Held-Karp TSP: Optimal visiting order & stop sequencing
 * 5. OSRM: Real-world street-level driving route geometry & road distance calculation (with Dijkstra graph fallback)
 */

import { dijkstra } from '../algorithms/dijkstra.js';
import { solveKnapsack } from '../algorithms/knapsack.js';
import { solveTSP, MAX_TSP_BINS } from '../algorithms/tsp.js';
import { fetchOsrmRoute } from './osrmService.js';

/**
 * Checks if a distance in km falls within a truck's service zone
 */
function isBinInTruckZone(roadDist, truck) {
  const isMinMatch = truck.zoneMinKm === 0 ? roadDist >= 0 : roadDist > truck.zoneMinKm;
  return isMinMatch && roadDist <= truck.zoneMaxKm;
}

/**
 * Multi-Truck Fleet Allocation Strategy:
 * Distributes eligible pending bins among trucks serving identical or overlapping zones.
 *
 * Objectives:
 * 1. Primary: Maximize total bins collected across the fleet.
 * 2. Secondary: Prioritize higher priority bins (escalated pending bins).
 * 3. Share collection work fairly among multiple trucks in the same zone.
 * 4. Strictly respect individual truck capacities.
 * 5. Guarantee no bin is assigned to more than one truck.
 */
function allocateBinsToFleet(pendingBinsWithDist, trucks) {
  const activeTrucks = trucks.filter(t => t.availability !== 'maintenance' && t.remainingCapacity > 0);
  const truckCandidates = {};
  trucks.forEach(t => {
    truckCandidates[t.id] = [];
  });

  const unassignedBins = [];

  // Group bins by zone eligibility
  // Each bin finds all active trucks whose distance band covers it
  pendingBinsWithDist.forEach(bin => {
    const roadDist = bin.roadDistanceToDepotKm;
    if (roadDist === undefined || roadDist === Infinity) {
      unassignedBins.push({
        ...bin,
        reason: 'Unreachable from depot via road network'
      });
      return;
    }

    const eligibleTrucks = activeTrucks.filter(t => isBinInTruckZone(roadDist, t));

    if (eligibleTrucks.length === 0) {
      unassignedBins.push({
        ...bin,
        reason: `Road distance (${roadDist.toFixed(2)} km) does not fall into any active available truck zone.`
      });
    } else if (eligibleTrucks.length === 1) {
      // Exactly one truck can serve this bin
      truckCandidates[eligibleTrucks[0].id].push(bin);
    } else {
      // Multiple trucks serve this zone:
      // Assign candidate to the truck with the highest remaining capacity ratio / available room
      eligibleTrucks.sort((a, b) => b.remainingCapacity - a.remainingCapacity);
      // We will share bins among them in balanced fashion
      bin._sharedEligibleTruckIds = eligibleTrucks.map(t => t.id);
    }
  });

  // Handle shared multi-truck bins
  // Group shared bins by their eligible truck sets
  const sharedBins = pendingBinsWithDist.filter(b => b._sharedEligibleTruckIds && b._sharedEligibleTruckIds.length > 1);

  if (sharedBins.length > 0) {
    // Sort shared bins by priority descending, then waste ascending (optimal greedy heuristic for bin packing)
    sharedBins.sort((a, b) => {
      const pDiff = (b.priority === 'High' ? 3 : b.priority === 'Medium' ? 2 : 1) -
                    (a.priority === 'High' ? 3 : a.priority === 'Medium' ? 2 : 1);
      if (pDiff !== 0) return pDiff;
      return a.wasteKg - b.wasteKg;
    });

    // Track simulated projected load for each truck during candidate partitioning
    const projectedLoad = {};
    trucks.forEach(t => {
      projectedLoad[t.id] = truckCandidates[t.id].reduce((sum, b) => sum + b.wasteKg, 0);
    });

    sharedBins.forEach(bin => {
      // Find the eligible truck with the most remaining capacity after current candidate assignments
      const candidateTrucks = bin._sharedEligibleTruckIds
        .map(id => trucks.find(t => t.id === id))
        .filter(t => Boolean(t) && t.remainingCapacity > 0);

      candidateTrucks.sort((t1, t2) => {
        const room1 = t1.remainingCapacity - projectedLoad[t1.id];
        const room2 = t2.remainingCapacity - projectedLoad[t2.id];
        return room2 - room1; // Truck with most remaining room first
      });

      const chosenTruck = candidateTrucks[0];
      if (chosenTruck) {
        truckCandidates[chosenTruck.id].push(bin);
        projectedLoad[chosenTruck.id] += bin.wasteKg;
      } else {
        unassignedBins.push({
          ...bin,
          reason: 'No available capacity in candidate trucks'
        });
      }
    });
  }

  return { truckCandidates, unassignedBins };
}

/**
 * Runs the optimization pipeline synchronously using Dijkstra academic road graph.
 */
export function runFullOptimizationSync(graph, bins, trucks) {
  const overallStartTime = performance.now();
  const depotId = graph.depotId || '0';

  // 1. Dijkstra: Distance from Depot
  const dijkstraStartTime = performance.now();
  const depotDijkstra = dijkstra(graph, depotId);
  const dijkstraTimeMs = parseFloat((performance.now() - dijkstraStartTime).toFixed(4));

  // 2. Only consider currently pending bins
  const pendingBins = bins.filter(b => b.status === 'pending');
  const pendingWithDist = pendingBins.map(bin => ({
    ...bin,
    roadDistanceToDepotKm: depotDijkstra.distances[bin.nodeId]
  }));

  // 3. Multi-truck fleet allocation
  const { truckCandidates, unassignedBins } = allocateBinsToFleet(pendingWithDist, trucks);

  let knapsackTotalTimeMs = 0;
  let tspTotalTimeMs = 0;
  const truckResults = [];
  const allSelectedBinIds = new Set();
  const capacityOverflowBins = [];

  trucks.forEach(truck => {
    const candidateBins = truckCandidates[truck.id] || [];

    // 0/1 Knapsack: capacity constrained (with MAX_TSP_BINS limit = 10)
    const ksStart = performance.now();
    const knapsackResult = solveKnapsack(candidateBins, truck.remainingCapacity, MAX_TSP_BINS);
    knapsackTotalTimeMs += performance.now() - ksStart;

    knapsackResult.selectedBins.forEach(b => allSelectedBinIds.add(b.id));
    knapsackResult.unselectedBins.forEach(b => {
      capacityOverflowBins.push({
        ...b,
        reason: `Exceeded capacity of ${truck.name} (${truck.remainingCapacity} kg)`
      });
    });

    // Held-Karp TSP: optimal visiting sequence
    const tspStart = performance.now();
    const tspResult = solveTSP(graph, depotId, knapsackResult.selectedBins);
    tspTotalTimeMs += performance.now() - tspStart;

    truckResults.push({
      truckId: truck.id,
      truckName: truck.name,
      color: truck.color,
      badgeClass: truck.badgeClass,
      zoneName: truck.zoneName,
      capacity: truck.remainingCapacity,
      eligibleBinsCount: candidateBins.length,
      knapsack: knapsackResult,
      tsp: tspResult,
      totalWasteKg: knapsackResult.totalWaste,
      capacityUtilization: knapsackResult.capacityUtilization,
      routeDistanceKm: tspResult.totalDistanceKm || 0,
      durationMin: parseFloat(((tspResult.totalDistanceKm || 0) * 2.4).toFixed(1)), // Estimated driving time
      stopsOrder: tspResult.stopsOrder || [],
      detailedStops: tspResult.detailedStops || [],
      legs: tspResult.legs || [],
      roadCoordinates: tspResult.roadCoordinates || [],
      isRealRoad: false,
      routingService: 'Simulated Road Graph (Dijkstra)'
    });
  });

  const overallTimeMs = parseFloat((performance.now() - overallStartTime).toFixed(3));
  const pureDaaAlgorithmTotalMs = parseFloat((dijkstraTimeMs + knapsackTotalTimeMs + tspTotalTimeMs).toFixed(3));

  const totalSelectedBinsCount = allSelectedBinIds.size;
  const totalSelectedWasteKg = truckResults.reduce((sum, tr) => sum + tr.totalWasteKg, 0);
  const totalRouteDistanceKm = parseFloat(
    truckResults.reduce((sum, tr) => sum + tr.routeDistanceKm, 0).toFixed(2)
  );
  const remainingPendingBins = pendingBins.filter(b => !allSelectedBinIds.has(b.id));

  return {
    timestamp: new Date().toISOString(),
    isOutdated: false,
    truckResults,
    metrics: {
      totalPendingBins: pendingBins.length,
      totalSelectedBins: totalSelectedBinsCount,
      totalRemainingPending: remainingPendingBins.length,
      totalSelectedWasteKg: parseFloat(totalSelectedWasteKg.toFixed(2)),
      totalRouteDistanceKm,
      unassignedBinsCount: unassignedBins.length,
      capacityOverflowCount: capacityOverflowBins.length
    },
    unassignedBins,
    capacityOverflowBins,
    benchmarks: {
      dijkstraTimeMs,
      knapsackTimeMs: parseFloat(knapsackTotalTimeMs.toFixed(4)),
      tspTimeMs: parseFloat(tspTotalTimeMs.toFixed(4)),
      pureDaaAlgorithmTotalMs: parseFloat((dijkstraTimeMs + knapsackTotalTimeMs + tspTotalTimeMs).toFixed(4)),
      osrmNetworkTimeMs: 0,
      totalExecutionTimeMs: overallTimeMs
    }
  };
}

/**
 * Runs full optimization pipeline with real-world OSRM road routing.
 * Gracefully falls back to Dijkstra graph coordinates if OSRM is offline or times out.
 */
export async function runFullOptimization(graph, bins, trucks, { enableOsrm = true } = {}) {
  // First run synchronous DAA pipeline to obtain exact Knapsack and TSP stop order
  const baseResult = runFullOptimizationSync(graph, bins, trucks);

  if (!enableOsrm) {
    return baseResult;
  }

  const overallStartTime = performance.now();
  let totalOsrmNetworkMs = 0;

  const depotNode = graph.nodes[graph.depotId || '0'];
  const depotCoords = depotNode ? { lat: depotNode.lat, lng: depotNode.lng } : { lat: 28.6290, lng: 77.2180 };

  // For each truck with selected bins, fetch real street route for its TSP ordered stops
  const enrichedTruckResults = await Promise.all(
    baseResult.truckResults.map(async tr => {
      if (!tr.knapsack || tr.knapsack.selectedBins.length === 0) {
        return tr;
      }

      // Build ordered waypoints: Depot -> Stop 1 -> Stop 2 ... -> Depot
      const stops = tr.detailedStops;
      const waypoints = stops.map(stop => {
        if (stop.isDepot) {
          return depotCoords;
        }
        if (stop.bin) {
          return { lat: stop.bin.lat, lng: stop.bin.lng };
        }
        const node = graph.nodes[stop.nodeId];
        return node ? { lat: node.lat, lng: node.lng } : depotCoords;
      });

      // Call OSRM Route API
      const osrmRes = await fetchOsrmRoute(waypoints);
      totalOsrmNetworkMs += osrmRes.networkTimeMs || 0;

      if (osrmRes.success && osrmRes.coordinates.length > 0) {
        return {
          ...tr,
          isRealRoad: true,
          routingService: 'OSRM (OpenStreetMap Driving)',
          roadCoordinates: osrmRes.coordinates,
          routeDistanceKm: osrmRes.distanceKm,
          durationMin: osrmRes.durationMin
        };
      } else {
        // Fallback to Dijkstra graph coordinates
        return {
          ...tr,
          isRealRoad: false,
          routingService: 'Simulated Road Graph (Dijkstra Fallback)',
          routingError: osrmRes.error || 'OSRM routing service unavailable'
        };
      }
    })
  );

  const totalRouteDistanceKm = parseFloat(
    enrichedTruckResults.reduce((sum, tr) => sum + tr.routeDistanceKm, 0).toFixed(2)
  );

  const overallTotalMs = parseFloat(
    (baseResult.benchmarks.pureDaaAlgorithmTotalMs + totalOsrmNetworkMs).toFixed(3)
  );

  return {
    ...baseResult,
    truckResults: enrichedTruckResults,
    metrics: {
      ...baseResult.metrics,
      totalRouteDistanceKm
    },
    benchmarks: {
      ...baseResult.benchmarks,
      osrmNetworkTimeMs: parseFloat(totalOsrmNetworkMs.toFixed(3)),
      totalExecutionTimeMs: overallTotalMs
    }
  };
}
