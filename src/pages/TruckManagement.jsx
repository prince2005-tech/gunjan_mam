import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TruckModal from '../components/trucks/TruckModal';
import ConfirmModal from '../components/layout/ConfirmModal';
import ColorIcon from '../components/common/ColorIcon';
import { validateTruckZones } from '../services/truckService';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw
} from 'lucide-react';

export default function TruckManagement({ setActivePage }) {
  const { trucks, deleteTruck, unloadTruck } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [truckToDelete, setTruckToDelete] = useState(null);

  const zoneWarnings = validateTruckZones(trucks);

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (truckToDelete) {
      deleteTruck(truckToDelete.id);
      setTruckToDelete(null);
    }
  };

  const totalFleetCapacity = trucks.reduce((s, t) => s + t.totalCapacity, 0);
  const currentFleetLoad = trucks.reduce((s, t) => s + t.currentLoad, 0);
  const fleetRemaining = Math.max(0, totalFleetCapacity - currentFleetLoad);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <ColorIcon name="truck" className="w-5 h-5 shrink-0" />
            Garbage Truck Fleet & Service Zone Management
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage municipal collection vehicles, carrying capacities, and multi-truck service zones.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTruck(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#16834A] hover:bg-[#136F3F] text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Register New Truck
        </button>
      </div>

      {/* Configuration Warnings */}
      {zoneWarnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ColorIcon name="warning" className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">Fleet Configuration Notice</div>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-800">
              {zoneWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Fleet Overview KPI Cards with Colourful Illustrated Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition flex items-center justify-between">
          <div>
            <div className="text-xs text-[#64748B] font-semibold">Total Fleet Capacity</div>
            <div className="text-2xl font-bold text-[#1F2937] mt-1">{totalFleetCapacity} <span className="text-xs font-normal text-[#64748B]">kg</span></div>
            <div className="text-[11px] text-[#64748B] mt-1">{trucks.length} Active Vehicles</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
            <ColorIcon name="truck" className="w-7 h-7 shrink-0" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition flex items-center justify-between">
          <div>
            <div className="text-xs text-[#64748B] font-semibold">Current Fleet Load</div>
            <div className="text-2xl font-bold text-[#168A83] mt-1">{currentFleetLoad} <span className="text-xs font-normal text-[#64748B]">kg</span></div>
            <div className="text-[11px] text-[#64748B] mt-1">Carried in Current Trip</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50/60 flex items-center justify-center">
            <ColorIcon name="scale" className="w-7 h-7 shrink-0" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition flex items-center justify-between">
          <div>
            <div className="text-xs text-[#64748B] font-semibold">Remaining Carrying Room</div>
            <div className="text-2xl font-bold text-[#16834A] mt-1">{fleetRemaining} <span className="text-xs font-normal text-[#64748B]">kg</span></div>
            <div className="text-[11px] text-[#16834A] font-semibold mt-1">Available Payload Capacity</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50/60 flex items-center justify-center">
            <ColorIcon name="optimization" className="w-7 h-7 shrink-0" />
          </div>
        </div>
      </div>

      {/* Truck Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trucks.map(truck => {
          const util = truck.totalCapacity > 0
            ? Math.round((truck.currentLoad / truck.totalCapacity) * 100)
            : 0;
          const isCompleted = truck.availability === 'completed';

          return (
            <div
              key={truck.id}
              className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: truck.color }}></span>
                    <div>
                      <h3 className="font-bold text-sm text-[#172B20]">{truck.name}</h3>
                      <div className="text-xs font-mono text-[#526658]">{truck.id}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    truck.availability === 'available'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {truck.availability.toUpperCase()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E2EAE2] text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[#526658]">
                    <span>Service Zone:</span>
                    <strong className="text-[#172B20]">{truck.zoneName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#526658]">
                    <span>Road Distance Band:</span>
                    <strong className="text-[#172B20]">{truck.zoneMinKm} – {truck.zoneMaxKm} km</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#526658]">
                    <span>Current Depot Location:</span>
                    <strong className="text-[#15803D]">{truck.currentLocation}</strong>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-[#526658] font-semibold mb-1">
                    <span>Load: {truck.currentLoad} / {truck.totalCapacity} kg</span>
                    <span className="text-[#172B20]">{util}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F0F4F0] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, util)}%`,
                        backgroundColor: truck.color || '#15803D'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E2EAE2] flex items-center justify-between gap-2">
                {isCompleted ? (
                  <button
                    onClick={() => unloadTruck(truck.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-semibold border border-sky-200 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Unload at Depot
                  </button>
                ) : (
                  <span className="text-[11px] text-[#526658]">Ready for dispatch</span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(truck)}
                    className="p-1.5 rounded-lg text-[#526658] hover:text-[#172B20] hover:bg-[#F5F8F5] transition"
                    title="Edit Truck"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTruckToDelete(truck)}
                    className="p-1.5 rounded-lg text-[#526658] hover:text-[#DC2626] hover:bg-red-50 transition"
                    title="Delete Truck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Truck Edit/Add Modal */}
      <TruckModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTruck(null);
        }}
        truckToEdit={editingTruck}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(truckToDelete)}
        title={`Remove ${truckToDelete?.name}?`}
        message={`Are you sure you want to remove ${truckToDelete?.name} (${truckToDelete?.id}) from the fleet? Any scheduled assignments will be unassigned.`}
        confirmText="Remove Truck"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTruckToDelete(null)}
      />
    </div>
  );
}
