/**
 * Municipal Road Network Graph
 *
 * Controlled road network for municipal waste collection coverage.
 * Includes nodes (junctions/depot) and weighted edges representing street connections.
 * Distances are in kilometers.
 *
 * Zone 1 (0 – 3.0 km from Depot): Nodes 0, 1, 2, 3, 4
 * Zone 2 (> 3.0 – 6.0 km from Depot): Nodes 5, 6, 7, 8, 9
 * Zone 3 (> 6.0 – 12.0 km from Depot): Nodes 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
 */

export const INITIAL_ROAD_NETWORK = {
  depotId: '0',
  nodes: {
    '0': { id: '0', name: 'Central Municipal Depot (HQ)', lat: 28.6280, lng: 77.2150, isDepot: true, zone: 'Depot' },
    '1': { id: '1', name: 'North Sector Junction A', lat: 28.6360, lng: 77.2120, zone: 'Zone 1' },
    '2': { id: '2', name: 'Civic Centre Roundabout', lat: 28.6260, lng: 77.2260, zone: 'Zone 1' },
    '3': { id: '3', name: 'South Gate Crossing', lat: 28.6180, lng: 77.2180, zone: 'Zone 1' },
    '4': { id: '4', name: 'West Avenue Interchange', lat: 28.6220, lng: 77.2040, zone: 'Zone 1' },
    '5': { id: '5', name: 'Commercial Hub Junction', lat: 28.6440, lng: 77.2200, zone: 'Zone 2' },
    '6': { id: '6', name: 'East Ring Road Crossing', lat: 28.6310, lng: 77.2380, zone: 'Zone 2' },
    '7': { id: '7', name: 'Residential Sector 4', lat: 28.6100, lng: 77.2320, zone: 'Zone 2' },
    '8': { id: '8', name: 'Metro Station Gate 2', lat: 28.6120, lng: 77.2010, zone: 'Zone 2' },
    '9': { id: '9', name: 'Green Park Parkway', lat: 28.6320, lng: 77.1950, zone: 'Zone 2' },
    '10': { id: '10', name: 'Industrial Sector Crossing', lat: 28.6550, lng: 77.2310, zone: 'Zone 3' },
    '11': { id: '11', name: 'Tech Park Outer Road', lat: 28.6460, lng: 77.2510, zone: 'Zone 3' },
    '12': { id: '12', name: 'Riverfront Boulevard South', lat: 28.6010, lng: 77.2450, zone: 'Zone 3' },
    '13': { id: '13', name: 'Highway Terminal 3', lat: 28.5990, lng: 77.2110, zone: 'Zone 3' },
    '14': { id: '14', name: 'Western Bypass Node', lat: 28.6190, lng: 77.1850, zone: 'Zone 3' },
    '15': { id: '15', name: 'Northwest Transit Hub', lat: 28.6430, lng: 77.1870, zone: 'Zone 3' },
    '16': { id: '16', name: 'North Ring Overpass', lat: 28.6580, lng: 77.2080, zone: 'Zone 3' },
    '17': { id: '17', name: 'Eastern Highway Toll Link', lat: 28.6250, lng: 77.2600, zone: 'Zone 3' },
    '18': { id: '18', name: 'Outer Industrial Hub', lat: 28.6650, lng: 77.2420, zone: 'Zone 3' },
    '19': { id: '19', name: 'Far Eastern Bypass Node', lat: 28.6320, lng: 77.2720, zone: 'Zone 3' },
    '20': { id: '20', name: 'Southern Perimeter Terminal', lat: 28.5880, lng: 77.2320, zone: 'Zone 3' }
  },
  // Undirected edges with weights in kilometers
  edges: [
    // Depot connections (Zone 1: 0 - 3.0 km)
    { from: '0', to: '1', weight: 1.1, roadName: 'Depot North Arterial' },
    { from: '0', to: '2', weight: 1.3, roadName: 'Civic Centre Expressway' },
    { from: '0', to: '3', weight: 1.2, roadName: 'South Boulevard' },
    { from: '0', to: '4', weight: 1.4, roadName: 'West Central Parkway' },

    // Zone 1 Inner Loop
    { from: '1', to: '2', weight: 1.7, roadName: 'North-East Connector' },
    { from: '2', to: '3', weight: 1.5, roadName: 'Civic South Corridor' },
    { from: '3', to: '4', weight: 1.6, roadName: 'South-West Link' },
    { from: '4', to: '1', weight: 1.8, roadName: 'West-North Crescent' },

    // Zone 1 to Zone 2 Radials (leading to Zone 2: > 3.0 - 6.0 km)
    { from: '1', to: '5', weight: 2.5, roadName: 'Commercial Avenue' },
    { from: '1', to: '9', weight: 2.7, roadName: 'Parkway North Link' },
    { from: '2', to: '6', weight: 2.6, roadName: 'East Ring Access' },
    { from: '3', to: '7', weight: 2.8, roadName: 'Residential Sector Main' },
    { from: '3', to: '8', weight: 2.7, roadName: 'Metro South Boulevard' },
    { from: '4', to: '8', weight: 2.5, roadName: 'Metro West Link' },
    { from: '4', to: '9', weight: 2.6, roadName: 'Green Park Radial' },

    // Zone 2 Intermediate Ring
    { from: '5', to: '6', weight: 2.1, roadName: 'Commercial East Bypass' },
    { from: '6', to: '7', weight: 2.4, roadName: 'Sector 4 East Arterial' },
    { from: '7', to: '8', weight: 2.6, roadName: 'South Ring Beltway' },
    { from: '8', to: '9', weight: 2.3, roadName: 'West Greenbelt Avenue' },
    { from: '9', to: '5', weight: 2.7, roadName: 'Northwest Commercial Link' },

    // Zone 2 to Zone 3 Outer Radials (leading to Zone 3: > 6.0 - 12.0 km)
    { from: '5', to: '10', weight: 3.5, roadName: 'Industrial North Parkway' },
    { from: '5', to: '16', weight: 3.7, roadName: 'North Overpass Road' },
    { from: '6', to: '11', weight: 3.5, roadName: 'Tech Park Access Way' },
    { from: '6', to: '17', weight: 3.8, roadName: 'East Tollway Connector' },
    { from: '7', to: '12', weight: 3.6, roadName: 'Riverfront South Link' },
    { from: '8', to: '13', weight: 3.4, roadName: 'Highway Terminal Route' },
    { from: '8', to: '14', weight: 3.6, roadName: 'Western Bypass Ramp' },
    { from: '9', to: '14', weight: 3.5, roadName: 'West Outer Spine' },
    { from: '9', to: '15', weight: 3.3, roadName: 'Transit Hub Avenue' },

    // Zone 3 Outer Ring Connections
    { from: '16', to: '10', weight: 2.4, roadName: 'North Sector Expressway' },
    { from: '10', to: '11', weight: 2.5, roadName: 'Outer Industrial Belt' },
    { from: '11', to: '17', weight: 2.6, roadName: 'East Sector Corridor' },
    { from: '17', to: '12', weight: 3.1, roadName: 'Riverfront Outer Highway' },
    { from: '12', to: '13', weight: 2.9, roadName: 'South Perimeter Highway' },
    { from: '13', to: '14', weight: 2.7, roadName: 'Southwest Bypass Loop' },
    { from: '14', to: '15', weight: 2.5, roadName: 'Western Outer Ring' },
    { from: '15', to: '16', weight: 2.3, roadName: 'Northwest Ringway' },

    // Zone 3 Outer Spur Links
    { from: '10', to: '18', weight: 1.8, roadName: 'North Outer Arterial' },
    { from: '16', to: '18', weight: 2.0, roadName: 'Overpass Spur' },
    { from: '11', to: '19', weight: 2.0, roadName: 'East Outer Extension' },
    { from: '17', to: '19', weight: 1.9, roadName: 'Tollway Link' },
    { from: '12', to: '20', weight: 1.9, roadName: 'Riverfront Extension' },
    { from: '13', to: '20', weight: 2.1, roadName: 'Terminal South Access' }
  ]
};

// Build adjacency list for fast Dijkstra and MST traversals
export function buildAdjacencyList(network) {
  const adjacencyList = {};
  Object.keys(network.nodes).forEach(nodeId => {
    adjacencyList[nodeId] = [];
  });

  network.edges.forEach(edge => {
    adjacencyList[edge.from].push({
      to: edge.to,
      weight: edge.weight,
      roadName: edge.roadName
    });
    // Undirected graph: road runs both ways
    adjacencyList[edge.to].push({
      to: edge.from,
      weight: edge.weight,
      roadName: edge.roadName
    });
  });

  return adjacencyList;
}

export const INITIAL_ROAD_GRAPH = {
  ...INITIAL_ROAD_NETWORK,
  adjacencyList: buildAdjacencyList(INITIAL_ROAD_NETWORK)
};
