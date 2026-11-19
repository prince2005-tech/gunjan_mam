import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ConfirmModal from './ConfirmModal';
import ColorIcon from '../common/ColorIcon';
import wasteWiseLogo from '../../assets/wastewise-logo.svg';
import {
  PlayCircle,
  RotateCcw
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const {
    currentDay,
    advanceToNextDay,
    startNewSimulation,
    bins,
    trucks,
    collectionWorkflowStage
  } = useApp();
  const [showDayConfirm, setShowDayConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const canAdvanceDay = collectionWorkflowStage === 'executed' || collectionWorkflowStage === 'unloaded';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
    { id: 'map', label: 'Interactive Map', iconName: 'map' },
    { id: 'bins', label: 'Waste Bins', iconName: 'bins', badge: bins.filter(b => b.status === 'pending').length },
    { id: 'trucks', label: 'Trucks & Zones', iconName: 'truck', badge: trucks.length },
    { id: 'optimization', label: 'Optimization Centre', iconName: 'optimization' },
    { id: 'network', label: 'Road Network (MST)', iconName: 'network' },
    { id: 'analytics', label: 'Analytics & Benchmarks', iconName: 'analytics' },
  ];

  const pendingBinsCount = bins.filter(b => b.status === 'pending').length;
  const collectedBinsCount = bins.filter(b => b.status === 'collected').length;

  return (
    <>
      <aside className="w-64 bg-[#123F2E] border-r border-[#19523D] flex flex-col justify-between shrink-0 select-none text-white">
        <div>
          {/* Logo & Header */}
          <div className="px-5 py-5 border-b border-[#1A5740] flex items-center justify-between">
            <img src={wasteWiseLogo} alt="WasteWise" className="h-8 w-auto max-w-full object-contain" />
          </div>

          {/* Current Cycle Badge - Distinct Refined Palette */}
          <div className="mx-3 my-3 p-3.5 rounded-2xl bg-[#E8F3EA] border border-[#C8DFCE] shadow-sm text-[#174B32]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-bold text-[#174B32]">
                <ColorIcon name="calendar" className="w-4 h-4 shrink-0" />
                Collection Cycle
              </span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-[#16834A] text-white text-[11px] shadow-xs">
                Day {currentDay}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#2C6246] mt-2 pt-2 border-t border-[#C8DFCE]">
              <span>Pending: <strong className="text-[#D97706] font-bold">{pendingBinsCount}</strong></span>
              <span>Collected: <strong className="text-[#16834A] font-bold">{collectedBinsCount}</strong></span>
            </div>

            <button
              onClick={() => {
                if (canAdvanceDay) setShowDayConfirm(true);
              }}
              disabled={!canAdvanceDay}
              className={`mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl transition ${
                canAdvanceDay
                  ? 'bg-[#16834A] hover:bg-[#136F3F] text-white shadow-sm cursor-pointer'
                  : 'bg-[#C8DFCE] text-[#64748B] cursor-not-allowed opacity-75'
              }`}
              title={!canAdvanceDay ? "Execute today's collection before advancing to the next day" : ""}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Start Next Day
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-2 space-y-1">
            {navItems.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#184F3B] text-[#34D399] border border-[#34D399]/40 shadow-sm'
                      : 'text-[#C2E0D3] hover:text-white hover:bg-[#154634]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ColorIcon name={item.iconName} className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-[#0E3426] text-[#34D399]' : 'bg-[#184F3B] text-[#E6F4EA]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Start New Simulation Action */}
        <div className="p-3 border-t border-[#1A5740]">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#A7D1C0] hover:text-[#F87171] hover:bg-[#184F3B] rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start New Simulation
          </button>
        </div>
      </aside>

      {/* Confirmation Dialog for Advancing to Next Day */}
      <ConfirmModal
        isOpen={showDayConfirm}
        title={`Advance to Day ${currentDay + 1}?`}
        message={`This will conclude Day ${currentDay} operations: pending bins will carry forward to Day ${currentDay + 1} with incremented pending duration and priority escalation. Collected bins will receive fresh daily waste quantities, and all trucks will return to Central Depot with empty payloads.`}
        confirmText="Initialize Next Day"
        confirmVariant="primary"
        onConfirm={() => {
          advanceToNextDay();
          setShowDayConfirm(false);
        }}
        onCancel={() => setShowDayConfirm(false)}
      />

      {/* Confirmation Dialog for Starting a New Simulation */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Start Completely New Simulation?"
        message="This action resets the simulation back to initial Day 1: default 20 bins, 3 standard trucks with full capacities, and clears all previous collection history. Are you sure you wish to start fresh?"
        confirmText="Reset to Day 1 Defaults"
        confirmVariant="danger"
        onConfirm={() => {
          startNewSimulation();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}
