import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createDepotIcon, createBinIcon, createJunctionIcon } from './MapIcons';
import { Layers, Navigation, Filter, Info, CheckCircle2, Clock, Truck } from 'lucide-react';

/**
 * Helper component to automatically fit map bounds to active coordinates
 */
function AutoFitBounds({ bounds }) {
  const map = useMap();
  React.useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch {
        // bounds fit fallback
      }
    }
  }, [map, bounds]);
  return null;
}

export default function SharedWasteMap({
  bins = [],
  trucks = [],
  depot = { lat: 28.6290, lng: 77.2180, name: 'Central Depot (Logistics HQ)' },
  optimizationResult = null,
  roadGraph = null,
  showControls = true,
  height = '500px',
  activeTruckFilter = 'all',
  defaultBinFilter = 'all',
  showRoadNetworkDefault = false
}) {
  const [binFilter, setBinFilter] = useState(defaultBinFilter); // 'all', 'pending', 'collected'
  const [selectedTruckId, setSelectedTruckId] = useState(activeTruckFilter);
  const [showRoadEdges, setShowRoadEdges] = useState(showRoadNetworkDefault);

  // Map truck routes and stop indices
  const { truckRoutes, binStopMap } = useMemo(() => {
    const routes = [];
    const stopMap = new Map();

    if (optimizationResult && optimizationResult.truckResults) {
      optimizationResult.truckResults.forEach(tr => {
        if (selectedTruckId !== 'all' && tr.truckId !== selectedTruckId) return;

        if (tr.roadCoordinates && tr.roadCoordinates.length > 0) {
          routes.push({
            truckId: tr.truckId,
            truckName: tr.truckName,
            color: tr.color || '#15803D',
            coordinates: tr.roadCoordinates,
            distanceKm: tr.routeDistanceKm,
            stopsCount: tr.detailedStops?.length || 0,
            wasteKg: tr.totalWasteKg,
            isRealRoad: tr.isRealRoad,
            routingService: tr.routingService
          });
        }

        // Map stops to bins
        if (tr.detailedStops) {
          let stopIdx = 1;
          tr.detailedStops.forEach(stop => {
            if (!stop.isDepot && stop.id) {
              stopMap.set(stop.id, {
                stopNumber: stopIdx++,
                truckId: tr.truckId,
                truckName: tr.truckName,
                truckColor: tr.color || '#15803D'
              });
            }
          });
        }
      });
    }

    return { truckRoutes: routes, binStopMap: stopMap };
  }, [optimizationResult, selectedTruckId]);

  // Filter bins
  const displayedBins = useMemo(() => {
    return bins.filter(bin => {
      if (binFilter === 'pending' && bin.status !== 'pending') return false;
      if (binFilter === 'collected' && bin.status !== 'collected') return false;
      if (selectedTruckId !== 'all') {
        const stopInfo = binStopMap.get(bin.id);
        if (!stopInfo || stopInfo.truckId !== selectedTruckId) return false;
      }
      return true;
    });
  }, [bins, binFilter, selectedTruckId, binStopMap]);

  // Compute bounding box coordinates for auto-fit
  const mapBounds = useMemo(() => {
    const coords = [[depot.lat, depot.lng]];
    displayedBins.forEach(b => coords.push([b.lat, b.lng]));
    truckRoutes.forEach(r => {
      if (r.coordinates && r.coordinates.length > 0) {
        coords.push(r.coordinates[0]);
        coords.push(r.coordinates[Math.floor(r.coordinates.length / 2)]);
        coords.push(r.coordinates[r.coordinates.length - 1]);
      }
    });
    return coords;
  }, [depot, displayedBins, truckRoutes]);

  // Road network edges
  const roadEdges = useMemo(() => {
    if (!showRoadEdges || !roadGraph || !roadGraph.edges) return [];
    return roadGraph.edges.map(e => {
      const fromNode = roadGraph.nodes[e.from];
      const toNode = roadGraph.nodes[e.to];
      if (!fromNode || !toNode) return null;
      return {
        id: `${e.from}-${e.to}`,
        positions: [[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]],
        distanceKm: e.distanceKm,
        name: e.roadName
      };
    }).filter(Boolean);
  }, [showRoadEdges, roadGraph]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#E2EAE2] bg-[#FFFFFF] shadow-sm flex flex-col">
      {/* Top Filter Bar if controls enabled */}
      {showControls && (
        <div className="p-3 bg-[#F8FAF8] border-b border-[#E2EAE2] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Bin Filters */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#172B20] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#15803D]" /> Bins:
            </span>
            <button
              onClick={() => setBinFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                binFilter === 'all'
                  ? 'bg-[#15803D] text-white shadow-sm'
                  : 'bg-white text-[#526658] border border-[#E2EAE2] hover:bg-[#F0F4F0]'
              }`}
            >
              All ({bins.length})
            </button>
            <button
              onClick={() => setBinFilter('pending')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                binFilter === 'pending'
                  ? 'bg-[#D97706] text-white shadow-sm'
                  : 'bg-white text-[#526658] border border-[#E2EAE2] hover:bg-[#F0F4F0]'
              }`}
            >
              Pending ({bins.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setBinFilter('collected')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                binFilter === 'collected'
                  ? 'bg-[#15803D] text-white shadow-sm'
                  : 'bg-white text-[#526658] border border-[#E2EAE2] hover:bg-[#F0F4F0]'
              }`}
            >
              Collected ({bins.filter(b => b.status === 'collected').length})
            </button>
          </div>

          {/* Truck Route Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#172B20] flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#15803D]" /> Truck Routes:
            </span>
            <select
              value={selectedTruckId}
              onChange={(e) => setSelectedTruckId(e.target.value)}
              className="px-2.5 py-1 bg-white border border-[#E2EAE2] rounded-md text-[#172B20] font-medium focus:outline-none focus:ring-1 focus:ring-[#15803D]"
            >
              <option value="all">All Active Routes</option>
              {trucks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {roadGraph && (
              <label className="flex items-center gap-1.5 cursor-pointer ml-2 text-[#526658] hover:text-[#172B20]">
                <input
                  type="checkbox"
                  checked={showRoadEdges}
                  onChange={(e) => setShowRoadEdges(e.target.checked)}
                  className="rounded text-[#15803D] focus:ring-[#15803D]"
                />
                <span>Road Network</span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Interactive Map */}
      <div style={{ height, width: '100%' }} className="relative z-0">
        <MapContainer
          center={[depot.lat, depot.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          touchZoom={true}
          wheelDebounceTime={80}
          wheelPxPerZoomLevel={60}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            maxNativeZoom={19}
            minZoom={9}
            detectRetina={true}
            keepBuffer={8}
            updateWhenZooming={false}
            updateWhenIdle={false}
          />

          <AutoFitBounds bounds={mapBounds} />

          {/* Central Depot Marker */}
          <Marker position={[depot.lat, depot.lng]} icon={createDepotIcon()}>
            <Popup>
              <div className="p-1">
                <div className="font-bold text-sm text-[#15803D]">{depot.name}</div>
                <div className="text-xs text-gray-600 mt-1">Starting and return depot for all collection trucks.</div>
                <div className="text-[11px] text-gray-500 mt-1">Coords: {depot.lat.toFixed(4)}, {depot.lng.toFixed(4)}</div>
              </div>
            </Popup>
          </Marker>

          {/* Road Network Edges (if toggled) */}
          {roadEdges.map(edge => (
            <Polyline
              key={edge.id}
              positions={edge.positions}
              pathOptions={{ color: '#94A3B8', weight: 2, dashArray: '4, 6', opacity: 0.6 }}
            >
              <Tooltip sticky>
                <div className="text-xs">{edge.name} ({edge.distanceKm} km)</div>
              </Tooltip>
            </Polyline>
          ))}

          {/* Truck Routes (OSRM or Dijkstra fallback) */}
          {truckRoutes.map((route, i) => (
            <Polyline
              key={`${route.truckId}-${i}`}
              positions={route.coordinates}
              pathOptions={{
                color: route.color,
                weight: 5,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <div className="font-bold text-sm" style={{ color: route.color }}>
                    {route.truckName}
                  </div>
                  <div><strong>Route Distance:</strong> {route.distanceKm} km</div>
                  <div><strong>Collection Stops:</strong> {route.stopsCount}</div>
                  <div><strong>Payload:</strong> {route.wasteKg} kg</div>
                  <div className="pt-1 border-t border-gray-200">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      route.isRealRoad ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {route.routingService}
                    </span>
                  </div>
                </div>
              </Popup>
            </Polyline>
          ))}

          {/* Waste Bin Markers */}
          {displayedBins.map(bin => {
            const stopInfo = binStopMap.get(bin.id);
            const isSelected = Boolean(stopInfo);
            const stopNumber = stopInfo ? stopInfo.stopNumber : null;
            const truckColor = stopInfo ? stopInfo.truckColor : null;

            return (
              <Marker
                key={bin.id}
                position={[bin.lat, bin.lng]}
                icon={createBinIcon(bin.status, isSelected, stopNumber, truckColor, bin.priority)}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-1">
                      <span className="font-bold text-sm text-[#172B20]">{bin.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        bin.status === 'collected'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {bin.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-gray-700 font-medium">{bin.locationName}</div>
                    <div><strong>Waste Quantity:</strong> {bin.wasteKg} kg</div>
                    <div>
                      <strong>Priority:</strong>{' '}
                      <span className={`font-semibold ${
                        bin.priority === 'High' ? 'text-red-600' : bin.priority === 'Medium' ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        {bin.priority}
                      </span>
                    </div>
                    {bin.pendingDuration > 0 && (
                      <div className="text-amber-700">
                        <strong>Pending:</strong> {bin.pendingDuration} day(s)
                      </div>
                    )}
                    {stopInfo && (
                      <div className="p-1.5 rounded bg-green-50 border border-green-200 text-green-900 mt-1">
                        <strong>Stop #{stopInfo.stopNumber}</strong> on {stopInfo.truckName}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom Map Legend */}
      <div className="p-2.5 bg-[#F8FAF8] border-t border-[#E2EAE2] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#526658]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#15803D] border border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">H</div>
            <span>Central Depot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#15803D] border border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">✓</div>
            <span>Collected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#DC2626] border border-white shadow-sm"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#D97706] border border-white shadow-sm"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#4B5563] border border-white shadow-sm"></div>
            <span>Low</span>
          </div>
        </div>

        {truckRoutes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#172B20]">Active Trips:</span>
            {truckRoutes.map(tr => (
              <span key={tr.truckId} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tr.color }}></span>
                <span>{tr.truckName} ({tr.distanceKm} km)</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
