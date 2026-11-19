/**
 * Initial Demonstration Waste Bins
 *
 * 20 waste bins distributed across municipal coverage zones, mapped to road network junctions.
 * Realistic waste amounts (kg) and priorities.
 *
 * Zone 1 (0 – 3.0 km from Depot): BIN-101 to BIN-106 (Truck 1)
 * Zone 2 (> 3.0 – 6.0 km from Depot): BIN-201 to BIN-206 (Truck 2)
 * Zone 3 (> 6.0 – 12.0 km from Depot): BIN-301 to BIN-308 (Truck 3)
 */

export const INITIAL_BINS = [
  // Zone 1 Bins (0 - 3.0 km from Depot)
  {
    id: 'BIN-101',
    nodeId: '1',
    locationName: 'North Sector Junction A',
    lat: 28.6360,
    lng: 77.2120,
    wasteKg: 280,
    priority: 'High',
    status: 'pending',
    pendingDuration: 1,
    lastCollectedDate: '2026-11-14',
    assignedTruckId: null
  },
  {
    id: 'BIN-102',
    nodeId: '2',
    locationName: 'Civic Centre Roundabout',
    lat: 28.6260,
    lng: 77.2260,
    wasteKg: 340,
    priority: 'Medium',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-103',
    nodeId: '3',
    locationName: 'South Gate Crossing',
    lat: 28.6180,
    lng: 77.2180,
    wasteKg: 210,
    priority: 'Low',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-104',
    nodeId: '4',
    locationName: 'West Avenue Interchange',
    lat: 28.6220,
    lng: 77.2040,
    wasteKg: 390,
    priority: 'High',
    status: 'pending',
    pendingDuration: 2,
    lastCollectedDate: '2026-11-13',
    assignedTruckId: null
  },
  {
    id: 'BIN-105',
    nodeId: '1',
    locationName: 'North Sector Market Corner',
    lat: 28.6350,
    lng: 77.2135,
    wasteKg: 180,
    priority: 'Medium',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-106',
    nodeId: '2',
    locationName: 'Civic Hall East Gate',
    lat: 28.6275,
    lng: 77.2245,
    wasteKg: 250,
    priority: 'High',
    status: 'pending',
    pendingDuration: 1,
    lastCollectedDate: '2026-11-14',
    assignedTruckId: null
  },

  // Zone 2 Bins (>3.0 - 6.0 km from Depot)
  {
    id: 'BIN-201',
    nodeId: '5',
    locationName: 'Commercial Hub Junction',
    lat: 28.6440,
    lng: 77.2200,
    wasteKg: 420,
    priority: 'High',
    status: 'pending',
    pendingDuration: 1,
    lastCollectedDate: '2026-11-14',
    assignedTruckId: null
  },
  {
    id: 'BIN-202',
    nodeId: '6',
    locationName: 'East Ring Road Crossing',
    lat: 28.6310,
    lng: 77.2380,
    wasteKg: 310,
    priority: 'Medium',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-203',
    nodeId: '7',
    locationName: 'Residential Sector 4',
    lat: 28.6100,
    lng: 77.2320,
    wasteKg: 260,
    priority: 'Low',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-204',
    nodeId: '8',
    locationName: 'Metro Station Gate 2',
    lat: 28.6120,
    lng: 77.2010,
    wasteKg: 460,
    priority: 'High',
    status: 'pending',
    pendingDuration: 2,
    lastCollectedDate: '2026-11-13',
    assignedTruckId: null
  },
  {
    id: 'BIN-205',
    nodeId: '9',
    locationName: 'Green Park Parkway',
    lat: 28.6320,
    lng: 77.1950,
    wasteKg: 190,
    priority: 'Medium',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-206',
    nodeId: '5',
    locationName: 'Commercial Plaza Plaza B',
    lat: 28.6425,
    lng: 77.2215,
    wasteKg: 380,
    priority: 'High',
    status: 'pending',
    pendingDuration: 1,
    lastCollectedDate: '2026-11-14',
    assignedTruckId: null
  },

  // Zone 3 Bins (>6.0 - 12.0 km from Depot)
  {
    id: 'BIN-301',
    nodeId: '10',
    locationName: 'Industrial Sector Crossing',
    lat: 28.6550,
    lng: 77.2310,
    wasteKg: 420,
    priority: 'High',
    status: 'pending',
    pendingDuration: 1,
    lastCollectedDate: '2026-11-14',
    assignedTruckId: null
  },
  {
    id: 'BIN-302',
    nodeId: '11',
    locationName: 'Tech Park Outer Road',
    lat: 28.6460,
    lng: 77.2510,
    wasteKg: 350,
    priority: 'Medium',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-303',
    nodeId: '12',
    locationName: 'Riverfront Boulevard South',
    lat: 28.6010,
    lng: 77.2450,
    wasteKg: 290,
    priority: 'Low',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-304',
    nodeId: '13',
    locationName: 'Highway Terminal 3',
    lat: 28.5990,
    lng: 77.2110,
    wasteKg: 440,
    priority: 'High',
    status: 'pending',
    pendingDuration: 2,
    lastCollectedDate: '2026-11-13',
    assignedTruckId: null
  },
  {
    id: 'BIN-305',
    nodeId: '14',
    locationName: 'Western Bypass Node',
    lat: 28.6190,
    lng: 77.1850,
    wasteKg: 310,
    priority: 'Medium',
    status: 'pending',
    pendingDuration: 1,
    lastCollectedDate: '2026-11-14',
    assignedTruckId: null
  },
  {
    id: 'BIN-306',
    nodeId: '15',
    locationName: 'Northwest Transit Hub',
    lat: 28.6430,
    lng: 77.1870,
    wasteKg: 390,
    priority: 'High',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-307',
    nodeId: '18',
    locationName: 'Outer Industrial Hub Gate',
    lat: 28.6650,
    lng: 77.2420,
    wasteKg: 360,
    priority: 'Medium',
    status: 'pending',
    pendingDuration: 0,
    lastCollectedDate: '2026-11-15',
    assignedTruckId: null
  },
  {
    id: 'BIN-308',
    nodeId: '19',
    locationName: 'Far Eastern Bypass Plaza',
    lat: 28.6320,
    lng: 77.2720,
    wasteKg: 410,
    priority: 'High',
    status: 'pending',
    pendingDuration: 1,
    lastCollectedDate: '2026-11-14',
    assignedTruckId: null
  }
];
