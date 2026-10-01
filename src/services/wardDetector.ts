import { DemoWard } from '../types';
import { DEMO_WARDS } from '../data/seedData';

export interface LocationDetectionResult {
  city: string;
  area: string;
  administrativeWard: string;
  demoWardNumber: string;
  wardName: string;
  latitude: number;
  longitude: number;
  address: string;
  accuracyMeters?: number;
  isDemoWard: boolean; // Must always be true for demo wards per spec
}

/**
 * Calculates Euclidean distance between two geographic coordinates
 */
function getGeoDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = lat1 - lat2;
  const dLon = lon1 - lon2;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/**
 * Detects Demo Ward from geographic coordinates.
 * CRITICAL ARCHITECTURAL RULE:
 * "Ward must be derived from location, NOT from image AI."
 * "Never claim they are official government ward numbers. Clearly label them as DEMO WARDS."
 */
export function detectWardFromCoordinates(lat: number, lng: number): LocationDetectionResult {
  // Find nearest Demo Ward in Dahisar R/North
  let closestWard = DEMO_WARDS[0];
  let minDistance = Infinity;

  for (const ward of DEMO_WARDS) {
    const dist = getGeoDistance(lat, lng, ward.centerLat, ward.centerLng);
    if (dist < minDistance) {
      minDistance = dist;
      closestWard = ward;
    }
  }

  // Construct realistic address in Dahisar, Mumbai based on the matched demo ward
  const addressByWard: Record<string, string> = {
    'Demo Ward 01': 'CS Road, Near Station Approach, Dahisar East, Mumbai 400068',
    'Demo Ward 02': 'Rawalpada Main Road, Dahisar East, Mumbai 400068',
    'Demo Ward 03': 'New Link Road, Near Kandar Pada, Dahisar West, Mumbai 400068',
    'Demo Ward 04': 'Mandapeshwar Caves Road, Dahisar West, Mumbai 400068',
    'Demo Ward 05': 'Western Express Highway Link, Ashokvan, Dahisar East, Mumbai 400068',
    'Demo Ward 06': 'Creek Road, Gaothan Coastal Area, Dahisar West, Mumbai 400068',
  };

  return {
    city: 'Mumbai',
    area: 'Dahisar',
    administrativeWard: 'R/North',
    demoWardNumber: closestWard.demoWardNumber,
    wardName: closestWard.wardName,
    latitude: lat,
    longitude: lng,
    address: addressByWard[closestWard.demoWardNumber] || `${closestWard.wardName}, Dahisar, Mumbai 400068`,
    isDemoWard: true,
  };
}

/**
 * Get Location details directly from a selected Demo Ward
 */
export function getLocationFromDemoWard(demoWardNumber: string): LocationDetectionResult {
  const matched = DEMO_WARDS.find((w) => w.demoWardNumber === demoWardNumber) || DEMO_WARDS[0];
  return {
    city: 'Mumbai',
    area: 'Dahisar',
    administrativeWard: 'R/North',
    demoWardNumber: matched.demoWardNumber,
    wardName: matched.wardName,
    latitude: matched.centerLat,
    longitude: matched.centerLng,
    address: `${matched.wardName}, Dahisar, Mumbai 400068`,
    isDemoWard: true,
  };
}

/**
 * Reverse geocodes or creates an address label
 */
export function formatAddress(city: string, area: string, ward: string): string {
  return `${area}, ${city} (${ward})`;
}
