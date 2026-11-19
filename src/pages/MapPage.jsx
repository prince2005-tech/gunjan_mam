import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SharedWasteMap from '../components/map/SharedWasteMap';
import ColorIcon from '../components/common/ColorIcon';

export default function MapPage({ setActivePage, setLocationForNewBin }) {
  const { bins, trucks, roadGraph, optimizationResult, currentDay } = useApp();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Route Context */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8F3EA] text-[#16834A] font-bold border border-[#C8DFCE]">
              GIS ROUTING MAP
            </span>
            <span className="text-xs text-[#64748B] font-semibold">Waste Collection Infrastructure</span>
          </div>
          <h2 className="text-xl font-bold text-[#1F2937] mt-2">
            Interactive Road Network & Collection Route Visualizer
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Real-world road-following vehicle polylines (OSRM) with Held-Karp visiting stop sequences and waste bin statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('optimization')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16834A] hover:bg-[#136F3F] text-white text-xs font-bold shadow-sm transition"
          >
            <ColorIcon name="optimization" className="w-4 h-4 shrink-0" />
            Optimization Centre
          </button>
        </div>
      </div>

      {/* Summary Chips with Colourful Illustrated Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Total Waste Bins</span>
            <ColorIcon name="bins" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#1F2937] mt-1">{bins.length}</div>
          <div className="text-[11px] text-[#64748B] mt-1">
            {bins.filter(b => b.status === 'collected').length} collected &bull; {bins.filter(b => b.status === 'pending').length} pending
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Scheduled Routes</span>
            <ColorIcon name="truck" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#16834A] mt-1">
            {optimizationResult?.truckResults?.filter(t => t.knapsack.selectedCount > 0).length || 0}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            {optimizationResult?.metrics?.totalSelectedBins || 0} stops scheduled
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Total Route Distance</span>
            <ColorIcon name="optimization" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#168A83] mt-1">
            {optimizationResult?.metrics?.totalRouteDistanceKm || 0} <span className="text-xs font-normal text-[#64748B]">km</span>
          </div>
          <div className="text-[11px] text-[#168A83] font-semibold mt-1">
            Real Road Distance (OSRM)
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Road Network</span>
            <ColorIcon name="network" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#7C3AED] mt-1">
            {Object.keys(roadGraph.nodes || {}).length} <span className="text-xs font-normal text-[#64748B]">nodes</span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            {roadGraph.edges?.length || 0} bidirectional street segments
          </div>
        </div>
      </div>

      {/* Main Map: Reduced dimensions modestly (w-full max-w-[94%] mx-auto, height 500px), centered */}
      <div className="w-full max-w-[94%] mx-auto transition-all">
        <SharedWasteMap
          bins={bins}
          trucks={trucks}
          optimizationResult={optimizationResult}
          roadGraph={roadGraph}
          height="500px"
          showControls={true}
          showRoadNetworkDefault={true}
        />
      </div>
    </div>
  );
}
