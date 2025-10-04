import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Ensure these imports are correct based on your file structure
import { getCurrentLocation, fetchLocationByCoordinates } from "../api/locationApi";
import { getCoordinatesForZipSync } from '../utils/distance'; 
import { Location, PartialLocation } from "../types/shared-schema"; // Added missing import

// Location Keys (Ensure these match your constants in other files)
const SAVED_ZIP = "saved_zip_code";
const SAVED_LAT = "userLatitude";
const SAVED_LNG = "userLongitude";

// Helper function moved outside the hook to ensure stability (only needs to be defined once)
const areStatesEqual = (state1: LocationState, state2: LocationState) => {
    // Check type first for a fast exit
    if (state1.type !== state2.type) return false;
    
    // Use JSON.stringify for a reliable deep comparison of the payload data
    return JSON.stringify(state1) === JSON.stringify(state2);
};

// NOTE: LocationState type definition is kept as-is, assuming it's correct.
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

  /**
   * Load saved location from AsyncStorage. This is called by refreshLocation.
   * CRITICAL: Only calls setLocationState if the calculated newState is different.
   */
  const loadSavedLocation = useCallback(async () => {
    try {
      const [zip, lat, lng] = await Promise.all([
        AsyncStorage.getItem(SAVED_ZIP),
        AsyncStorage.getItem(SAVED_LAT),
        AsyncStorage.getItem(SAVED_LNG),
      ]);

      let newState: LocationState;

      if (lat && lng) {
        // Case 1: GPS Coordinates are saved
        const location = await fetchLocationByCoordinates(parseFloat(lat), parseFloat(lng));
        newState = {
          type: 'coordinates',
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          location,
        };
      } else if (zip) {
        // Case 2: ZIP Code is saved
        const coords = getCoordinatesForZipSync(zip);
        
        if (coords) {
             newState = { 
                type: 'zipCode', 
                zipCode: zip, 
                location: { latitude: coords.lat, longitude: coords.lng } 
             };
        } else {
             // Saved ZIP not in local map: treat as no location
             newState = { type: 'none' };
        }
      } else {
        // Case 3: No location saved
        newState = { type: 'none' };
      }
      
      // Only call setLocationState if the content is different from current state.
      // This prevents the infinite loop triggered by useFocusEffect in HomeScreen.
      if (!areStatesEqual(locationState, newState)) {
          setLocationState(newState);
      }

    } catch (error) {
       console.error("Error loading saved location:", error);
       // Avoid setting state if it's already an error or none
       if (locationState.type !== 'error' && locationState.type !== 'none') {
         setLocationState({ type: 'none' }); 
       }
    }
  }, [locationState]); // Dependencies: locationState for comparison, areStatesEqual for stability
  
  /**
   * Request the user's current location (GPS).
   */
  const requestCurrentLocation = async () => {
    try {
      setLocationState({ type: 'loading' });
      
      const coords = await getCurrentLocation();
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

  /**
   * Set location state based on a provided ZIP code (uses local lookup).
   */
  const setLocationByZipCode = useCallback(async (zipCode: string) => {
    if (!zipCode.trim()) {
      setLocationState({ type: 'none' });
      return;
    }
    
    try {
      setLocationState({ type: 'loading' });
      
      const coords = getCoordinatesForZipSync(zipCode);
      
      if (coords) {
          // Success: Set zipCode type with coordinates
          setLocationState({ 
            type: 'zipCode',
            zipCode,
            location: { latitude: coords.lat, longitude: coords.lng }, 
          });
      } else {
          // Failure: ZIP not in local map
          setLocationState({ 
            type: 'error', 
            message: `ZIP code ${zipCode} not found in local map. Please try again.`
          });
      }
    } catch (error) {
      setLocationState({ 
        type: 'error', 
        message: 'Error processing ZIP code' 
      });
    }
  }, []);

  /**
   * Clear location state.
   */
  const clearLocation = () => {
    setLocationState({ type: 'none' });
  };
  
  // Alias for use in HomeScreen's useFocusEffect
  const refreshLocation = loadSavedLocation;

  return {
    locationState,
    refreshLocation,
    requestCurrentLocation,
    setLocationByZipCode,
    clearLocation
  };
}