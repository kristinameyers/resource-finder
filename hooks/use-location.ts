import { useState } from "react";
import { Location, PartialLocation } from "../types/shared-schema";
// Update the import path if your API functions are located elsewhere, for example:
import { getCurrentLocation, fetchLocationByZipCode, fetchLocationByCoordinates } from "../api/locationApi";
// Or create a file at ../../api.ts exporting these functions if it doesn't exist.

export type LocationState =
  | { type: "none" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | {
      type: "zipCode";
      zipCode: string;
      /** Coordinates returned by the ZIP‑code lookup */
      location: { latitude: number; longitude: number };
      /** Address info – may be incomplete, so we use PartialLocation */
      address?: PartialLocation;
    }
  | {
      type: "coordinates";
      latitude: number;
      longitude: number;
      /** May be undefined if reverse‑geocode gave us no data */
      location?: PartialLocation;
    };

export function useLocation() {
  const [locationState, setLocationState] = useState<LocationState>({ type: 'none' });

  // Request the user's current location using browser's Geolocation API
  const requestCurrentLocation = async () => {
    try {
      setLocationState({ type: 'loading' });
      
      const coords = await getCurrentLocation();
      
      // Try to fetch a location from our database using these coordinates
      const location = await fetchLocationByCoordinates(coords.latitude, coords.longitude);
      
      setLocationState({
        type: 'coordinates',
        latitude: coords.latitude,
        longitude: coords.longitude,
        location,
      });
      
      return { latitude: coords.latitude, longitude: coords.longitude };
    } catch (error) {
      setLocationState({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to get current location' 
      });
      throw error;
    }
  };

  // Set location by zip code
  const setLocationByZipCode = async (zipCode: string) => {
    if (!zipCode.trim()) {
      setLocationState({ type: 'none' });
      return;
    }
    
    try {
      setLocationState({ type: 'loading' });
      
      // Fetch location from zip code
      const location = await fetchLocationByZipCode(zipCode);
      
      setLocationState({ 
        type: 'zipCode',
        zipCode,
        location
      });
    } catch (error) {
      setLocationState({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to find location for zip code' 
      });
    }
  };

  // Clear location state
  const clearLocation = () => {
    setLocationState({ type: 'none' });
  };

  return {
    locationState,
    requestCurrentLocation,
    setLocationByZipCode,
    clearLocation
  };
}