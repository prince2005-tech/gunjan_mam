import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SERVICE_ZONE_PRESETS } from '../../data/initialTrucks';
import { X, Truck, Scale, MapPin } from 'lucide-react';

export default function TruckModal({ isOpen, onClose, truckToEdit = null }) {
  const { addTruck, updateTruck } = useApp();

  const [name, setName] = useState('');
  const [totalCapacity, setTotalCapacity] = useState('1800');
  const [zonePreset, setZonePreset] = useState('custom');
  const [zoneMinKm, setZoneMinKm] = useState('0');
  const [zoneMaxKm, setZoneMaxKm] = useState('3.0');
  const [zoneName, setZoneName] = useState('');

  useEffect(() => {
    if (truckToEdit) {
      setName(truckToEdit.name || '');
      setTotalCapacity(String(truckToEdit.totalCapacity));
      setZoneMinKm(String(truckToEdit.zoneMinKm));
      setZoneMaxKm(String(truckToEdit.zoneMaxKm));
      setZoneName(truckToEdit.zoneName || '');
      setZonePreset('custom');
    } else {
      setName('');
      setTotalCapacity('1800');
      setZoneMinKm('0');
      setZoneMaxKm('3.0');
      setZoneName('Zone 1 (0 – 3.0 km)');
      setZonePreset(SERVICE_ZONE_PRESETS[0]?.label || 'custom');
    }
  }, [truckToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    setZonePreset(preset.label);
    setZoneMinKm(String(preset.min));
    setZoneMaxKm(String(preset.max));
    setZoneName(preset.label);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cap = parseFloat(totalCapacity);
    const min = parseFloat(zoneMinKm);
    const max = parseFloat(zoneMaxKm);

    if (isNaN(cap) || cap <= 0) {
      alert('Please enter a valid carrying capacity in kg.');
      return;
    }

    if (isNaN(min) || isNaN(max) || min < 0 || max <= min) {
      alert('Invalid zone distance range. Minimum distance must be >= 0 and maximum must be strictly greater than minimum.');
      return;
    }

    const calculatedZoneName = zoneName || `Zone (${min} – ${max} km)`;

    if (truckToEdit) {
      updateTruck(truckToEdit.id, {
        name,
        totalCapacity: cap,
        zoneMinKm: min,
        zoneMaxKm: max,
        zoneName: calculatedZoneName
      });
    } else {
      addTruck({
        name,
        totalCapacity: cap,
        zoneMinKm: min,
        zoneMaxKm: max,
        zoneName: calculatedZoneName
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E2EAE2] rounded-2xl shadow-xl max-w-md w-full p-6 text-[#172B20]">
        <div className="flex items-center justify-between border-b border-[#E2EAE2] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#172B20]">
              {truckToEdit ? `Edit Truck (${truckToEdit.id})` : 'Register New Garbage Truck'}
            </h3>
            <p className="text-xs text-[#526658] mt-0.5">
              Configure vehicle capacity and assigned service zone distance range.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#647568] hover:text-[#172B20] p-1 rounded-lg hover:bg-[#F5F8F5] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Truck Identifier / Name
            </label>
            <div className="relative">
              <Truck className="w-4 h-4 text-[#526658] absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Truck 1B (Auxiliary Inner)"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Payload Carrying Capacity (kg)
            </label>
            <div className="relative">
              <Scale className="w-4 h-4 text-[#526658] absolute left-3 top-2.5" />
              <input
                type="number"
                step="50"
                min="100"
                max="8000"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1.5">
              Service Zone Selection (Multiple trucks allowed per zone)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {SERVICE_ZONE_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition ${
                    zonePreset === p.label
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                      : 'bg-[#F8FAF8] text-[#526658] border-[#E2EAE2] hover:bg-[#F0F4F0]'
                  }`}
                >
                  <div>{`Zone ${i + 1}`}</div>
                  <div className="text-[10px] text-[#526658] font-normal">{p.min} - {p.max} km</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#526658] font-medium mb-1">Min Road Dist (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={zoneMinKm}
                  onChange={(e) => {
                    setZoneMinKm(e.target.value);
                    setZonePreset('custom');
                  }}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#526658] font-medium mb-1">Max Road Dist (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={zoneMaxKm}
                  onChange={(e) => {
                    setZoneMaxKm(e.target.value);
                    setZonePreset('custom');
                  }}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2EAE2] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#526658] bg-[#F5F8F5] hover:bg-[#E2EAE2] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#16834A] hover:bg-[#136F3F] rounded-xl shadow-sm transition"
            >
              {truckToEdit ? 'Save Changes' : 'Register Truck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
