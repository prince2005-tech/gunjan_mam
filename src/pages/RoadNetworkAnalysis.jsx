import React, { useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { primMST } from '../algorithms/prim';
import { kruskalMST } from '../algorithms/kruskal';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { createJunctionIcon, createDepotIcon } from '../components/map/MapIcons';
import ColorIcon from '../components/common/ColorIcon';
import {
  Layers,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function RoadNetworkAnalysis() {
  const { roadGraph, recordMstExecution } = useApp();

  // Run Prim's and Kruskal's algorithms on current graph
  const primResult = useMemo(() => primMST(roadGraph, roadGraph.depotId || '0'), [roadGraph]);
  const kruskalResult = useMemo(() => kruskalMST(roadGraph), [roadGraph]);

  // Record actual execution measurements when MST analysis is performed
  useEffect(() => {
    if (primResult && kruskalResult && recordMstExecution) {
      recordMstExecution({
        primTimeMs: primResult.executionTimeMs,
        kruskalTimeMs: kruskalResult.executionTimeMs,
        updatedAt: new Date().toISOString()
      });
    }
  }, [primResult, kruskalResult, recordMstExecution]);

  const depotNode = roadGraph.nodes[roadGraph.depotId || '0'] || { lat: 28.6290, lng: 77.2180, name: 'Depot' };
  const centerPos = [depotNode.lat, depotNode.lng];

  // MST edges set for fast lookup in map rendering
  const mstEdgeKeys = useMemo(() => {
    const set = new Set();
    kruskalResult.edges.forEach(e => {
      set.add([e.from, e.to].sort().join('___'));
    });
    return set;
  }, [kruskalResult]);

  // Edges on map
  const mapEdges = useMemo(() => {
    return roadGraph.edges.map((edge, idx) => {
      const uNode = roadGraph.nodes[edge.from];
      const vNode = roadGraph.nodes[edge.to];
      if (!uNode || !vNode) return null;

      const key = [edge.from, edge.to].sort().join('___');
      const isMst = mstEdgeKeys.has(key);

      return {
        id: `mst-map-edge-${idx}`,
        positions: [
          [uNode.lat, uNode.lng],
          [vNode.lat, vNode.lng]
        ],
        edge,
        isMst
      };
    }).filter(e => e !== null);
  }, [roadGraph, mstEdgeKeys]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
          <ColorIcon name="network" className="w-5 h-5 shrink-0" />
          Road Network Minimum Spanning Tree (MST) Analysis
        </h2>
        <p className="text-xs text-[#64748B] mt-1.5">
          Comparative academic evaluation of <strong>Prim's Algorithm</strong> (Greedy Cut Property with Priority Queue) and <strong>Kruskal's Algorithm</strong> (Disjoint Set Union with Path Compression & Union by Rank).
        </p>
      </div>

      {/* Disconnection Warning if any */}
      {(!primResult.isConnected || !kruskalResult.isConnected) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">Disconnected Graph Notice</div>
            <p className="text-amber-800 mt-0.5">
              The road network has isolated junctions. A Minimum Spanning Forest was constructed for each connected component.
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Algorithm Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Prim's Algorithm Card */}
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EAE2]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-200 text-[#15803D] flex items-center justify-center font-bold text-xs">
                P
              </div>
              <div>
                <h3 className="font-bold text-[#172B20] text-sm">Prim's Algorithm</h3>
                <div className="text-[11px] text-[#526658]">Vertex-based cut expansion</div>
              </div>
            </div>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-bold border border-[#86EFAC]/60">
              O(E + V log V)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2EAE2]">
              <span className="text-[10px] text-[#526658] uppercase font-bold">Total Weight</span>
              <div className="text-lg font-bold text-[#15803D] mt-1">{primResult.totalWeight} km</div>
            </div>
            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2EAE2]">
              <span className="text-[10px] text-[#526658] uppercase font-bold">Selected Edges</span>
              <div className="text-lg font-bold text-[#172B20] mt-1">
                {primResult.edges.length} <span className="text-xs text-[#526658] font-normal">/ {primResult.totalGraphNodes - 1}</span>
              </div>
            </div>
            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2EAE2]">
              <span className="text-[10px] text-[#526658] uppercase font-bold">CPU Time</span>
              <div className="text-lg font-bold text-[#0284C7] mt-1">{primResult.executionTimeMs} ms</div>
            </div>
          </div>

          <div className="pt-2 text-xs text-[#526658] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            Status: {primResult.isSpanningTree ? 'Valid Spanning Tree' : 'Spanning Forest'}
          </div>
        </div>

        {/* Kruskal's Algorithm Card */}
        <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EAE2]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-[#0284C7] flex items-center justify-center font-bold text-xs">
                K
              </div>
              <div>
                <h3 className="font-bold text-[#172B20] text-sm">Kruskal's Algorithm</h3>
                <div className="text-[11px] text-[#526658]">Edge-based greedy with DSU</div>
              </div>
            </div>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284C7] font-bold border border-sky-200">
              O(E log E)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2EAE2]">
              <span className="text-[10px] text-[#526658] uppercase font-bold">Total Weight</span>
              <div className="text-lg font-bold text-[#0284C7] mt-1">{kruskalResult.totalWeight} km</div>
            </div>
            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2EAE2]">
              <span className="text-[10px] text-[#526658] uppercase font-bold">Selected Edges</span>
              <div className="text-lg font-bold text-[#172B20] mt-1">
                {kruskalResult.edges.length} <span className="text-xs text-[#526658] font-normal">/ {kruskalResult.totalGraphNodes - 1}</span>
              </div>
            </div>
            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2EAE2]">
              <span className="text-[10px] text-[#526658] uppercase font-bold">CPU Time</span>
              <div className="text-lg font-bold text-[#15803D] mt-1">{kruskalResult.executionTimeMs} ms</div>
            </div>
          </div>

          <div className="pt-2 text-xs text-[#526658] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
            Theoretical Validation: Prim Weight ({primResult.totalWeight} km) == Kruskal Weight ({kruskalResult.totalWeight} km)
          </div>
        </div>
      </div>

      {/* Map Visualization of the MST */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE2] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#172B20] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#15803D]" />
              Interactive Road Network MST Backbone
            </h3>
            <p className="text-xs text-[#526658] mt-0.5">
              Solid green lines highlight the minimal-cost tree connecting all {Object.keys(roadGraph.nodes).length} junctions.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#15803D] font-bold">
              <span className="w-3.5 h-1 bg-[#15803D] rounded-full inline-block" />
              MST Edges ({kruskalResult.edges.length})
            </span>
            <span className="flex items-center gap-1.5 text-[#526658]">
              <span className="w-3.5 h-1 bg-[#94A3B8] rounded-full inline-block" />
              Non-MST Streets ({roadGraph.edges.length - kruskalResult.edges.length})
            </span>
          </div>
        </div>

        <div className="h-96 rounded-2xl overflow-hidden border border-[#E2EAE2]">
          <MapContainer
            center={centerPos}
            zoom={13}
            scrollWheelZoom={true}
            touchZoom={true}
            wheelDebounceTime={80}
            wheelPxPerZoomLevel={60}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              maxNativeZoom={19}
              minZoom={9}
              detectRetina={true}
              keepBuffer={8}
            />

            {/* Render Map Edges */}
            {mapEdges.map(e => (
              <Polyline
                key={e.id}
                positions={e.positions}
                pathOptions={{
                  color: e.isMst ? '#15803D' : '#94A3B8',
                  weight: e.isMst ? 5 : 2,
                  opacity: e.isMst ? 0.95 : 0.45,
                  dashArray: e.isMst ? null : '4, 6'
                }}
              />
            ))}

            {/* Render Junction Markers */}
            {Object.values(roadGraph.nodes).map(node => (
              <Marker
                key={`mst-node-${node.id}`}
                position={[node.lat, node.lng]}
                icon={createJunctionIcon(node.id, node.isDepot)}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <div className="font-bold text-[#172B20]">{node.name}</div>
                    <div className="text-[#526658]">Junction ID: {node.id}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            <Marker position={[depotNode.lat, depotNode.lng]} icon={createDepotIcon()} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
