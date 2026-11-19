import React from 'react';
import { useApp } from '../../context/AppContext';
import ColorIcon from '../common/ColorIcon';

export default function Header({ activePage }) {
  const { currentDay, dashboardStats } = useApp();

  const titles = {
    dashboard: 'Waste Collection Dashboard',
    map: 'Interactive GIS Network & Routes Map',
    bins: 'Waste Bin Registry & Management',
    trucks: 'Fleet & Service Zone Management',
    optimization: 'Route Optimization Centre',
    network: 'Road Network Minimum Spanning Tree (MST)',
    analytics: 'Collection Analytics & Algorithm Benchmarking'
  };

  return (
    <header className="h-16 border-b border-[#E2EAE2] bg-[#FFFFFF] px-6 flex items-center justify-between z-10 shrink-0">
      <div>
        <h1 className="text-base font-bold text-[#1F2937] flex items-center gap-2.5">
          {titles[activePage] || 'WasteWise'}
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8F3EA] text-[#16834A] font-bold border border-[#C8DFCE]">
            Day {currentDay}
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick KPI badges */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F8F5] text-[#1F2937] border border-[#E2EAE2]">
            <ColorIcon name="bins" className="w-4 h-4 shrink-0" />
            <span className="text-[#64748B]">Bins Today:</span>
            <span className="font-bold text-[#16834A]">{dashboardStats.collectedBinsToday}</span>
            <span className="text-[#64748B]">/</span>
            <span className="font-bold">{dashboardStats.totalBins}</span>
            <span className="text-[#16834A] font-semibold text-[11px]">({dashboardStats.collectionPercentage}%)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F8F5] text-[#1F2937] border border-[#E2EAE2]">
            <ColorIcon name="truck" className="w-4 h-4 shrink-0" />
            <span className="text-[#64748B]">Fleet Payload:</span>
            <span className="font-bold text-[#168A83]">{dashboardStats.currentFleetLoad}</span>
            <span className="text-[#64748B]">/</span>
            <span className="font-bold">{dashboardStats.totalFleetCapacity} kg</span>
          </div>
        </div>
      </div>
    </header>
  );
}
