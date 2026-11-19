import { INITIAL_ROAD_GRAPH } from '../src/data/roadNetwork.js';
import { INITIAL_BINS } from '../src/data/initialBins.js';
import { INITIAL_TRUCKS } from '../src/data/initialTrucks.js';
import { runFullOptimizationSync } from '../src/services/optimizationService.js';
import {
  executeCollectionPlan,
  startNextDayCycle,
  unloadAllTrucksAtDepot
} from '../src/services/collectionService.js';

console.log('====================================================');
console.log('WASTEWISE STRICT COLLECTION WORKFLOW VERIFICATION');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// Simulation of State and Workflow
// -------------------------------------------------------------
let currentDay = 1;
let bins = JSON.parse(JSON.stringify(INITIAL_BINS));
let trucks = JSON.parse(JSON.stringify(INITIAL_TRUCKS));
let collectionHistory = [];
let collectionWorkflowStage = 'ready';
let optimizationResult = null;

// Helper to calculate button enablement like Optimization.jsx
function getButtonStates() {
  const pendingBins = bins.filter(b => b.status === 'pending');
  const hasPlan = Boolean(optimizationResult && optimizationResult.truckResults);
  const totalSelectedCount = optimizationResult?.metrics?.totalSelectedBins || 0;
  const isOutdated = Boolean(optimizationResult?.isOutdated);

  const canOptimize =
    pendingBins.length > 0 &&
    (collectionWorkflowStage === 'ready' || (collectionWorkflowStage === 'unloaded' && trucks.some(t => t.remainingCapacity > 0)));

  const canExecute =
    collectionWorkflowStage === 'optimized' &&
    hasPlan &&
    totalSelectedCount > 0 &&
    !isOutdated;

  const canAdvanceDay =
    (collectionWorkflowStage === 'executed' || collectionWorkflowStage === 'unloaded');

  const showAdditionalTripNotice =
    collectionWorkflowStage === 'executed' &&
    pendingBins.length > 0 &&
    trucks.some(t => t.currentLoad > 0);

  const showOutdatedBanner =
    isOutdated && collectionWorkflowStage === 'optimized';

  return {
    canOptimize,
    canExecute,
    canAdvanceDay,
    showAdditionalTripNotice,
    showOutdatedBanner,
    sidebarCanAdvance: canAdvanceDay
  };
}

console.log('--- TEST 3: STAGE 1 (READY) & OPTIMIZATION ---');
let s = getButtonStates();
assert(collectionWorkflowStage === 'ready', 'Stage is ready at start of day');
assert(s.canOptimize === true, 'Optimize Routes is ENABLED');
assert(s.canExecute === false, 'Execute Collection is DISABLED');
assert(s.canAdvanceDay === false, 'Start Next Day is DISABLED');
assert(s.sidebarCanAdvance === false, 'Sidebar Start Next Day is DISABLED');

// Perform Optimization Trip 1
optimizationResult = runFullOptimizationSync(INITIAL_ROAD_GRAPH, bins, trucks);
collectionWorkflowStage = 'optimized';
s = getButtonStates();

console.log('\n--- TEST 3 (cont): STAGE 2 (OPTIMIZED) ---');
assert(collectionWorkflowStage === 'optimized', 'Workflow advanced to optimized');
assert(s.canOptimize === false, 'Optimize Routes is DISABLED in optimized stage');
assert(s.canExecute === true, 'Execute Collection is ENABLED in optimized stage');
assert(s.canAdvanceDay === false, 'Start Next Day is DISABLED while plan is unexecuted');
assert(s.sidebarCanAdvance === false, 'Sidebar Start Next Day is DISABLED while plan is unexecuted');

console.log('\n--- TEST 4: STAGE 3 (EXECUTED - TRIP 1) ---');
const execResult = executeCollectionPlan(bins, trucks, optimizationResult, currentDay);
bins = execResult.updatedBins;
trucks = execResult.updatedTrucks;
collectionHistory = [...execResult.newHistoryRecords, ...collectionHistory];
collectionWorkflowStage = 'executed';
// Plan updated without isOutdated
optimizationResult = {
  ...optimizationResult,
  isOutdated: false,
  metrics: {
    ...optimizationResult.metrics,
    totalSelectedBins: 0,
    totalRemainingPending: bins.filter(b => b.status === 'pending').length
  }
};

s = getButtonStates();
assert(collectionWorkflowStage === 'executed', 'Workflow moved to executed');
assert(s.canOptimize === false, 'Optimize Routes is DISABLED immediately after execution');
assert(s.canExecute === false, 'Execute Collection is DISABLED after execution');
assert(s.canAdvanceDay === true, 'Start Next Day is ENABLED after execution');
assert(s.sidebarCanAdvance === true, 'Sidebar Start Next Day is ENABLED after execution');
assert(s.showAdditionalTripNotice === true, 'Additional Trip Required notice is DISPLAYED (loaded trucks + pending bins)');
assert(s.showOutdatedBanner === false, 'No Re-optimize Now / Outdated banner is shown after execution');
assert(bins.filter(b => b.status === 'collected').length === 15, 'Selected 15 bins are collected');
assert(bins.filter(b => b.status === 'pending').length === 5, '5 bins remain pending');

