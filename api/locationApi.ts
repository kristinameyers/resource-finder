// ───────────────────────────────────────────────────────────────
// File:  api/locationApi.ts
// ───────────────────────────────────────────────────────────────

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Resolve a US ZIP code to latitude / longitude.
 * Uses Zippopotam.us API.
 */
export async function fetchLocationByZipCode(zip: string): Promise<Coordinates> {
  const cleaned = zip.trim();
  if (!/^\d{5}$/.test(cleaned)) {
    throw new Error("Invalid US ZIP code format (expected 5 digits)");
  }

  const response = await fetch(`https://api.zippopotam.us/us/${cleaned}`);
  if (!response.ok) {
    throw new Error(`Unable to fetch location for ZIP ${cleaned}`);
  }

  const data: {
    places?: Array<{ latitude: string; longitude: string }>;
  } = await response.json();

  const place = data.places?.[0];
  if (!place) {
    throw new Error(`No location data returned for ZIP ${cleaned}`);
  }

  return {
    latitude: parseFloat(place.latitude),
    longitude: parseFloat(place.longitude),
  };
}
