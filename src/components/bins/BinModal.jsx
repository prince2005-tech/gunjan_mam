import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, MapPin, Scale, AlertCircle } from 'lucide-react';

export default function BinModal({ isOpen, onClose, binToEdit = null, prefilledLocation = null }) {
  const { roadGraph, addBin, updateBin } = useApp();

  const [wasteKg, setWasteKg] = useState('250');
  const [priority, setPriority] = useState('Medium');
  const [selectedNodeId, setSelectedNodeId] = useState('1');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [locationMode, setLocationMode] = useState('node'); // 'node' or 'coords'

  useEffect(() => {
    if (binToEdit) {
      setWasteKg(String(binToEdit.wasteKg));
      setPriority(binToEdit.priority || 'Medium');
      setSelectedNodeId(binToEdit.nodeId || '1');
      setCustomLat(String(binToEdit.lat));
      setCustomLng(String(binToEdit.lng));
      setLocationMode('node');
    } else if (prefilledLocation) {
      setWasteKg('250');
      setPriority('Medium');
      setCustomLat(String(prefilledLocation.lat));
      setCustomLng(String(prefilledLocation.lng));
      setLocationMode('coords');
    } else {
      setWasteKg('250');
      setPriority('Medium');
      setSelectedNodeId('1');
      setLocationMode('node');
      const node = roadGraph.nodes['1'];
      if (node) {
        setCustomLat(String(node.lat));
        setCustomLng(String(node.lng));
      }
    }
  }, [binToEdit, prefilledLocation, roadGraph.nodes, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const kg = Number(wasteKg);
    if (!wasteKg || isNaN(kg) || !Number.isInteger(kg) || kg < 1 || kg > 1200) {
      alert('Please enter a valid whole-number waste quantity between 1 and 1200 kg.');
      return;
    }

    let lat = 0;
    let lng = 0;
    let locationName = '';

    if (locationMode === 'node') {
      const node = roadGraph.nodes[selectedNodeId];
      if (node) {
        lat = node.lat;
        lng = node.lng;
        locationName = node.name;
      }
    } else {
      lat = parseFloat(customLat);
      lng = parseFloat(customLng);
      if (isNaN(lat) || isNaN(lng)) {
        alert('Please enter valid coordinates.');
        return;
      }
      locationName = `Custom Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }

    if (binToEdit) {
      updateBin(binToEdit.id, {
        wasteKg: kg,
        priority,
        lat,
        lng,
        locationName
      });
    } else {
      addBin({
        lat,
        lng,
        wasteKg: kg,
        priority,
        locationName
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E2EAE2] rounded-2xl shadow-xl max-w-lg w-full p-6 text-[#172B20]">
        <div className="flex items-center justify-between border-b border-[#E2EAE2] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#172B20]">
              {binToEdit ? `Edit Waste Bin (${binToEdit.id})` : 'Register New Waste Bin'}
            </h3>
            <p className="text-xs text-[#526658] mt-0.5">
              Enter waste load, priority category, and road network location.
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
              Current Waste Load (kg)
            </label>
            <div className="relative">
              <Scale className="w-4 h-4 text-[#526658] absolute left-3 top-2.5" />
              <input
                type="number"
                step="1"
                min="1"
                max="1200"
                value={wasteKg}
                onChange={(e) => setWasteKg(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1.5">
              Priority Classification
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Low', score: 'Value: 1', color: 'border-gray-200 text-gray-700 hover:bg-gray-50', active: 'bg-gray-100 border-gray-400 text-gray-900 font-bold' },
                { label: 'Medium', score: 'Value: 2', color: 'border-amber-200 text-amber-800 hover:bg-amber-50', active: 'bg-amber-100 border-amber-400 text-amber-900 font-bold' },
                { label: 'High', score: 'Value: 3', color: 'border-red-200 text-red-800 hover:bg-red-50', active: 'bg-red-100 border-red-400 text-red-900 font-bold' }
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPriority(p.label)}
                  className={`p-2.5 rounded-xl border text-center transition text-xs ${
                    priority === p.label ? p.active : p.color
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-[10px] opacity-75">{p.score}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1.5">
              Location on Road Network
            </label>

            <div className="flex gap-2 mb-2 text-xs">
              <button
                type="button"
                onClick={() => setLocationMode('node')}
                className={`flex-1 py-1.5 rounded-lg border font-semibold transition ${
                  locationMode === 'node'
                    ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                    : 'bg-[#F8FAF8] text-[#526658] border-[#E2EAE2]'
                }`}
              >
                Road Junction Node
              </button>
              <button
                type="button"
                onClick={() => setLocationMode('coords')}
                className={`flex-1 py-1.5 rounded-lg border font-semibold transition ${
                  locationMode === 'coords'
                    ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                    : 'bg-[#F8FAF8] text-[#526658] border-[#E2EAE2]'
                }`}
              >
                GPS Coordinates
              </button>
            </div>

            {locationMode === 'node' ? (
              <select
                value={selectedNodeId}
                onChange={(e) => setSelectedNodeId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
              >
                {Object.entries(roadGraph.nodes).map(([id, n]) => (
                  <option key={id} value={id}>
                    Node {id}: {n.name} ({n.lat.toFixed(4)}, {n.lng.toFixed(4)})
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#526658]">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#526658]">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
                  />
                </div>
              </div>
            )}
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
              {binToEdit ? 'Save Changes' : 'Register Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
