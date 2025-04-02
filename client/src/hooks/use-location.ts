import { useState } from "react";
import { Location } from "@shared/schema";
import { getCurrentLocation, fetchLocationByZipCode, fetchLocationByCoordinates } from "@/lib/api";

export type LocationState = 
  | { type: 'none' }
  | { type: 'loading' }
  | { type: 'error', message: string }
  | { type: 'zipCode', zipCode: string, location: Location | null }
  | { type: 'coordinates', latitude: number, longitude: number, location: Location | null };

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
        location
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