import L from 'leaflet';

/**
 * Creates custom crisp markers for Leaflet in the Light Municipal Theme
 */

export function createDepotIcon() {
  return L.divIcon({
    className: 'custom-depot-marker',
    html: `
      <div style="
        background: #15803D;
        color: #FFFFFF;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(21, 128, 61, 0.45);
        font-weight: 800;
        font-size: 13px;
        letter-spacing: -0.5px;
      ">
        DEPOT
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
}

export function createBinIcon(status, isSelected = false, stopNumber = null, truckColor = null, priority = 'Medium') {
  let bgColor = '#D97706'; // Amber default for pending
  let label = '🗑️';
  let borderColor = '#FFFFFF';

  if (status === 'collected') {
    bgColor = '#15803D'; // Municipal Green
    label = '✓';
  } else if (isSelected) {
    bgColor = truckColor || '#0284C7';
    label = stopNumber !== null ? `${stopNumber}` : '★';
  } else {
    if (priority === 'High') {
      bgColor = '#DC2626'; // Urgent High
    } else if (priority === 'Medium') {
      bgColor = '#D97706'; // Amber Medium
    } else {
      bgColor = '#4B5563'; // Slate Low
    }
  }

  return L.divIcon({
    className: 'custom-bin-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${borderColor};
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        font-weight: 700;
        font-size: ${stopNumber !== null ? '12px' : '11px'};
      ">
        ${label}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
}

export function createJunctionIcon(nodeId, isDepot = false) {
  return L.divIcon({
    className: 'custom-junction-marker',
    html: `
      <div style="
        background: ${isDepot ? '#15803D' : '#FFFFFF'};
        color: ${isDepot ? '#FFFFFF' : '#374151'};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${isDepot ? '#86EFAC' : '#CBD5E1'};
        font-size: 10px;
        font-weight: 700;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      ">
        ${nodeId}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
}
