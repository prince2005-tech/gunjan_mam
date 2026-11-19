/**
 * Initial Demonstration Garbage Trucks
 *
 * 3 Garbage trucks with defined capacities and non-overlapping road distance service zones.
 */

export const INITIAL_TRUCKS = [
  {
    id: 'TRK-01',
    name: 'Truck 1 (Inner Ward)',
    totalCapacity: 1200,
    currentLoad: 0,
    remainingCapacity: 1200,
    zoneName: 'Zone 1 (0 – 3.0 km)',
    zoneMinKm: 0.0,
    zoneMaxKm: 3.0,
    currentLocation: 'Central Depot',
    availability: 'available',
    assignedBins: [],
    color: '#10B981', // Emerald
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'TRK-02',
    name: 'Truck 2 (Mid Sector)',
    totalCapacity: 1800,
    currentLoad: 0,
    remainingCapacity: 1800,
    zoneName: 'Zone 2 (> 3.0 – 6.0 km)',
    zoneMinKm: 3.0,
    zoneMaxKm: 6.0,
    currentLocation: 'Central Depot',
    availability: 'available',
    assignedBins: [],
    color: '#06B6D4', // Cyan
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'TRK-03',
    name: 'Truck 3 (Outer Perimeter)',
    totalCapacity: 2400,
    currentLoad: 0,
    remainingCapacity: 2400,
    zoneName: 'Zone 3 (> 6.0 – 12.0 km)',
    zoneMinKm: 6.0,
    zoneMaxKm: 12.0,
    currentLocation: 'Central Depot',
    availability: 'available',
    assignedBins: [],
    color: '#A855F7', // Purple
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }
];

export const SERVICE_ZONE_PRESETS = [
  { label: 'Zone 1 (0 – 3.0 km)', min: 0.0, max: 3.0 },
  { label: 'Zone 2 (> 3.0 – 6.0 km)', min: 3.0, max: 6.0 },
  { label: 'Zone 3 (> 6.0 – 12.0 km)', min: 6.0, max: 12.0 }
];
