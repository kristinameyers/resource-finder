// ───────────────────────────────────────────────────────────────
// File:  api/locationApi.ts
// ───────────────────────────────────────────────────────────────

/**
 * Tiny wrapper around the browser / React‑Native geolocation APIs.
 * All functions return a Promise so they can be used with `await`
 * (or with React‑Query, which expects a promise‑based fetcher).
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Get the device’s current GPS coordinates.
 *
 * On the web it uses `navigator.geolocation`.
 * On React‑Native you can swap the implementation for `expo-location`
 * or any other native module – the signature stays the same.
 */
export const getCurrentLocation = async (): Promise<Coordinates> => {
  // ---------- Web (browser) ----------
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    return new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        err => {
          reject(new Error(`Geolocation error: ${err.message}`));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // ---------- React‑Native fallback ----------
  // If you are running in a RN environment without `navigator.geolocation`,
  // you can import Expo Location (or any other lib) here.
  // Example (uncomment after installing expo-location):
  //
  // import * as Location from 'expo-location';
  // const { status } = await Location.requestForegroundPermissionsAsync();
  // if (status !== 'granted') throw new Error('Location permission denied');
  // const loc = await Location.getCurrentPositionAsync({});
  // return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

  // If none of the above environments match, throw a clear error.
  throw new Error('Geolocation API not available in this environment.');
};

/**
 * Resolve a US ZIP code to latitude / longitude.
 *
 * This example uses the public “Zippopotam.us” API (no auth required).
 * Feel free to replace it with any other service you prefer.
 */
export const fetchLocationByZipCode = async (zip: string): Promise<Coordinates> => {
  const cleaned = zip.trim();

  // Very light validation – the API will also reject malformed zips.
  if (!/^\d{5}$/.test(cleaned)) {
    throw new Error('Invalid US ZIP code format (expected 5 digits)');
  }

  const response = await fetch(`https://api.zippopotam.us/us/${cleaned}`);

  if (!response.ok) {
    throw new Error(`Unable to fetch location for ZIP ${cleaned}`);
  }

  const data = await response.json();

  // Zippopotam returns an array of places; we take the first one.
  const place = data.places?.[0];
  if (!place) {
    throw new Error(`No location data returned for ZIP ${cleaned}`);
  }

  return {
    latitude: parseFloat(place.latitude),
    longitude: parseFloat(place.longitude),
  };
};

/**
 * Resolve arbitrary latitude / longitude coordinates to a human‑readable address.
 *
 * Again we use Zippopotam for simplicity (it supports reverse lookup).
 * Replace with Google Maps Geocoding, Mapbox, or any paid service if you need
 * richer data (street, city, etc.).
 */
export const fetchLocationByCoordinates = async (
  latitude: number,
  longitude: number
): Promise<{ city?: string; state?: string; country?: string }> => {
  const url = `https://api.zippopotam.us/us/${latitude},${longitude}`;

  const response = await fetch(url);

  if (!response.ok) {
    // Some services return 404 for “no nearby place”; we treat that as empty result.
    return {};
  }

  const data = await response.json();

  // Zippopotam returns a `places` array; grab the first entry.
  const place = data.places?.[0];
  if (!place) return {};

  return {
    city: place['place name'],
    state: place['state abbreviation'],
    country: data.country,
  };
};