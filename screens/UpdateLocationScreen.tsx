import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Keyboard } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "../hooks/use-toast";
import { getCoordinatesForZip } from '../utils/distance';
import { getCurrentLocation } from '../utils/distance';
import { useTranslatedText } from "../components/TranslatedText";

const SAVED_ZIP = "saved_zip_code"; // Key used in HomeScreen/ResourceListScreen
const SAVED_LAT = "userLatitude";
const SAVED_LNG = "userLongitude";

type RootStackParamList = {
  Home: undefined;
  SearchCategory: undefined;
  SearchKeyword: undefined;
  // ... add other screens as needed
};

export default function UpdateLocationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [zipCode, setZipCode] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { show } = useToast();

  // TRANSLATION TEXT (using default English for brevity)
  const { text: updateLocationText } = useTranslatedText("Enter your zip code to find resources closest to your location.");
  const { text: useCurrentLocationText } = useTranslatedText("Use My Current Location");
  const { text: gettingLocationText } = useTranslatedText("Getting Location...");
  const { text: enterZipText } = useTranslatedText("Enter Zip Code");
  const { text: saveText } = useTranslatedText("Save");
  const { text: clearText } = useTranslatedText("Clear Location");
  const backToSearchText = "Back to Search";

  // HOOK 1: Load saved ZIP code on mount
  useEffect(() => {
    // Reading the corrected key: SAVED_ZIP
    AsyncStorage.getItem(SAVED_ZIP).then(savedZipCode => {
      if (savedZipCode) setZipCode(savedZipCode);
    });
  }, []);

  // HOOK 2: Function to handle 'Use My Current Location'
  const handleUseCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      // Get location using the Expo utility
      const position = await getCurrentLocation(); // Throws error if permissions denied/failed
      const { lat: latitude, lng: longitude } = position;

      // Save coordinates and clear saved ZIP
      await AsyncStorage.setItem(SAVED_LAT, latitude.toString());
      await AsyncStorage.setItem(SAVED_LNG, longitude.toString());
      await AsyncStorage.removeItem(SAVED_ZIP);
      
      show("Location Updated: Using your current GPS location for distance calculations.");
      navigation.navigate("Home");

    } catch (error: any) {
      // Catch errors from getCurrentLocation (e.g., Permission not granted, or timeout)
      const errorMessage = error.message || "Could not get your current location. Please enter your zip code.";
      show(`Location Error: ${errorMessage}`);
    } finally {
      setIsGettingLocation(false);
    }
  }, [navigation, show]); // Added navigation and show to dependency array

  // Function to explicitly clear all location data
  const handleClearLocation = useCallback(async () => {
      // Clear local state
      setZipCode('');

      try {
          // CRITICAL: Clear all three storage keys
          await AsyncStorage.removeItem(SAVED_ZIP);
          await AsyncStorage.removeItem(SAVED_LAT);
          await AsyncStorage.removeItem(SAVED_LNG);
          
          show("Location Cleared. Returning to search.");
          navigation.navigate("Home");
      } catch (e) {
          console.error('Failed clearing location keys', e);
          show("Error clearing location. Please try again.");
      }
  }, [navigation, show]);

  // HOOK 3: Function to handle 'Save' button press
  const handleZipCodeSave = useCallback(async () => {
    if (zipCode.trim()) {
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(zipCode.trim())) {
        show("Invalid Zip Code: Please enter a valid 5-digit zip code.");
        return;
      }
      const trimmedZip = zipCode.trim();

      try {
      // Attempt to get coordinates for the ZIP
      const coords = await getCoordinatesForZip(trimmedZip);

      // Set ZIP code in storage
      await AsyncStorage.setItem(SAVED_ZIP, trimmedZip);

      // Clear GPS coords and save new ZIP coordinates
        await AsyncStorage.removeItem(SAVED_LAT); // ✅ Clears GPS
        await AsyncStorage.removeItem(SAVED_LNG); // ✅ Clears GPS

        if (coords) {
          // Clear GPS coords and save new ZIP coordinates
          await AsyncStorage.setItem(SAVED_LAT, coords.lat.toString());
          await AsyncStorage.setItem(SAVED_LNG, coords.lng.toString());
          show(`Location Updated: Zip code ${trimmedZip} converted to coordinates for precise distance calculations.`);
        } else {
          // Clear GPS coords (if they exist)
          await AsyncStorage.removeItem(SAVED_LAT);
          await AsyncStorage.removeItem(SAVED_LNG);
          show(`Location Updated: Zip code ${trimmedZip} saved.`);
        }

      navigation.navigate("Home");
      } catch (error) {
        // Catch any unexpected local errors and still save the ZIP as a fallback
        console.error("Error saving location:", error);
        await AsyncStorage.setItem(SAVED_ZIP, trimmedZip);
        await AsyncStorage.removeItem(SAVED_LAT);
        await AsyncStorage.removeItem(SAVED_LNG);
        show(`Location Updated: Zip code ${trimmedZip} saved (An error occurred).`);
        navigation.navigate("Home");
      }
    }
  }, [zipCode, navigation, show]); // <-- Now this closes the useCallback correctly.

   // HOOK 4: Function to clear the zip code field
  const handleClearZip = useCallback(() => {
    setZipCode("");
    Keyboard.dismiss();
  }, []);
  
  // HOOK 5: Function for 'Back to Search'
  const handleBackToSearch = useCallback(() => {
    navigation.navigate("Home");
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{updateLocationText}</Text>

      {/* Location Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={handleUseCurrentLocation}
          disabled={isGettingLocation}
        >
          <Ionicons name="locate" size={22} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.locationBtnText}>
            {isGettingLocation ? gettingLocationText : useCurrentLocationText}
          </Text>
          {isGettingLocation && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 6 }} />}
        </TouchableOpacity>

        {/* Zip Code Input */}
        <View style={styles.zipRow}>
          <Text style={styles.zipLabel}>{enterZipText}</Text>
          <View style={styles.zipInputRow}>
            <TextInput
              style={styles.zipInput}
              placeholder="93101"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              maxLength={5}
              returnKeyType="done"
              onSubmitEditing={handleZipCodeSave}
            />
            {/* NEW: Clear Button */}
            {zipCode.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearZip}
              >
                <Ionicons name="close-circle" size={24} color="#999" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.saveBtn, !zipCode.trim() && styles.saveBtnDisabled]}
              onPress={handleZipCodeSave}
              disabled={!zipCode.trim()}
            >
              <Text style={styles.saveBtnText}>{saveText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* NEW: Back to Search Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToSearch}
        >
          <Ionicons name="arrow-back" size={20} color="#005191" style={{ marginRight: 6 }} />
          <Text style={styles.backButtonText}>{backToSearchText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  // ... (Header styles removed as they were not used in the return block)
  title: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginVertical: 18 },
  actions: { marginTop: 8 },
  locationBtn: {
    backgroundColor: "#005191", // Updated color to match primary theme
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20
  },
  locationBtnText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 4 },
  zipRow: { marginBottom: 12 },
  zipLabel: { fontSize: 15, color: "#555", marginBottom: 7 },
  zipInputRow: { flexDirection: "row", alignItems: "center" },
  zipInput: {
    flex: 1, backgroundColor: "#fff", paddingVertical: 12, paddingHorizontal: 12,
    fontSize: 17, borderRadius: 9, borderWidth: 1, borderColor: "#e0e0e0",
    marginRight: 9
  },
  clearBtn: {
      position: 'absolute',
      right: 100, // Position it correctly inside the input field area, adjusting for the save button width
      padding: 5,
      zIndex: 10,
  },
  saveBtn: {
    backgroundColor: "#ffb351", // Updated color to match primary theme
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  saveBtnDisabled: { backgroundColor: "#ffe9b5" },
  saveBtnText: { fontWeight: "700", color: "#222", fontSize: 16 },

  // NEW STYLES
  footer: {
    marginTop: 0, // Pushes the footer to the bottom
    paddingTop: 20,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#e6f0ff", // Light blue background
    borderWidth: 1,
    borderColor: "#005191",
  },
  backButtonText: {
    color: "#005191",
    fontSize: 16,
    fontWeight: "600",
  },
});
