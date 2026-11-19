import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/layout/ConfirmModal';
import SharedWasteMap from '../components/map/SharedWasteMap';
import ColorIcon from '../components/common/ColorIcon';
import {
  Route,
  CheckCircle2,
  Clock,
  Truck,
  Scale,
  PlayCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function Optimization({ setActivePage }) {
  const {
    bins,
    trucks,
    currentDay,
    optimizationResult,
    optimizeRoutes,
    executeCollection,
    advanceToNextDay,
    unloadTruck,
    unloadAllTrucks,
    isOptimizing,
    collectionWorkflowStage,
    roadGraph
  } = useApp();

  const [expandedTruck, setExpandedTruck] = useState(null);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showNextDayModal, setShowNextDayModal] = useState(false);
  const [showUnloadAllModal, setShowUnloadAllModal] = useState(false);

  const pendingBins = bins.filter(b => b.status === 'pending');
  const hasPlan = Boolean(optimizationResult && optimizationResult.truckResults);
  const isOutdated = optimizationResult?.isOutdated;
  const totalSelectedCount = optimizationResult?.metrics?.totalSelectedBins || 0;
  const completedTrucks = trucks.filter(t => t.availability === 'completed');
  const hasLoadedTrucks = trucks.some(t => t.currentLoad > 0);

  // Strict Workflow Button Conditions
  const canOptimize =
    !isOptimizing &&
    pendingBins.length > 0 &&
    (collectionWorkflowStage === 'ready' || (collectionWorkflowStage === 'unloaded' && trucks.some(t => t.remainingCapacity > 0)));

  const canExecute =
    !isOptimizing &&
    collectionWorkflowStage === 'optimized' &&
    hasPlan &&
    totalSelectedCount > 0 &&
    !isOutdated;

  const canAdvanceDay =
    !isOptimizing &&
    (collectionWorkflowStage === 'executed' || collectionWorkflowStage === 'unloaded');

  const handleExecute = () => {
    executeCollection();
    setShowExecuteModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner and 3 Primary Operational Actions */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8F3EA] text-[#16834A] font-bold border border-[#C8DFCE]">
              Optimization Process
            </span>
            <span className="text-xs text-[#64748B] font-semibold">Day {currentDay} Collection Cycle</span>
          </div>
          <h2 className="text-xl font-bold text-[#1F2937] mt-2">
            Route Optimization & Collection Dispatch Centre
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Separated 3-stage workflow: <strong>1. Optimize Routes</strong> (plan only) &rarr; <strong>2. Execute Collection</strong> (commit loads) &rarr; <strong>3. Start Next Day</strong>.
          </p>
        </div>

        {/* 3 Primary Action Buttons with Strict Workflow Control */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Action 1: Optimize Routes */}
          <button
            onClick={() => optimizeRoutes()}
            disabled={!canOptimize}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              !canOptimize
                ? 'bg-[#E2EAE2] text-[#94A3B8] cursor-not-allowed opacity-60'
                : 'bg-[#16834A] hover:bg-[#136F3F] text-white cursor-pointer'
            }`}
            title={!canOptimize && collectionWorkflowStage === 'optimized' ? 'Execute the current optimized plan first' : ''}
          >
            <ColorIcon name="optimization" className={`w-4 h-4 shrink-0 ${isOptimizing ? 'animate-spin' : ''}`} />
            {isOptimizing ? 'Computing Routes...' : collectionWorkflowStage === 'unloaded' ? 'Optimize Remaining Bins' : 'Optimize Routes'}
          </button>

          {/* Action 2: Execute Collection */}
          <button
            onClick={() => setShowExecuteModal(true)}
            disabled={!canExecute}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              !canExecute
                ? 'bg-[#E2EAE2] text-[#94A3B8] cursor-not-allowed opacity-60'
                : 'bg-[#168A83] hover:bg-[#116E68] text-white cursor-pointer'
            }`}
            title={!canExecute && collectionWorkflowStage === 'ready' ? 'Optimize routes first before executing collection' : ''}
          >
            <ColorIcon name="check" className="w-4 h-4 shrink-0" />
            Execute Collection
          </button>

          {/* Action 3: Start Next Day */}
          <button
            onClick={() => setShowNextDayModal(true)}
            disabled={!canAdvanceDay}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition shadow-sm ${
              !canAdvanceDay
                ? 'bg-[#F1F5F1] text-[#94A3B8] border-[#E2EAE2] cursor-not-allowed opacity-60'
                : 'bg-[#E8F3EA] hover:bg-[#D5E8D9] text-[#174B32] border-[#C8DFCE] cursor-pointer'
            }`}
            title={!canAdvanceDay ? 'Execute today\'s collection before starting the next day' : ''}
          >
            <ColorIcon name="calendar" className="w-4 h-4 shrink-0" />
            Start Next Day
          </button>
        </div>
      </div>

      {/* Outdated Plan Warning Banner ONLY if configuration changed while in 'optimized' stage */}
      {isOutdated && collectionWorkflowStage === 'optimized' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ColorIcon name="warning" className="w-4 h-4 shrink-0" />
            <span>
              <strong>Configuration Changed:</strong> Bins, fleet capacities, or collection status have updated. Click <strong>Optimize Routes</strong> to generate fresh routes for the remaining pending bins.
            </span>
          </div>
          <button
            onClick={() => optimizeRoutes()}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Re-optimize Now
          </button>
        </div>
      )}

      {/* Multi-Trip Unloading Notice: Shown ONLY in 'executed' stage when bins remain pending & trucks hold collected waste */}
      {collectionWorkflowStage === 'executed' && pendingBins.length > 0 && hasLoadedTrucks && (
        <div className="p-4 rounded-2xl bg-[#E8F1FA] border border-[#BFDBFE] text-sky-900 text-xs flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ColorIcon name="truck" className="w-4 h-4 shrink-0" />
            <span>
              <strong>Additional Trip Required:</strong> {completedTrucks.length || trucks.filter(t => t.currentLoad > 0).length} truck(s) completed collection and are loaded. Unload trucks at the Central Depot to restore capacity and dispatch an additional collection trip for remaining pending bins.
            </span>
          </div>
          <button
            onClick={() => setShowUnloadAllModal(true)}
            className="px-3.5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Unload Fleet at Depot
          </button>
        </div>
      )}

      {/* Operational Summary Metric Cards with Colourful Illustrated Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Pending Bins Today</span>
            <ColorIcon name="hourglass" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#F59E0B] mt-1">{pendingBins.length}</div>
          <div className="text-[11px] text-[#64748B] mt-1">Awaiting Collection</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Planned Collection</span>
            <ColorIcon name="recycle" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#16834A] mt-1">{totalSelectedCount} <span className="text-xs text-[#64748B] font-normal">bins</span></div>
          <div className="text-[11px] text-[#64748B] mt-1">
            {optimizationResult?.metrics?.totalSelectedWasteKg || 0} kg waste planned
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Planned Fleet Distance</span>
            <ColorIcon name="optimization" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#168A83] mt-1">
            {optimizationResult?.metrics?.totalRouteDistanceKm || 0} <span className="text-xs text-[#64748B] font-normal">km</span>
          </div>
          <div className="text-[11px] text-[#168A83] font-semibold mt-1">
            Real OSRM Driving Distance
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Active Fleet</span>
            <ColorIcon name="truck" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#0284C7] mt-1">
            {trucks.filter(t => t.availability === 'available').length} / {trucks.length}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">Available for Dispatch</div>
        </div>
      </div>

      {/* Interactive Map: Reduced dimensions modestly (w-full max-w-[94%] mx-auto, height 390px), centered */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
            <ColorIcon name="map" className="w-4 h-4 shrink-0" />
            Real-World Road Route Sequences & Fleet Map
          </h3>
          <span className="text-xs text-[#64748B]">
            {optimizationResult?.truckResults?.some(t => t.isRealRoad)
              ? 'Real-world road geometry powered by OSRM'
              : 'Road network geometry (Dijkstra shortest path)'}
          </span>
        </div>

        <div className="w-full max-w-[94%] mx-auto transition-all">
          <SharedWasteMap
            bins={bins}
            trucks={trucks}
            optimizationResult={optimizationResult}
            roadGraph={roadGraph}
            height="390px"
            showControls={true}
          />
        </div>
      </div>

      {/* Truck Assignment Cards (Total Priority REMOVED per Phase 1.4) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#172B20] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#15803D]" />
            Truck-Wise Route Sequences & Payload Allocations
          </h3>
          <span className="text-xs text-[#526658]">
            Click a truck to inspect ordered stops and DAA assignment details
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {optimizationResult?.truckResults?.map(tr => {
            const isExpanded = expandedTruck === tr.truckId;
            const truckObj = trucks.find(t => t.id === tr.truckId);
            const isCompleted = truckObj?.availability === 'completed';

            return (
              <div
                key={tr.truckId}
                className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Truck Card Header */}
                <div className="p-4 border-b border-[#E2EAE2] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tr.color }}></span>
                        <h4 className="font-bold text-sm text-[#172B20]">{tr.truckName}</h4>
                      </div>
                      <div className="text-xs text-[#526658] mt-0.5">{tr.zoneName}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tr.knapsack.selectedCount > 0
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tr.knapsack.selectedCount} BINS ASSIGNED
                    </span>
                  </div>

                  {/* Operational Metrics (TOTAL PRIORITY EXCLUDED PER SPECIFICATION 1.4) */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="bg-[#F5F8F5] p-2 rounded-xl">
                      <div className="text-[10px] text-[#526658] font-medium">Distance</div>
                      <div className="font-bold text-[#172B20] mt-0.5">{tr.routeDistanceKm} km</div>
                    </div>
                    <div className="bg-[#F5F8F5] p-2 rounded-xl">
                      <div className="text-[10px] text-[#526658] font-medium">Payload</div>
                      <div className="font-bold text-[#172B20] mt-0.5">{tr.totalWasteKg} / {tr.capacity} kg</div>
                    </div>
                    <div className="bg-[#F5F8F5] p-2 rounded-xl">
                      <div className="text-[10px] text-[#526658] font-medium">Utilization</div>
                      <div className="font-bold text-[#15803D] mt-0.5">{tr.capacityUtilization}%</div>
                    </div>
                  </div>

                  {/* Routing service indicator */}
                  <div className="flex items-center justify-between text-[11px] text-[#526658] pt-1">
                    <span>Routing:</span>
                    <span className={`font-semibold ${tr.isRealRoad ? 'text-[#15803D]' : 'text-[#D97706]'}`}>
                      {tr.routingService}
                    </span>
                  </div>
                </div>

                {/* Stop sequence accordion */}
                <div className="p-4 space-y-3 bg-[#FAFCFA]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172B20]">
                      Collection Stop Sequence ({tr.stopsOrder.length} stops)
                    </span>
                    <button
                      onClick={() => setExpandedTruck(isExpanded ? null : tr.truckId)}
                      className="text-xs text-[#15803D] hover:underline font-semibold flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide Stops' : 'View Stops'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Stops preview or full list */}
                  {isExpanded ? (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {tr.detailedStops?.map((stop, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E2EAE2] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#E2EAE2] text-[#172B20] text-[10px] font-bold flex items-center justify-center">
                              {sIdx}
                            </span>
                            <span className="font-medium text-[#172B20]">{stop.name}</span>
                          </div>
                          {stop.bin && (
                            <span className="text-[11px] text-[#526658] font-semibold">
                              {stop.bin.wasteKg} kg
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#526658] truncate">
                      {tr.stopsOrder.join(' → ')}
                    </div>
                  )}

                  {/* Unload button if truck completed trip */}
                  {isCompleted && (
                    <button
                      onClick={() => unloadTruck(tr.truckId)}
                      className="w-full mt-2 py-1.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Unload at Central Depot
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Remaining Pending Bins Table */}
      {pendingBins.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172B20] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D97706]" />
                Remaining Pending Waste Bins ({pendingBins.length})
              </h3>
              <p className="text-xs text-[#526658] mt-0.5">
                Bins currently uncollected. Bins unselected in the current trip can be dispatched in an additional trip after unloading trucks.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF8] text-[#526658] uppercase text-[10px] font-bold border-y border-[#E2EAE2]">
                <tr>
                  <th className="py-2.5 px-3">Bin ID</th>
                  <th className="py-2.5 px-3">Location Name</th>
                  <th className="py-2.5 px-3">Waste (kg)</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Pending Days</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EAE2] text-[#172B20]">
                {pendingBins.map(bin => {
                  const isAssigned = optimizationResult?.truckResults?.some(tr =>
                    tr.knapsack?.selectedBins?.some(b => b.id === bin.id)
                  );

                  return (
                    <tr key={bin.id} className="hover:bg-[#F9FAF9]">
                      <td className="py-2.5 px-3 font-bold">{bin.id}</td>
                      <td className="py-2.5 px-3 text-[#526658]">{bin.locationName}</td>
                      <td className="py-2.5 px-3 font-semibold">{bin.wasteKg} kg</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bin.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : bin.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bin.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{bin.pendingDuration || 0}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAssigned
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isAssigned ? 'Scheduled in Plan' : 'Awaiting Next Trip'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Collection Execution */}
      <ConfirmModal
        isOpen={showExecuteModal}
        title="Execute Scheduled Collection?"
        message={`This will dispatch garbage trucks to collect ${totalSelectedCount} waste bins according to the optimized routes. Selected bins will be marked collected, vehicle payloads updated, and historical collection records logged.`}
        confirmText="Confirm Collection Execution"
        confirmVariant="primary"
        onConfirm={handleExecute}
        onCancel={() => setShowExecuteModal(false)}
      />

      {/* Confirmation Modal for Next Day Advance */}
      <ConfirmModal
        isOpen={showNextDayModal}
        title={`Advance to Day ${currentDay + 1}?`}
        message="This concludes today's operations. Uncollected bins will carry forward with escalated priority and additional waste accumulation (+40 kg). Collected bins will regenerate daily waste. All garbage trucks will return to the Central Depot with zero load."
        confirmText="Initialize Next Day"
        confirmVariant="primary"
        onConfirm={() => {
          advanceToNextDay();
          setShowNextDayModal(false);
        }}
        onCancel={() => setShowNextDayModal(false)}
      />

      {/* Confirmation Modal for Unloading All Trucks */}
      <ConfirmModal
        isOpen={showUnloadAllModal}
        title="Unload Entire Fleet at Central Depot?"
        message="This simulates returning completed trucks to the Central Depot and emptying their collection payloads. All trucks will have their full capacity restored, allowing an additional collection trip for the remaining pending bins today."
        confirmText="Unload All at Depot"
        confirmVariant="primary"
        onConfirm={() => {
          unloadAllTrucks();
          setShowUnloadAllModal(false);
        }}
        onCancel={() => setShowUnloadAllModal(false)}
      />
    </div>
  );
}