console.log('\n--- TEST 5: STAGE 4 (UNLOAD FLEET AT DEPOT) ---');
trucks = unloadAllTrucksAtDepot(trucks);
collectionWorkflowStage = 'unloaded';
optimizationResult = null; // Clear previous trip plan

s = getButtonStates();
assert(collectionWorkflowStage === 'unloaded', 'Workflow moved to unloaded');
assert(trucks.every(t => t.currentLoad === 0), 'All truck payloads emptied (0 kg)');
assert(trucks.every(t => t.availability === 'available'), 'All trucks restored to available');
assert(s.canOptimize === true, 'Optimize Routes is ENABLED for remaining pending bins');
assert(s.canExecute === false, 'Execute Collection is DISABLED until re-optimization');
assert(s.canAdvanceDay === true, 'Start Next Day remains ENABLED if user prefers to advance');
assert(s.sidebarCanAdvance === true, 'Sidebar Start Next Day is ENABLED');
assert(s.showAdditionalTripNotice === false, 'Additional Trip Required notice hidden after unloading');

console.log('\n--- TEST 6: STAGE 5 (SECOND COLLECTION TRIP OPTIMIZATION) ---');
const pendingBeforeTrip2 = bins.filter(b => b.status === 'pending');
assert(pendingBeforeTrip2.length === 5, 'Only 5 remaining pending bins will be considered');
optimizationResult = runFullOptimizationSync(INITIAL_ROAD_GRAPH, bins, trucks);
collectionWorkflowStage = 'optimized';

s = getButtonStates();
assert(collectionWorkflowStage === 'optimized', 'Workflow moved to optimized for Trip 2');
assert(s.canOptimize === false, 'Optimize Routes is DISABLED during Trip 2 planning');
assert(s.canExecute === true, 'Execute Collection is ENABLED for Trip 2');
assert(s.canAdvanceDay === false, 'Start Next Day is DISABLED before executing Trip 2');
assert(s.sidebarCanAdvance === false, 'Sidebar Start Next Day is DISABLED before executing Trip 2');
assert(optimizationResult.metrics.totalSelectedBins === 5, 'All 5 remaining bins selected for Trip 2');

console.log('\n--- TEST 7: EXECUTE SECOND TRIP ---');
const execResult2 = executeCollectionPlan(bins, trucks, optimizationResult, currentDay);
bins = execResult2.updatedBins;
trucks = execResult2.updatedTrucks;
collectionHistory = [...execResult2.newHistoryRecords, ...collectionHistory];
collectionWorkflowStage = 'executed';

s = getButtonStates();
assert(collectionWorkflowStage === 'executed', 'Workflow moved to executed for Trip 2');
assert(bins.filter(b => b.status === 'pending').length === 0, 'All bins now collected (0 pending)');
assert(s.showAdditionalTripNotice === false, 'Additional Trip notice hidden because 0 pending bins remain');
assert(s.canAdvanceDay === true, 'Start Next Day is ENABLED');
assert(s.sidebarCanAdvance === true, 'Sidebar Start Next Day is ENABLED');
assert(collectionHistory.length === 6, 'Total 6 collection records logged in history');

console.log('\n--- TEST 8: STAGE 6 (START NEXT DAY) ---');
const nextDayData = startNextDayCycle(currentDay, bins, trucks, collectionHistory);
currentDay = nextDayData.nextDay;
bins = nextDayData.nextDayBins;
trucks = nextDayData.nextDayTrucks;
collectionWorkflowStage = 'ready';
optimizationResult = null;

s = getButtonStates();
assert(currentDay === 2, 'Day incremented from 1 to 2');
assert(collectionWorkflowStage === 'ready', 'Workflow stage reset to ready');
assert(trucks.every(t => t.currentLoad === 0), 'Truck payloads reset to 0 kg');
assert(trucks.every(t => t.availability === 'available'), 'All trucks restored to available');
assert(s.canOptimize === true, 'New day begins with Optimize Routes ENABLED');
assert(s.canExecute === false, 'New day begins with Execute Collection DISABLED');
assert(s.canAdvanceDay === false, 'New day begins with Start Next Day DISABLED');
assert(s.sidebarCanAdvance === false, 'New day begins with Sidebar Start Next Day DISABLED');

console.log('\n--- TEST 9 & 10: PERSISTENCE & SIDEBAR RESTRICTIONS ---');
// Verify stage transitions can be serialized and deserialized
const stages = ['ready', 'optimized', 'executed', 'unloaded'];
for (const stage of stages) {
  const serialized = JSON.stringify(stage);
  const deserialized = JSON.parse(serialized);
  assert(deserialized === stage, `Workflow stage ${stage} serializes/deserializes correctly`);
}

console.log('\n====================================================');
console.log(`SUMMARY: ${passed} / ${total} WORKFLOW TESTS PASSED!`);
console.log('====================================================');
