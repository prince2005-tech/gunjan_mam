import React from 'react';
import { useApp } from '../context/AppContext';
import SharedWasteMap from '../components/map/SharedWasteMap';
import ColorIcon from '../components/common/ColorIcon';
import {
  Route,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ setActivePage }) {
  const { bins, trucks, currentDay, dashboardStats, optimizationResult, roadGraph } = useApp();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Welcome Section */}
      <div className="bg-gradient-to-r from-[#E8F3EA] via-[#F3F8F4] to-[#E6F4EB] border border-[#C8DFCE] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#123F2E] text-[#34D399] font-bold text-xs border border-[#34D399]/30 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
              Waste Collection Dashboard
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#174B32] mt-2">
            Smart Waste Collection Operations — Day {currentDay}
          </h2>
          <p className="text-xs text-[#2C6246] mt-1 font-medium">
            Manage waste bins, allocate trucks and optimize collection routes efficiently.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActivePage('optimization')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16834A] hover:bg-[#136F3F] text-white text-xs font-bold shadow-sm transition"
          >
            <ColorIcon name="optimization" className="w-4 h-4 shrink-0" />
            Optimization Centre
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid with Vibrant Illustrated Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Bins */}
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Total Bins</span>
            <ColorIcon name="bins" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#1F2937] mt-2">{dashboardStats.totalBins}</div>
          <div className="text-[11px] text-[#64748B] mt-1 font-medium">Registered Bins</div>
        </div>

        {/* Collected Today */}
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Collected Today</span>
            <ColorIcon name="recycle" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#16834A] mt-2">{dashboardStats.collectedBinsToday}</div>
          <div className="text-[11px] text-[#16834A] mt-1 font-semibold">{dashboardStats.collectionPercentage}% Completed</div>
        </div>

        {/* Pending Bins */}
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Pending Bins</span>
            <ColorIcon name="hourglass" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#F59E0B] mt-2">{dashboardStats.pendingBinsToday}</div>
          <div className="text-[11px] text-[#64748B] mt-1 font-medium">Awaiting Dispatch</div>
        </div>

        {/* Waste Collected Today */}
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Waste Collected</span>
            <ColorIcon name="scale" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#168A83] mt-2">{dashboardStats.todayWasteCollected} <span className="text-xs font-normal text-[#64748B]">kg</span></div>
          <div className="text-[11px] text-[#64748B] mt-1 font-medium">Day {currentDay} Payload</div>
        </div>

        {/* Fleet Capacity */}
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Fleet Capacity</span>
            <ColorIcon name="truck" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#1F2937] mt-2">{dashboardStats.totalFleetCapacity} <span className="text-xs font-normal text-[#64748B]">kg</span></div>
          <div className="text-[11px] text-[#64748B] mt-1 font-medium">{dashboardStats.totalTrucks} Active Trucks</div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Fleet Utilization</span>
            <ColorIcon name="optimization" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#16834A] mt-2">{dashboardStats.fleetUtilization}%</div>
          <div className="text-[11px] text-[#64748B] mt-1 font-medium">{dashboardStats.currentFleetLoad} kg carried</div>
        </div>
      </div>

      {/* Main Operations Map & Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Interactive Operations Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
              <ColorIcon name="map" className="w-4 h-4 shrink-0" />
              Live Collection Network & Road Routes
            </h3>
            <button
              onClick={() => setActivePage('map')}
              className="text-xs font-semibold text-[#16834A] hover:underline flex items-center gap-1"
            >
              Full Screen Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <SharedWasteMap
            bins={bins}
            trucks={trucks}
            optimizationResult={optimizationResult}
            roadGraph={roadGraph}
            height="400px"
            showControls={true}
          />
        </div>

        {/* Fleet Status Summary Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
              <ColorIcon name="truck" className="w-4 h-4 shrink-0" />
              Garbage Truck Fleet
            </h3>
            <button
              onClick={() => setActivePage('trucks')}
              className="text-xs font-semibold text-[#16834A] hover:underline flex items-center gap-1"
            >
              Manage Fleet <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {trucks.map(truck => {
              const utilPercent = truck.totalCapacity > 0
                ? Math.round((truck.currentLoad / truck.totalCapacity) * 100)
                : 0;
              const isAvailable = truck.availability === 'available';

              return (
                <div
                  key={truck.id}
                  className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm space-y-3 hover:border-[#C8DFCE] transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: truck.color }}></span>
                        <h4 className="font-bold text-xs text-[#1F2937]">{truck.name}</h4>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">{truck.zoneName}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAvailable
                        ? 'bg-[#DDF5E5] text-[#16834A] border border-[#A7E8BD]'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {truck.availability.toUpperCase()}
                    </span>
                  </div>

                  {/* Load progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#64748B] font-medium mb-1">
                      <span>Payload: {truck.currentLoad} / {truck.totalCapacity} kg</span>
                      <span className="font-bold text-[#1F2937]">{utilPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F0F4F0] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, utilPercent)}%`,
                          backgroundColor: truck.color || '#16834A'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E2EAE2]">
                    <span>Remaining Room: <strong className="text-[#1F2937]">{truck.remainingCapacity} kg</strong></span>
                    <span>Depot: <strong className="text-[#16834A]">{truck.currentLocation}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
