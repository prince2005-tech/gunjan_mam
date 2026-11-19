import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_BINS } from '../data/initialBins.js';
import { INITIAL_TRUCKS } from '../data/initialTrucks.js';
import { INITIAL_ROAD_GRAPH } from '../data/roadNetwork.js';
import { storage } from '../utils/storage.js';
import { runFullOptimization, runFullOptimizationSync } from '../services/optimizationService.js';
import {
  executeCollectionPlan,
  startNextDayCycle,
  unloadTruckAtDepot,
  unloadAllTrucksAtDepot
} from '../services/collectionService.js';
import { findNearestRoadNode, generateNextBinId } from '../services/binService.js';
import { generateNextTruckId, getTruckStyling } from '../services/truckService.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Core Persistent State
  const [bins, setBins] = useState(() => storage.get('bins', INITIAL_BINS));
  const [trucks, setTrucks] = useState(() => storage.get('trucks', INITIAL_TRUCKS));
  const [roadGraph, setRoadGraph] = useState(() => storage.get('roadGraph', INITIAL_ROAD_GRAPH));
  const [currentDay, setCurrentDay] = useState(() => storage.get('currentDay', 1));
  const [collectionHistory, setCollectionHistory] = useState(() => storage.get('collectionHistory', []));
  const [collectionWorkflowStage, setCollectionWorkflowStage] = useState(() => storage.get('collectionWorkflowStage', 'ready'));
  const [notification, setNotification] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Active optimization plan
  const [optimizationResult, setOptimizationResult] = useState(() => {
    return storage.get('optimizationResult', null);
  });

  // Algorithm execution timings (measured pure DAA runtimes from optimization and MST analysis)
  const [algorithmTimings, setAlgorithmTimings] = useState(() => {
    return storage.get('algorithmTimings', null) || storage.get('optimizationResult', null)?.benchmarks || null;
  });

  const [mstTimings, setMstTimings] = useState(() => {
    return storage.get('mstTimings', null);
  });

  // 2. LocalStorage Persistence
  useEffect(() => {
    storage.set('bins', bins);
  }, [bins]);

  useEffect(() => {
    storage.set('trucks', trucks);
  }, [trucks]);

  useEffect(() => {
    storage.set('roadGraph', roadGraph);
  }, [roadGraph]);

  useEffect(() => {
    storage.set('currentDay', currentDay);
  }, [currentDay]);

  useEffect(() => {
    storage.set('collectionHistory', collectionHistory);
  }, [collectionHistory]);

  useEffect(() => {
    storage.set('collectionWorkflowStage', collectionWorkflowStage);
  }, [collectionWorkflowStage]);

  useEffect(() => {
    storage.set('optimizationResult', optimizationResult);
  }, [optimizationResult]);

  useEffect(() => {
    storage.set('algorithmTimings', algorithmTimings);
  }, [algorithmTimings]);

  useEffect(() => {
    storage.set('mstTimings', mstTimings);
  }, [mstTimings]);

  // Notifications
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(prev => (prev?.id ? null : prev));
    }, 4500);
  }, []);

  const clearNotification = useCallback(() => setNotification(null), []);

  // 3. Optimization Workflow Actions

  /**
   * ACTION 1: Optimize Routes
   * Runs complete optimization pipeline with OSRM real road routing and Held-Karp stop sequencing.
   * DOES NOT mark any bin as collected.
   */
  const optimizeRoutes = useCallback(async () => {
    const pendingBins = bins.filter(b => b.status === 'pending');
    if (pendingBins.length === 0) {
      showNotification('All waste bins are already collected for today.', 'info');
      return null;
    }

    const availableCapacity = trucks.reduce((sum, t) => sum + t.remainingCapacity, 0);
    if (availableCapacity <= 0) {
      showNotification('No trucks have remaining capacity. Please unload completed trucks at the depot first.', 'warning');
      return null;
    }

    setIsOptimizing(true);
    showNotification('Calculating optimal route sequences & fetching road geometry...', 'info');

    try {
      const plan = await runFullOptimization(roadGraph, bins, trucks, { enableOsrm: true });
      setOptimizationResult(plan);

      if (plan && plan.benchmarks) {
        setAlgorithmTimings({
          dijkstraTimeMs: plan.benchmarks.dijkstraTimeMs,
          knapsackTimeMs: plan.benchmarks.knapsackTimeMs,
          tspTimeMs: plan.benchmarks.tspTimeMs,
          pureDaaAlgorithmTotalMs: plan.benchmarks.pureDaaAlgorithmTotalMs,
          updatedAt: new Date().toISOString()
        });
      }

      if (plan.metrics.totalSelectedBins === 0) {
        showNotification('No eligible bins could be assigned to current available truck service zones.', 'warning');
      } else {
        setCollectionWorkflowStage('optimized');
        showNotification(
          `Optimization complete! Selected ${plan.metrics.totalSelectedBins} bins across ${plan.truckResults.filter(t => t.knapsack.selectedCount > 0).length} truck routes (${plan.metrics.totalRouteDistanceKm} km total). Ready for collection execution.`,
          'success'
        );
      }
      return plan;
    } catch (err) {
      console.error('Optimization error:', err);
      showNotification(`Optimization failed: ${err.message}`, 'error');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [roadGraph, bins, trucks, showNotification]);

  /**
   * ACTION 2: Execute Collection
   * Atomically executes the currently valid optimization plan.
   * Marks selected bins as collected, updates truck payloads, and records history.
   */
  const executeCollection = useCallback(() => {
    if (collectionWorkflowStage !== 'optimized') {
      showNotification('Please optimize routes before executing collection.', 'warning');
      return false;
    }

    if (!optimizationResult || !optimizationResult.truckResults) {
      showNotification('Please optimize routes first before executing collection.', 'warning');
      return false;
    }

    if (optimizationResult.isOutdated) {
      showNotification('The current route plan is outdated due to recent configuration changes. Please re-optimize routes.', 'warning');
      return false;
    }

    const pendingBins = bins.filter(b => b.status === 'pending');
    if (pendingBins.length === 0) {
      showNotification('All waste bins have already been collected for today.', 'info');
      return false;
    }

    if (optimizationResult.metrics.totalSelectedBins === 0) {
      showNotification('The current optimization plan contains 0 selected bins. Cannot execute empty collection.', 'warning');
      return false;
    }

    // Execute plan atomically
    const { success, updatedBins, updatedTrucks, newHistoryRecords, message } =
      executeCollectionPlan(bins, trucks, optimizationResult, currentDay);

    if (success) {
      setBins(updatedBins);
      setTrucks(updatedTrucks);
      setCollectionHistory(prev => [...newHistoryRecords, ...prev]);
      setCollectionWorkflowStage('executed');

      // Update plan without marking it outdated, so no unwanted re-optimize banner appears
      const updatedPlan = {
        ...optimizationResult,
        isOutdated: false,
        metrics: {
          ...optimizationResult.metrics,
          totalSelectedBins: 0,
          totalRemainingPending: updatedBins.filter(b => b.status === 'pending').length
        }
      };
      setOptimizationResult(updatedPlan);

      showNotification(message, 'success');
      return true;
    } else {
      showNotification(message, 'error');
      return false;
    }
  }, [collectionWorkflowStage, bins, trucks, optimizationResult, currentDay, showNotification]);

  /**
   * ACTION 3: Start Next Day
   * Advances simulation to Day N+1.
   * Carries forward uncollected bins with escalated priority, resets trucks to depot.
   */
  const advanceToNextDay = useCallback(() => {
    if (collectionWorkflowStage !== 'executed' && collectionWorkflowStage !== 'unloaded') {
      showNotification('Please optimize routes and execute today\'s collection before advancing to the next day.', 'warning');
      return;
    }

    const { nextDay, nextDayBins, nextDayTrucks, message } =
      startNextDayCycle(currentDay, bins, trucks, collectionHistory);

    setCurrentDay(nextDay);
    setBins(nextDayBins);
    setTrucks(nextDayTrucks);
    setOptimizationResult(null); // Fresh day starts clean until user optimizes
    setCollectionWorkflowStage('ready');

    showNotification(message, 'success');
  }, [collectionWorkflowStage, currentDay, bins, trucks, collectionHistory, showNotification]);

  /**
   * ACTION 4: Unload Trucks at Central Depot (for multi-trip daily collections)
   */
  const unloadTruck = useCallback((truckId) => {
    const updated = unloadTruckAtDepot(truckId, trucks);
    setTrucks(updated);
    const anyStillCompleted = updated.some(t => t.availability === 'completed');
    if (!anyStillCompleted && collectionWorkflowStage === 'executed') {
      setCollectionWorkflowStage('unloaded');
      setOptimizationResult(null);
    }
    showNotification(`Truck ${truckId} successfully unloaded at Central Depot. Capacity restored.`, 'success');
  }, [trucks, collectionWorkflowStage, showNotification]);

  const unloadAllTrucks = useCallback(() => {
    const updated = unloadAllTrucksAtDepot(trucks);
    setTrucks(updated);
    setCollectionWorkflowStage('unloaded');
    setOptimizationResult(null);
    showNotification('Entire fleet unloaded at Central Depot. All trucks available for additional trips.', 'success');
  }, [trucks, showNotification]);

  /**
   * ACTION 5: Start New Simulation (Reset to fresh Day 1)
   */
  const startNewSimulation = useCallback(() => {
    storage.clearAll();
    setCurrentDay(1);
    setBins(INITIAL_BINS);
    setTrucks(INITIAL_TRUCKS);
    setRoadGraph(INITIAL_ROAD_GRAPH);
    setCollectionHistory([]);
    setOptimizationResult(null);
    setAlgorithmTimings(null);
    setMstTimings(null);
    setCollectionWorkflowStage('ready');
    showNotification('Simulation reset successfully! Initialized Day 1 with 20 default bins and 3 standard trucks.', 'success');
  }, [showNotification]);

  // Record actual execution timings for Prim's and Kruskal's MST analysis
  const recordMstExecution = useCallback((timings) => {
    setMstTimings(timings);
  }, []);

  // Invalidate route plan when bins/trucks/graph change
  const invalidatePlan = useCallback(() => {
    if (collectionWorkflowStage === 'optimized') {
      setOptimizationResult(prev => prev ? { ...prev, isOutdated: true } : null);
    }
  }, [collectionWorkflowStage]);

  // --- CRUD BIN ACTIONS ---
  const addBin = useCallback(({ lat, lng, wasteKg, priority, locationName }) => {
    const nearestNode = findNearestRoadNode(roadGraph.nodes, lat, lng);
    const nodeObj = roadGraph.nodes[nearestNode];
    const newId = generateNextBinId(bins);

    const newBin = {
      id: newId,
      nodeId: nearestNode,
      locationName: locationName || nodeObj?.name || `Location near Junction ${nearestNode}`,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      wasteKg: parseFloat(Number(wasteKg).toFixed(1)),
      priority: priority || 'Medium',
      status: 'pending',
      pendingDuration: 0,
      lastCollectedDate: null,
      assignedTruckId: null
    };

    setBins(prev => [newBin, ...prev]);
    invalidatePlan();
    showNotification(`Waste Bin ${newId} registered at Junction ${nearestNode}. Please re-optimize routes.`, 'success');
    return newBin;
  }, [bins, roadGraph, invalidatePlan, showNotification]);

  const updateBin = useCallback((binId, updatedFields) => {
    setBins(prev => prev.map(b => {
      if (b.id !== binId) return b;
      let updated = { ...b, ...updatedFields };

      if (updatedFields.lat !== undefined && updatedFields.lng !== undefined) {
        const nearestNode = findNearestRoadNode(roadGraph.nodes, updatedFields.lat, updatedFields.lng);
        updated.nodeId = nearestNode;
        if (!updatedFields.locationName) {
          updated.locationName = roadGraph.nodes[nearestNode]?.name || updated.locationName;
        }
      }

      if (updatedFields.wasteKg !== undefined) {
        updated.wasteKg = parseFloat(Number(updatedFields.wasteKg).toFixed(1));
      }

      return updated;
    }));

    invalidatePlan();
    showNotification(`Bin ${binId} updated. Please re-optimize routes.`, 'info');
  }, [roadGraph, invalidatePlan, showNotification]);

  const deleteBin = useCallback((binId) => {
    setBins(prev => prev.filter(b => b.id !== binId));
    invalidatePlan();
    showNotification(`Bin ${binId} removed.`, 'warning');
  }, [invalidatePlan, showNotification]);

  // --- CRUD TRUCK ACTIONS ---
  const addTruck = useCallback(({ name, totalCapacity, zoneMinKm, zoneMaxKm, zoneName }) => {
    const newId = generateNextTruckId(trucks);
    const styling = getTruckStyling(trucks.length);
    const cap = parseFloat(Number(totalCapacity).toFixed(1));

    const newTruck = {
      id: newId,
      name: name || `Truck ${trucks.length + 1}`,
      totalCapacity: cap,
      currentLoad: 0,
      remainingCapacity: cap,
      zoneName: zoneName || `Zone (${zoneMinKm} – ${zoneMaxKm} km)`,
      zoneMinKm: parseFloat(Number(zoneMinKm).toFixed(1)),
      zoneMaxKm: parseFloat(Number(zoneMaxKm).toFixed(1)),
      currentLocation: 'Central Depot',
      availability: 'available',
      assignedBins: [],
      color: styling.color,
      badgeClass: styling.badgeClass
    };

    setTrucks(prev => [...prev, newTruck]);
    invalidatePlan();
    showNotification(`Truck ${newId} (${newTruck.name}) registered in ${newTruck.zoneName}.`, 'success');
    return newTruck;
  }, [trucks, invalidatePlan, showNotification]);

  const updateTruck = useCallback((truckId, updatedFields) => {
    setTrucks(prev => prev.map(t => {
      if (t.id !== truckId) return t;
      const updated = { ...t, ...updatedFields };

      if (updatedFields.totalCapacity !== undefined) {
        updated.totalCapacity = parseFloat(Number(updatedFields.totalCapacity).toFixed(1));
        updated.remainingCapacity = Math.max(0, updated.totalCapacity - updated.currentLoad);
      }

      return updated;
    }));

    invalidatePlan();
    showNotification(`Truck ${truckId} specifications updated.`, 'info');
  }, [invalidatePlan, showNotification]);

  const deleteTruck = useCallback((truckId) => {
    setTrucks(prev => prev.filter(t => t.id !== truckId));
    invalidatePlan();
    showNotification(`Truck ${truckId} removed from fleet.`, 'warning');
  }, [invalidatePlan, showNotification]);

  // Derived Reactive Dashboard Statistics
  const dashboardStats = useMemo(() => {
    const totalBins = bins.length;
    const collectedBinsToday = bins.filter(b => b.status === 'collected').length;
    const pendingBinsToday = totalBins - collectedBinsToday;
    const collectionPercentage = totalBins > 0 ? parseFloat(((collectedBinsToday / totalBins) * 100).toFixed(1)) : 0;

    const totalFleetCapacity = trucks.reduce((sum, t) => sum + t.totalCapacity, 0);
    const currentFleetLoad = trucks.reduce((sum, t) => sum + t.currentLoad, 0);
    const fleetRemainingCapacity = Math.max(0, totalFleetCapacity - currentFleetLoad);

    // Distinguish daily collection from total historical collection
    const todayRecords = collectionHistory.filter(h => h.dayNumber === currentDay);
    const todayWasteCollected = todayRecords.reduce((sum, h) => sum + h.totalWasteCollectedKg, 0);
    const todayDistanceTraveled = todayRecords.reduce((sum, h) => sum + (h.routeDistanceKm || 0), 0);

    const totalHistoricalWaste = collectionHistory.reduce((sum, h) => sum + h.totalWasteCollectedKg, 0);
    const totalHistoricalBins = collectionHistory.reduce((sum, h) => sum + h.collectedBinsCount, 0);

    const plannedRouteDistance = optimizationResult && !optimizationResult.isOutdated
      ? optimizationResult.metrics.totalRouteDistanceKm
      : 0;

    return {
      currentDay,
      totalBins,
      collectedBinsToday,
      pendingBinsToday,
      collectionPercentage,
      totalTrucks: trucks.length,
      availableTrucks: trucks.filter(t => t.availability === 'available').length,
      completedTrucks: trucks.filter(t => t.availability === 'completed').length,
      totalFleetCapacity,
      currentFleetLoad,
      fleetRemainingCapacity,
      fleetUtilization: totalFleetCapacity > 0 ? parseFloat(((currentFleetLoad / totalFleetCapacity) * 100).toFixed(1)) : 0,
      todayWasteCollected: parseFloat(todayWasteCollected.toFixed(2)),
      todayDistanceTraveled: parseFloat(todayDistanceTraveled.toFixed(2)),
      plannedRouteDistance,
      totalHistoricalWaste: parseFloat(totalHistoricalWaste.toFixed(2)),
      totalHistoricalBins,
      totalTripsCompleted: collectionHistory.length
    };
  }, [bins, trucks, optimizationResult, collectionHistory, currentDay]);

  const value = {
    // State
    bins,
    trucks,
    roadGraph,
    currentDay,
    collectionHistory,
    optimizationResult,
    algorithmTimings,
    mstTimings,
    dashboardStats,
    notification,
    isOptimizing,
    collectionWorkflowStage,

    // Primary 3 Workflow Actions
    optimizeRoutes,
    executeCollection,
    advanceToNextDay,
    recordMstExecution,

    // Additional Trip Actions
    unloadTruck,
    unloadAllTrucks,
    startNewSimulation,

    // CRUD
    addBin,
    updateBin,
    deleteBin,
    addTruck,
    updateTruck,
    deleteTruck,

    // Utilities
    showNotification,
    clearNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
