import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Keyboard } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "@sb211/hooks/use-toast";
import { getCoordinatesFromZipCode } from "src/utils/distanceUtils";
import { useTranslatedText } from "../components/TranslatedText";

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
  const { toast } = useToast();
  const { text: sb211Text } = useTranslatedText("Santa Barbara 211");
  const { text: searchCategoryText } = useTranslatedText("Search Category");
  const { text: searchKeywordText } = useTranslatedText("Search Keyword");
  const { text: updateLocationText } = useTranslatedText("Update Your Location");
  const { text: useCurrentLocationText } = useTranslatedText("Use My Current Location");
  const { text: gettingLocationText } = useTranslatedText("Getting Location...");
  const { text: enterZipText } = useTranslatedText("Enter Zip Code");
  const { text: saveText } = useTranslatedText("Save");

  useEffect(() => {
    // Load saved zip code from AsyncStorage
    AsyncStorage.getItem("userZipCode").then(savedZipCode => {
      if (savedZipCode) setZipCode(savedZipCode);
    });
  }, []);

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          await AsyncStorage.setItem("userLatitude", latitude.toString());
          await AsyncStorage.setItem("userLongitude", longitude.toString());
          await AsyncStorage.removeItem("userZipCode");
          toast({
            title: "Location Updated",
            description: "Using your current GPS location for distance calculations.",
          });
          navigation.navigate("Home");
        },
        error => {
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please enter your zip code.",
            variant: "destructive",
          });
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your current location. Please enter your zip code.",
        variant: "destructive",
      });
      setIsGettingLocation(false);
    }
  };

  const handleZipCodeSave = async () => {
    if (zipCode.trim()) {
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(zipCode.trim())) {
        toast({
          title: "Invalid Zip Code",
          description: "Please enter a valid 5-digit zip code.",
          variant: "destructive",
        });
        return;
      }
      try {
        const coords = await getCoordinatesFromZipCode(zipCode.trim());
        if (coords) {
          await AsyncStorage.setItem("userLatitude", coords.lat.toString());
          await AsyncStorage.setItem("userLongitude", coords.lng.toString());
          await AsyncStorage.setItem("userZipCode", zipCode.trim());
          toast({
            title: "Location Updated",
            description: `Zip code ${zipCode.trim()} converted to coordinates for precise distance calculations.`,
          });
        } else {
          await AsyncStorage.setItem("userZipCode", zipCode.trim());
          await AsyncStorage.removeItem("userLatitude");
          await AsyncStorage.removeItem("userLongitude");
          toast({
            title: "Location Updated",
            description: `Zip code ${zipCode.trim()} saved (coordinate lookup unavailable).`,
          });
        }
        navigation.navigate("Home");
      } catch (error) {
        await AsyncStorage.setItem("userZipCode", zipCode.trim());
        await AsyncStorage.removeItem("userLatitude");
        await AsyncStorage.removeItem("userLongitude");
        toast({
          title: "Location Updated",
          description: `Zip code ${zipCode.trim()} saved (coordinate lookup failed).`,
        });
        navigation.navigate("Home");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{sb211Text}</Text>
      </View>
      {/* Search Type Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => navigation.navigate("SearchCategory")}
        >
          <Text style={styles.toggleText}>{searchCategoryText}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => navigation.navigate("SearchKeyword")}
        >
          <Text style={styles.toggleText}>{searchKeywordText}</Text>
        </TouchableOpacity>
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  header: { alignItems: "center", paddingVertical: 20, backgroundColor: "#fff", marginBottom: 10 },
  headerTitle: { fontSize: 23, color: "#005191", fontWeight: "bold" },
  toggleRow: { flexDirection: "row", marginVertical: 12 },
  toggleBtn: {
    flex: 1, padding: 12, borderRadius: 7, alignItems: "center",
    justifyContent: "center", backgroundColor: "#fff", marginHorizontal: 4,
    borderWidth: 1, borderColor: "#eee"
  },
  toggleText: { fontWeight: "bold", color: "#222" },
  title: { fontSize: 19, fontWeight: "bold", textAlign: "center", marginVertical: 18 },
  actions: { marginTop: 8 },
  locationBtn: {
    backgroundColor: "#257", paddingVertical: 13,
    borderRadius: 8, alignItems: "center", flexDirection: "row", justifyContent: "center", marginBottom: 20
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
  saveBtn: {
    backgroundColor: "#fbbf24", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 8,
    alignItems: "center", justifyContent: "center"
  },
  saveBtnDisabled: {
    backgroundColor: "#ffe9b5",
  },
  saveBtnText: { fontWeight: "700", color: "#222", fontSize: 16 }
});
