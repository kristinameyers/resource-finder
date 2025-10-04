// ───────────────────────────────────────────────────────────────
// File:  api/locationApi.ts
// ───────────────────────────────────────────────────────────────
import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Async: Requests location permission and gets the device's current GPS coordinates.
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission not granted. Cannot use GPS location.');
    }
    
    const location = await Location.getCurrentPositionAsync({ 
      accuracy: Location.Accuracy.High,
    });
    
    return { 
      latitude: location.coords.latitude, 
      longitude: location.coords.longitude 
    };
  } catch (error) {
    // Re-throw the error for the calling hook (useLocation) to handle
    throw error;
  }
}

export async function fetchLocationByCoordinates(latitude: number, longitude: number): Promise<any> {
  // This function is typically used for reverse geocoding to get address details.
  // For this application, you can return a placeholder or implement an API call (e.g., Google Geocoding).
  // Returning null or an empty object is safer if you don't need the reverse-geocoded address.
  return null; 
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
