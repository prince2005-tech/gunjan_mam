/**
 * Waste Bin Business Logic and Service Layer
 */

import { dijkstra } from '../algorithms/dijkstra.js';

/**
 * Finds the nearest road network node for a given geographic coordinate
 */
export function findNearestRoadNode(nodes, lat, lng) {
  let nearestNodeId = '0';
  let minDistanceSq = Infinity;

  Object.entries(nodes).forEach(([id, node]) => {
    const dLat = node.lat - lat;
    const dLng = node.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      nearestNodeId = id;
    }
  });

  return nearestNodeId;
}

/**
 * Computes shortest road distance from depot to bin using Dijkstra
 */
export function getBinRoadDistanceToDepot(graph, binNodeId) {
  const { distances } = dijkstra(graph, graph.depotId || '0');
  const dist = distances[binNodeId];
  return dist !== undefined && dist !== Infinity ? dist : null;
}

/**
 * Determines which truck service zone(s) a road distance falls into.
 * Supports multiple trucks in the same zone.
 */
export function getZoneForDistance(trucks, distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return null;

  const matchingTrucks = trucks.filter(truck => {
    const isMinMatch = truck.zoneMinKm === 0 ? distanceKm >= 0 : distanceKm > truck.zoneMinKm;
    return isMinMatch && distanceKm <= truck.zoneMaxKm;
  });

  if (matchingTrucks.length > 0) {
    return {
      matched: true,
      truckId: matchingTrucks[0].id,
      truckName: matchingTrucks.map(t => t.name).join(', '),
      zoneName: matchingTrucks[0].zoneName,
      matchingTrucks
    };
  }

  return {
    matched: false,
    reason: `Distance (${distanceKm.toFixed(2)} km) is outside all active truck zones.`
  };
}

/**
 * Priority Escalation Policy:
 * Bins pending for consecutive collection cycles receive automatic priority elevation to prevent starvation.
 *
 * Variables:
 * - currentPriority: 'Low', 'Medium', or 'High'
 * - pendingDuration: integer count of days the bin has remained uncollected.
 *
 * Rules:
 * - If pendingDuration >= 3 days -> Elevate to 'High'
 * - If pendingDuration >= 2 days -> 'Low' -> 'Medium'; 'Medium' -> 'High'
 * - Otherwise -> Retain currentPriority
 */
export function calculateEscalatedPriority(currentPriority, pendingDuration) {
  if (pendingDuration >= 3) return 'High';
  if (pendingDuration >= 2) {
    if (currentPriority === 'Low') return 'Medium';
    if (currentPriority === 'Medium') return 'High';
  }
  return currentPriority;
}

/**
 * Generates next unique Bin ID
 */
export function generateNextBinId(existingBins) {
  let maxNum = 100;
  existingBins.forEach(b => {
    const match = b.id.match(/BIN-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  return `BIN-${maxNum + 1}`;
}
