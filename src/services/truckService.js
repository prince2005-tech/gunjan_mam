/**
 * Garbage Truck Management Service
 *
 * Supports multiple trucks in identical or overlapping service zones.
 */

const TRUCK_PALETTE = [
  { color: '#15803D', badgeClass: 'bg-green-100 text-green-800 border-green-200' }, // Municipal Green
  { color: '#0284C7', badgeClass: 'bg-sky-100 text-sky-800 border-sky-200' },       // Ocean Blue
  { color: '#7C3AED', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' }, // Purple
  { color: '#D97706', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },   // Amber
  { color: '#0D9488', badgeClass: 'bg-teal-100 text-teal-800 border-teal-200' },     // Teal
  { color: '#E11D48', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200' }      // Rose
];

export function generateNextTruckId(existingTrucks) {
  let maxNum = 0;
  existingTrucks.forEach(t => {
    const match = t.id.match(/TRK-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `TRK-${nextNum < 10 ? '0' + nextNum : nextNum}`;
}

export function getTruckStyling(index) {
  return TRUCK_PALETTE[index % TRUCK_PALETTE.length];
}

/**
 * Validates individual truck configurations.
 * Multiple trucks in the same zone are fully permitted and supported.
 * Only genuine configuration errors (e.g. min >= max or capacity <= 0) produce warnings.
 */
export function validateTruckZones(trucks) {
  const warnings = [];
  trucks.forEach(t => {
    if (t.zoneMinKm < 0) {
      warnings.push(`Truck ${t.id} (${t.name}) has an invalid negative minimum zone distance.`);
    }
    if (t.zoneMaxKm <= t.zoneMinKm) {
      warnings.push(`Truck ${t.id} (${t.name}) maximum zone distance must be strictly greater than minimum distance.`);
    }
    if (t.totalCapacity <= 0) {
      warnings.push(`Truck ${t.id} (${t.name}) has an invalid capacity (${t.totalCapacity} kg).`);
    }
  });
  return warnings;
}
