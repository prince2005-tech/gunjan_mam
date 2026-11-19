/**
 * Collection Execution and Multi-Day Cycle Service
 */

import { calculateEscalatedPriority } from './binService.js';

/**
 * Executes collection based on the current optimization results
 */
export function executeCollectionPlan(bins, trucks, optimizationResult, currentDay) {
  if (!optimizationResult || !optimizationResult.truckResults) {
    return { success: false, message: 'No valid optimization plan to execute.' };
  }

  const todayStr = `Day ${currentDay} (${new Date().toISOString().split('T')[0]})`;
  const updatedBins = bins.map(b => ({ ...b }));
  const updatedTrucks = trucks.map(t => ({ ...t, assignedBins: [...(t.assignedBins || [])] }));
  const newHistoryRecords = [];

  const binMap = new Map(updatedBins.map(b => [b.id, b]));

  optimizationResult.truckResults.forEach(tr => {
    const truck = updatedTrucks.find(t => t.id === tr.truckId);
    if (!truck) return;

    const collectedBinIds = [];
    let collectedWaste = 0;

    if (tr.knapsack && tr.knapsack.selectedBins) {
      tr.knapsack.selectedBins.forEach(selectedBin => {
        const liveBin = binMap.get(selectedBin.id);
        // Prevent duplicate collection if already collected today
        if (liveBin && liveBin.status === 'pending') {
          liveBin.status = 'collected';
          liveBin.lastCollectedDate = todayStr;
          liveBin.assignedTruckId = truck.id;
          liveBin.pendingDuration = 0;

          collectedBinIds.push(liveBin.id);
          collectedWaste += liveBin.wasteKg;
        }
      });
    }

    if (collectedBinIds.length > 0) {
      truck.currentLoad = parseFloat((truck.currentLoad + collectedWaste).toFixed(2));
      truck.remainingCapacity = parseFloat(Math.max(0, truck.totalCapacity - truck.currentLoad).toFixed(2));
      truck.availability = 'completed'; // Trip completed, at depot or ready to unload
      truck.assignedBins = Array.from(new Set([...(truck.assignedBins || []), ...collectedBinIds]));

      newHistoryRecords.push({
        id: `HIST-${Date.now()}-${truck.id}-${Math.floor(Math.random() * 1000)}`,
        dayNumber: currentDay,
        collectionDate: todayStr,
        truckId: truck.id,
        truckName: truck.name,
        zoneName: tr.zoneName,
        collectedBinIds,
        collectedBinsCount: collectedBinIds.length,
        totalWasteCollectedKg: parseFloat(collectedWaste.toFixed(2)),
        routeDistanceKm: tr.routeDistanceKm,
        routingService: tr.routingService || 'Simulated Road Graph',
        isRealRoad: tr.isRealRoad || false,
        status: 'Completed'
      });
    }
  });

  return {
    success: true,
    updatedBins,
    updatedTrucks,
    newHistoryRecords,
    message: `Collection successfully executed for Day ${currentDay}. Collected ${newHistoryRecords.reduce((s, r) => s + r.collectedBinsCount, 0)} bins across ${newHistoryRecords.length} truck routes.`
  };
}

/**
 * Unloads a single truck at Central Depot so it can undertake another collection trip.
 */
export function unloadTruckAtDepot(truckId, trucks) {
  return trucks.map(t => {
    if (t.id !== truckId) return t;
    return {
      ...t,
      currentLoad: 0,
      remainingCapacity: t.totalCapacity,
      currentLocation: 'Central Depot',
      availability: 'available'
    };
  });
}

/**
 * Unloads all trucks in the fleet at Central Depot.
 */
export function unloadAllTrucksAtDepot(trucks) {
  return trucks.map(t => ({
    ...t,
    currentLoad: 0,
    remainingCapacity: t.totalCapacity,
    currentLocation: 'Central Depot',
    availability: 'available'
  }));
}

/**
 * Transitions from Day N to Day N+1
 * - Preserves complete historical collection records
 * - Carries forward pending bins with escalated priority & realistic daily accumulation (+40 kg up to 650kg ceiling)
 * - Regenerates fresh baseline waste quantities for previously collected bins
 * - Resets all trucks to Central Depot with 0 load and 100% capacity
 */
export function startNextDayCycle(currentDay, bins, trucks, collectionHistory) {
  const nextDay = currentDay + 1;

  // 1. Process Bins
  const nextDayBins = bins.map(bin => {
    if (bin.status === 'collected') {
      // Bin was collected yesterday -> Fresh start with realistic new daily waste
      const baseKg = 150 + Math.floor(((bin.id.charCodeAt(bin.id.length - 1) * 37) % 200));
      return {
        ...bin,
        status: 'pending',
        pendingDuration: 0,
        wasteKg: baseKg,
        assignedTruckId: null
      };
    } else {
      // Bin remained pending -> Carry forward, increment pending duration, elevate priority if needed
      const newPendingDuration = (bin.pendingDuration || 0) + 1;
      const escalatedPriority = calculateEscalatedPriority(bin.priority, newPendingDuration);
      // Realistic daily accumulation (+40 kg up to 650kg ceiling)
      const accumulatedWaste = Math.min(650, bin.wasteKg + 40);

      return {
        ...bin,
        status: 'pending',
        pendingDuration: newPendingDuration,
        priority: escalatedPriority,
        wasteKg: accumulatedWaste,
        assignedTruckId: null
      };
    }
  });

  // 2. Reset Trucks to Central Depot
  const nextDayTrucks = trucks.map(truck => ({
    ...truck,
    currentLoad: 0,
    remainingCapacity: truck.totalCapacity,
    currentLocation: 'Central Depot',
    availability: 'available',
    assignedBins: []
  }));

  return {
    nextDay,
    nextDayBins,
    nextDayTrucks,
    message: `Initialized Day ${nextDay}. All trucks reset to Central Depot with full capacity. Uncollected bins carried forward with escalated priority.`
  };
}
