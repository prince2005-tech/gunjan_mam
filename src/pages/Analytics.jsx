import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { runComprehensiveBenchmarks } from '../services/benchmarkService';
import ColorIcon from '../components/common/ColorIcon';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  Cpu,
  Layers,
  Calendar
} from 'lucide-react';

export default function Analytics() {
  const { bins, trucks, collectionHistory, roadGraph, dashboardStats, currentDay, algorithmTimings, mstTimings } = useApp();

  // Run benchmarks deterministically on load
  const benchmarks = useMemo(() => runComprehensiveBenchmarks(roadGraph, bins), [roadGraph, bins]);

  // Aggregate daily history for charts
  const dailyHistoryData = useMemo(() => {
    const daysMap = new Map();
    collectionHistory.forEach(rec => {
      const d = rec.dayNumber || 1;
      if (!daysMap.has(d)) {
        daysMap.set(d, { day: `Day ${d}`, wasteKg: 0, binsCount: 0, tripsCount: 0 });
      }
      const entry = daysMap.get(d);
      entry.wasteKg += rec.totalWasteCollectedKg;
      entry.binsCount += rec.collectedBinsCount;
      entry.tripsCount += 1;
    });

    return Array.from(daysMap.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [collectionHistory]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8F3EA] text-[#16834A] font-bold border border-[#C8DFCE]">
            PERFORMANCE & HISTORY
          </span>
          <span className="text-xs text-[#64748B] font-semibold">Empirical Measurements & Collection Analytics</span>
        </div>
        <h2 className="text-xl font-bold text-[#1F2937] mt-2 flex items-center gap-2">
          <ColorIcon name="analytics" className="w-5 h-5 shrink-0" />
          Collection Analytics & Algorithm Benchmarking Suite
        </h2>
        <p className="text-xs text-[#64748B] mt-1">
          Empirical CPU runtime measurements for Dijkstra, 0/1 Knapsack, Held-Karp TSP, Prim, and Kruskal alongside persistent multi-day collection records.
        </p>
      </div>

      {/* Primary KPI Strips with Colourful Illustrated Icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Cumulative Waste Collected</span>
            <ColorIcon name="scale" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#1F2937] mt-1">
            {dashboardStats.totalHistoricalWaste} <span className="text-xs font-normal text-[#64748B]">kg</span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Across all completed cycles</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Collection Rate (Today)</span>
            <ColorIcon name="recycle" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#16834A] mt-1">
            {dashboardStats.collectionPercentage}%
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            {dashboardStats.collectedBinsToday} of {dashboardStats.totalBins} bins
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Total Collection Trips</span>
            <ColorIcon name="truck" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#1F2937] mt-1">
            {collectionHistory.length}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Fleet routes completed</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-4 shadow-sm hover:border-[#C8DFCE] transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold">
            <span>Road Network Topology</span>
            <ColorIcon name="network" className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#1F2937] mt-1">
            {Object.keys(roadGraph.nodes).length} <span className="text-xs font-normal text-[#64748B]">nodes /</span> {roadGraph.edges.length} <span className="text-xs font-normal text-[#64748B]">edges</span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Academic road graph</div>
        </div>
      </div>

      {/* SECTION 1: Algorithm Empirical Scaling Benchmarks */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-5 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#172B20] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#15803D]" />
            Empirical Algorithm Scaling Benchmarks
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: 0/1 Knapsack Scaling */}
          <div className="bg-[#F8FAF8] p-4 rounded-2xl border border-[#E2EAE2] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#172B20]">0/1 Knapsack DP Execution Time vs Input Size (N)</span>
              <span className="font-mono text-[10px] text-[#15803D] bg-green-50 px-2 py-0.5 rounded-full border border-green-200 font-bold">
                O(N &times; W)
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarks.knapsackScaling} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE2" />
                  <XAxis dataKey="label" stroke="#647568" fontSize={11} />
                  <YAxis stroke="#647568" fontSize={11} unit=" ms" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2EAE2', borderRadius: '12px', color: '#172B20' }}
                    formatter={(val) => [`${val} ms`, 'Avg Runtime']}
                  />
                  <Line type="monotone" dataKey="avgTimeMs" stroke="#15803D" strokeWidth={2.5} dot={{ r: 4, fill: '#15803D' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Held-Karp TSP Scaling */}
          <div className="bg-[#F8FAF8] p-4 rounded-2xl border border-[#E2EAE2] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#172B20]">Held-Karp TSP DP Execution Time vs Bins Count (K)</span>
              <span className="font-mono text-[10px] text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 font-bold">
                O(n&sup2; 2&#x207F;)
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarks.tspScaling} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE2" />
                  <XAxis dataKey="label" stroke="#647568" fontSize={11} />
                  <YAxis stroke="#647568" fontSize={11} unit=" ms" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2EAE2', borderRadius: '12px', color: '#172B20' }}
                    formatter={(val) => [`${val} ms`, 'Avg Runtime']}
                  />
                  <Line type="monotone" dataKey="avgTimeMs" stroke="#0284C7" strokeWidth={2.5} dot={{ r: 4, fill: '#0284C7' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Algorithm Benchmarks Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] text-[#526658] font-bold text-[10px] uppercase border-y border-[#E2EAE2]">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Role in WasteWise</th>
                <th className="py-2.5 px-3">Theoretical Complexity</th>
                <th className="py-2.5 px-3">Average Execution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAE2] text-[#172B20]">
              <tr className="hover:bg-[#F9FAF9]">
                <td className="py-2.5 px-3 font-bold text-[#15803D]">Dijkstra's Shortest Path</td>
                <td className="py-2.5 px-3 text-[#526658]">Depot-to-bin & stop-to-stop road distance</td>
                <td className="py-2.5 px-3 font-mono font-semibold">O(V&sup2; + E)</td>
                <td className="py-2.5 px-3 font-bold text-[#172B20]">
                  {algorithmTimings?.dijkstraTimeMs !== undefined
                    ? `${algorithmTimings.dijkstraTimeMs} ms`
                    : 'Pending execution'}
                </td>
              </tr>
              <tr className="hover:bg-[#F9FAF9]">
                <td className="py-2.5 px-3 font-bold text-[#0284C7]">0/1 Knapsack (Lexicographic DP)</td>
                <td className="py-2.5 px-3 text-[#526658]">Capacity-constrained bin allocation</td>
                <td className="py-2.5 px-3 font-mono font-semibold">O(N &times; W)</td>
                <td className="py-2.5 px-3 font-bold text-[#172B20]">
                  {algorithmTimings?.knapsackTimeMs !== undefined
                    ? `${algorithmTimings.knapsackTimeMs} ms`
                    : 'Pending execution'}
                </td>
              </tr>
              <tr className="hover:bg-[#F9FAF9]">
                <td className="py-2.5 px-3 font-bold text-[#7C3AED]">TSP Held-Karp DP</td>
                <td className="py-2.5 px-3 text-[#526658]">Optimal stop ordering starting & ending at Depot</td>
                <td className="py-2.5 px-3 font-mono font-semibold">O(n&sup2; 2&#x207F;)</td>
                <td className="py-2.5 px-3 font-bold text-[#172B20]">
                  {algorithmTimings?.tspTimeMs !== undefined
                    ? `${algorithmTimings.tspTimeMs} ms`
                    : 'Pending execution'}
                </td>
              </tr>
              <tr className="hover:bg-[#F9FAF9]">
                <td className="py-2.5 px-3 font-bold text-[#D97706]">Prim's Algorithm (MST)</td>
                <td className="py-2.5 px-3 text-[#526658]">Road infrastructure minimal connectivity</td>
                <td className="py-2.5 px-3 font-mono font-semibold">O(E + V log V)</td>
                <td className="py-2.5 px-3 font-bold text-[#172B20]">
                  {mstTimings?.primTimeMs !== undefined
                    ? `${mstTimings.primTimeMs} ms`
                    : 'Pending analysis'}
                </td>
              </tr>
              <tr className="hover:bg-[#F9FAF9]">
                <td className="py-2.5 px-3 font-bold text-[#EC4899]">Kruskal's Algorithm (MST)</td>
                <td className="py-2.5 px-3 text-[#526658]">Road infrastructure minimal connectivity</td>
                <td className="py-2.5 px-3 font-mono font-semibold">O(E log E)</td>
                <td className="py-2.5 px-3 font-bold text-[#172B20]">
                  {mstTimings?.kruskalTimeMs !== undefined
                    ? `${mstTimings.kruskalTimeMs} ms`
                    : 'Pending analysis'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Daily Collection History Records */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#172B20] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#15803D]" />
            Collection History & Operational Log
          </h3>
          <p className="text-xs text-[#526658] mt-0.5">
            Stored history of executed collections across multi-day simulation cycles.
          </p>
        </div>

        {collectionHistory.length === 0 ? (
          <div className="text-center py-8 text-[#526658] text-xs bg-[#F8FAF8] rounded-2xl border border-[#E2EAE2]">
            No collection cycles have been executed yet. Click "Execute Collection" in the Optimization Centre to log collection data for Day {currentDay}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF8] text-[#526658] uppercase text-[10px] font-bold border-y border-[#E2EAE2]">
                <tr>
                  <th className="py-2.5 px-3">Cycle Date</th>
                  <th className="py-2.5 px-3">Truck</th>
                  <th className="py-2.5 px-3">Service Zone</th>
                  <th className="py-2.5 px-3">Bins Collected</th>
                  <th className="py-2.5 px-3">Waste (kg)</th>
                  <th className="py-2.5 px-3">Route Distance</th>
                  <th className="py-2.5 px-3">Routing Engine</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EAE2] text-[#172B20]">
                {collectionHistory.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-[#F9FAF9]">
                    <td className="py-2.5 px-3 font-bold">{rec.collectionDate}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#172B20]">{rec.truckName}</td>
                    <td className="py-2.5 px-3 text-[#526658]">{rec.zoneName || '—'}</td>
                    <td className="py-2.5 px-3 text-[#15803D] font-bold">
                      {rec.collectedBinsCount} bins ({rec.collectedBinIds.join(', ')})
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#0284C7]">{rec.totalWasteCollectedKg} kg</td>
                    <td className="py-2.5 px-3 font-semibold">{rec.routeDistanceKm} km</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.isRealRoad ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.routingService || 'Simulated Road Graph'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
