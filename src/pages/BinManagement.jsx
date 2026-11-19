import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import BinModal from '../components/bins/BinModal';
import ConfirmModal from '../components/layout/ConfirmModal';
import ColorIcon from '../components/common/ColorIcon';
import { getZoneForDistance, getBinRoadDistanceToDepot } from '../services/binService';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2
} from 'lucide-react';

export default function BinManagement({ prefilledLocation = null, onClearPrefilledLocation }) {
  const { bins, deleteBin, roadGraph, trucks } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [binToDelete, setBinToDelete] = useState(null);

  // If map prefilled a location, open modal automatically
  React.useEffect(() => {
    if (prefilledLocation) {
      setEditingBin(null);
      setIsModalOpen(true);
    }
  }, [prefilledLocation]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBin(null);
    if (onClearPrefilledLocation) onClearPrefilledLocation();
  };

  const handleEdit = (bin) => {
    setEditingBin(bin);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (binToDelete) {
      deleteBin(binToDelete.id);
      setBinToDelete(null);
    }
  };

  const filteredBins = useMemo(() => {
    return bins.filter(bin => {
      const matchSearch =
        bin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bin.locationName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || bin.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || bin.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [bins, searchTerm, statusFilter, priorityFilter]);

  const totalWasteKg = bins.reduce((s, b) => s + b.wasteKg, 0);
  const pendingCount = bins.filter(b => b.status === 'pending').length;
  const collectedCount = bins.filter(b => b.status === 'collected').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <ColorIcon name="bins" className="w-5 h-5 shrink-0" />
            Waste Bin Registry & Management
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Registered municipal waste receptacles across road network junctions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBin(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#16834A] hover:bg-[#136F3F] text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Waste Bin
        </button>
      </div>

      {/* Metric Summary Strips with Colourful Illustrated Icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-[#C8DFCE] transition">
          <div>
            <div className="text-xs text-[#64748B] font-semibold">Total Receptacles</div>
            <div className="text-2xl font-bold text-[#1F2937] mt-1">{bins.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center">
            <ColorIcon name="bins" className="w-6 h-6 shrink-0" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-[#C8DFCE] transition">
          <div>
            <div className="text-xs text-[#64748B] font-semibold">Pending Collection</div>
            <div className="text-2xl font-bold text-[#F59E0B] mt-1">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50/60 flex items-center justify-center">
            <ColorIcon name="hourglass" className="w-6 h-6 shrink-0" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-[#C8DFCE] transition">
          <div>
            <div className="text-xs text-[#64748B] font-semibold">Collected Today</div>
            <div className="text-2xl font-bold text-[#16834A] mt-1">{collectedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50/60 flex items-center justify-center">
            <ColorIcon name="recycle" className="w-6 h-6 shrink-0" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-[#C8DFCE] transition">
          <div>
            <div className="text-xs text-[#64748B] font-semibold">Total Waste Present</div>
            <div className="text-2xl font-bold text-[#168A83] mt-1">{totalWasteKg} <span className="text-xs font-normal text-[#64748B]">kg</span></div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50/60 flex items-center justify-center">
            <ColorIcon name="scale" className="w-6 h-6 shrink-0" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#526658] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Bin ID or location name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] focus:ring-1 focus:ring-[#15803D] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#526658] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="collected">Collected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#526658] font-semibold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#E2EAE2] rounded-xl text-xs text-[#172B20] font-medium focus:ring-1 focus:ring-[#15803D] focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bin Registry Table */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] text-[#526658] uppercase text-[10px] font-bold border-b border-[#E2EAE2]">
              <tr>
                <th className="py-3 px-4">Bin ID</th>
                <th className="py-3 px-4">Location & Junction</th>
                <th className="py-3 px-4">Depot Distance</th>
                <th className="py-3 px-4">Service Zone</th>
                <th className="py-3 px-4">Current Waste</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Pending Days</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAE2] text-[#172B20]">
              {filteredBins.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-[#526658]">
                    No waste bins match your search filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBins.map(bin => {
                  const dist = getBinRoadDistanceToDepot(roadGraph, bin.nodeId);
                  const zoneInfo = getZoneForDistance(trucks, dist);

                  return (
                    <tr key={bin.id} className="hover:bg-[#F9FAF9] transition">
                      <td className="py-3 px-4 font-bold font-mono">{bin.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{bin.locationName}</div>
                        <div className="text-[11px] text-[#526658]">
                          Node {bin.nodeId} ({bin.lat.toFixed(4)}, {bin.lng.toFixed(4)})
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#172B20]">
                        {dist !== null ? `${dist.toFixed(2)} km` : 'Unreachable'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-[#526658] font-medium">
                          {zoneInfo?.zoneName || 'No zone'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">{bin.wasteKg} kg</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          bin.priority === 'High'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : bin.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {bin.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {bin.pendingDuration > 0 ? (
                          <span className="text-amber-700">{bin.pendingDuration} d</span>
                        ) : (
                          <span className="text-[#526658]">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          bin.status === 'collected'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {bin.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(bin)}
                            className="p-1.5 rounded-lg text-[#526658] hover:text-[#172B20] hover:bg-[#F5F8F5] transition"
                            title="Edit Bin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setBinToDelete(bin)}
                            className="p-1.5 rounded-lg text-[#526658] hover:text-[#DC2626] hover:bg-red-50 transition"
                            title="Delete Bin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Bin Modal */}
      <BinModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        binToEdit={editingBin}
        prefilledLocation={prefilledLocation}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(binToDelete)}
        title={`Delete Waste Bin ${binToDelete?.id}?`}
        message={`Are you sure you want to permanently delete Bin ${binToDelete?.id} at ${binToDelete?.locationName}?`}
        confirmText="Delete Bin"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBinToDelete(null)}
      />
    </div>
  );
}
