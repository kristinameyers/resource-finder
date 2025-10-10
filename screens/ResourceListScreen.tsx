import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
// React Native components
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  Keyboard,
} from "react-native";
// Navigation and data fetching
import {
  useRoute,
  RouteProp,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
// React Query
import {
  useInfiniteQuery,
} from "@tanstack/react-query";
// Async Storage for rate limiting
import AsyncStorage from "@react-native-async-storage/async-storage";
// Icons
import { MaterialIcons } from "@expo/vector-icons";
// API functions
import {
  fetchResourcesByMainCategory,
  fetchResourcesBySubcategory,
  storeResourceForDetailView,
  getResourceUniqueId,
  ResourcePage,
} from "../api/resourceApi";
// Use local lookup instead of API
import { getCoordinatesByZip, haversineDistance } from '../utils/zip/zipLookup';
// Types
import type { FavoriteResource } from "../contexts/FavoritesContext";
import type { Resource } from "../types/shared-schema";
import type { HomeStackParamList } from "../navigation/AppNavigator";
import SubcategoryDropdown from "../components/SubcategoryDropdown";
import ResourceCard from "../components/ResourceCard";
// 🎯 NEW IMPORT: ResourceCardSkeleton
import ResourceCardSkeleton from "../components/ResourceCardSkeleton"; 
import { SafeAreaView } from "react-native-safe-area-context";
// 👈 NEW IMPORTS:
import { useAccessibility } from "../contexts/AccessibilityContext";

// GPS Async Storage Keys
const SAVED_LAT = "userLatitude";
const SAVED_LNG = "userLongitude";
const SAVED_ZIP = "saved_zip_code";

type ResourceListRouteProp = RouteProp<HomeStackParamList, "ResourceList">;
// Coordinates interface is simplified as it's only used for homeCoords structure
interface Coordinates {
  lat: number;
  lng: number;
}

const RATE_LIMIT_KEY = "resource_page_fetch_timestamps";
const RATE_WINDOW_MS = 60 * 1000;
const PAGE_SIZE = 20;

// Scaling Constants (Not needed if using getFontSize from context)
// const FONT_SCALING = { ... };


async function canFetchPage() {
  try {
    const now = Date.now();
    const raw = (await AsyncStorage.getItem(RATE_LIMIT_KEY)) ?? "[]";
    const times: number[] = JSON.parse(raw);
    const recent = times.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length < 10) {
      recent.push(now);
      await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export default function ResourceListScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<ResourceListRouteProp>();
  const { keyword, zipCode: zipParam = "", isSubcategory = false } = params ?? {};
  
  // ✅ HOOK for Accessibility Context: Get theme and getFontSize
  const { theme, getFontSize } = useAccessibility();

  // ❌ Removed: Font Scaling Function Definition (using getFontSize instead)
  // const getScaledFontSize = (base: number) => { ... };
  
  // STATE
  const [initialZipLoaded, setInitialZipLoaded] = useState(false);
  const [zipCode, setZipCode] = useState(zipParam);
  const [homeLat, setHomeLat] = useState<number | null>(null);
  const [homeLng, setHomeLng] = useState<number | null>(null);
  const [subcat, setSubcat] = useState<string | null>(null);
  const fetchLock = useRef(false);
  const [rateLimited, setRateLimited] = useState(false);

  const queryKey = ["resources", keyword, zipCode, subcat] as const;

  // -------------------------------------------------------------
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY FIRST
  // -------------------------------------------------------------

  // HOOK 1: Synchronous coordinate lookup
  const homeCoords = useMemo(() => {
    // 1. Check for GPS coordinates first (Highest Priority)
    if (homeLat && homeLng) {
        console.log('Memo running. Using GPS Coords.');
        return { latitude: homeLat, longitude: homeLng }; 
    }

    // 2. Fallback to ZIP code lookup
    const cleanedZip = zipCode?.trim();
    console.log('Memo running. Current ZIP code state:', cleanedZip);
    
    if (cleanedZip && cleanedZip.length === 5) {
        // NOTE: Assuming getCoordinatesByZip returns { lat, lng }
        const coords = getCoordinatesByZip(cleanedZip);

        // Ensure coordinates are valid numbers before returning
        if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
             // Return object matching the expected structure
            return { latitude: coords.lat, longitude: coords.lng }; 
        }
    }
    return null; // Returns null if no valid location is found
}, [zipCode, homeLat, homeLng]); // IMPORTANT: Add GPS state to dependencies!

  // HOOK 2: Load initial location from storage and manage loading state
  useEffect(() => {
    const loadLocation = async () => {
      // If zip was passed via navigation, we trust it and are done.
        // The zipCode state is already initialized with zipParam.
        if (zipParam) {
            setInitialZipLoaded(true);
            return;
        }

      // --- Check GPS Coordinates ---
        const [savedLatRaw, savedLngRaw] = await Promise.all([
            AsyncStorage.getItem(SAVED_LAT),
            AsyncStorage.getItem(SAVED_LNG),
            // The saved ZIP key should be consistently used
        ]);
        const savedLat = savedLatRaw ? parseFloat(savedLatRaw) : null;
        const savedLng = savedLngRaw ? parseFloat(savedLngRaw) : null;

        if (savedLat && savedLng) {
            // Found GPS: Set GPS state, clear ZIP state (if it was set by error/old run)
            setHomeLat(savedLat);
            setHomeLng(savedLng);
            setZipCode(''); 
        } else {
            // --- Fallback to Saved ZIP ---
            const savedZip = await AsyncStorage.getItem(SAVED_ZIP);
            if (savedZip) {
                setZipCode(savedZip);
            }
            // If nothing is found, zipCode remains ''
        }
        
        setInitialZipLoaded(true);
    };

    // Only run this effect once on component mount
    loadLocation(); 
}, []); // <-- CRITICAL: Empty dependency array ensures one run only

  // HOOK 3: Navigation logic for detail screen
  const handleCardPress = useCallback(
    async (item: Resource & FavoriteResource) => {
      const id = getResourceUniqueId(item);
      if (!id) return;
      await storeResourceForDetailView(item);
      
      navigation.navigate("ResourceDetail", {
        resourceId: id,
        backToList: {
          keyword,
          zipCode,
          isSubcategory,
          selectedSubcategory: subcat,
        },
      });
    },
    [navigation, keyword, zipCode, isSubcategory, subcat]
  );

  // HOOK 4: Clear subcategory on focus
  useFocusEffect(useCallback(() => setSubcat(null), [keyword, zipCode]));

  // HOOK 5: ZIP code state handlers (kept for completeness, though not used in list view)
  const handleZipChange = useCallback((z: string) => setZipCode(z), []);
  const handleSaveZip = useCallback(async () => {
    Keyboard.dismiss();
    await AsyncStorage.setItem("saved_zip_code", zipCode);
  }, [zipCode]);
  const handleClearZip = useCallback(async () => {
    setZipCode("");
    await AsyncStorage.removeItem("saved_zip_code");
  }, []);

  // HOOK 6: Infinite Query for Resources
  const {
    data,
    isLoading: loadingResources,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) =>
      subcat
        ? fetchResourcesBySubcategory(subcat, zipCode, pageParam as number, PAGE_SIZE)
        : isSubcategory
        ? fetchResourcesBySubcategory(keyword, zipCode, pageParam as number, PAGE_SIZE)
        : fetchResourcesByMainCategory(keyword, zipCode, pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage: ResourcePage) =>
      lastPage.hasMore ? lastPage.items.length : undefined,
    retry: 2,
  });

  // HOOK 7: Aggressive Refetch and ZIP Check on Focus
  useFocusEffect(
    useCallback(() => {
        const checkLocationState = async () => {
            // Check all three keys
            const [savedZip, savedLatRaw, savedLngRaw] = await Promise.all([
                AsyncStorage.getItem(SAVED_ZIP), // <-- Use your actual ZIP key
                AsyncStorage.getItem(SAVED_LAT),
                AsyncStorage.getItem(SAVED_LNG),
            ]);

            const savedLat = savedLatRaw ? parseFloat(savedLatRaw) : null;
            const savedLng = savedLngRaw ? parseFloat(savedLngRaw) : null;

            let shouldRefetch = false;

            if (savedLat && savedLng) {
                // If GPS is found, set GPS state and clear ZIP state
                if (homeLat !== savedLat || homeLng !== savedLng || zipCode !== '') {
                    setHomeLat(savedLat);
                    setHomeLng(savedLng);
                    setZipCode('');
                    shouldRefetch = true;
                }
            } else if (savedZip) {
                // If only ZIP is found, set ZIP state and clear GPS state
                if (zipCode !== savedZip || homeLat !== null || homeLng !== null) {
                    setZipCode(savedZip);
                    setHomeLat(null);
                    setHomeLng(null);
                    shouldRefetch = true;
                }
            } else {
                // No location saved, ensure all state is cleared
                if (zipCode !== '' || homeLat !== null || homeLng !== null) {
                    setZipCode('');
                    setHomeLat(null);
                    setHomeLng(null);
                    shouldRefetch = true;
                }
            }
            
            // Only refetch if a state change occurred
            if (shouldRefetch) {
                console.log("HOOK X: State changed, forcing refetch.");
                refetch();
            }
        };

        checkLocationState();

    }, [zipCode, homeLat, homeLng, refetch])
);

  // HOOK 8: Refetch resources when homeCoords becomes available (if ZIP was entered later)
  useEffect(() => {
    // If homeCoords changes from null to a valid object, refetch the resources
    if (homeCoords) {
        console.log("📍 Home coordinates loaded. Refetching resources to apply API sorting.");
        refetch(); 
    }
  }, [homeCoords, refetch]);

  // HOOK 9: Memoized resource list processing
  const resources = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.items) ?? [];

    console.log('Final Home Zip:', zipCode);
    console.log('Final Home Coords:', homeCoords); // Logs for final verification

    // 1. Deduplication
    const deduped = all.filter(
      (r, i, a) =>
        r &&
        getResourceUniqueId(r) &&
        a.findIndex((x) => x && getResourceUniqueId(x) === getResourceUniqueId(r)) === i
    ) as (Resource & FavoriteResource)[];

    // 🌟 Mapping/Normalization
    const resourcesForDisplay = deduped.map(r => {
      const apiResource = r as any; 
      const primaryName = (
        apiResource.nameServiceAtLocation || 
        apiResource.nameService || 
        apiResource.name ||
        apiResource.organization || 
        'Unknown Service Name'
      );  
      const orgName = apiResource.organization || apiResource.organizationName;
      
      return ({
        ...r,
        id: getResourceUniqueId(r) || r.id, 
        name: primaryName,
        organization: orgName,
      });
    }) as (Resource & FavoriteResource)[];

    // 2. Immutability and Sorting
    const sortableResources = [...resourcesForDisplay];

    // Sort by distance if we have homeCoords
    if (homeCoords) {
      return sortableResources.sort((a, b) => {
        // FIX: Robust Number Parsing for Sorting Logic
        const aLat = parseFloat(a.address?.latitude || '');
        const aLng = parseFloat(a.address?.longitude || '');
        const bLat = parseFloat(b.address?.latitude || '');
        const bLng = parseFloat(b.address?.longitude || '');

        const aDist = 
          !isNaN(aLat) && !isNaN(aLng)
          ? haversineDistance(
              homeCoords.latitude,
              homeCoords.longitude,
              aLat,
              aLng
            )
          : Infinity;
          
        const bDist = 
          !isNaN(bLat) && !isNaN(bLng)
          ? haversineDistance(
              homeCoords.latitude,
              homeCoords.longitude,
              bLat,
              bLng
            )
          : Infinity;
        
        return aDist - bDist;
      });
    }

    return resourcesForDisplay; 
  }, [data, homeCoords]);

  // Function for loading next page
  const loadMore = async () => {
    if (rateLimited || fetchLock.current || !hasNextPage) return;
    if (!(await canFetchPage())) {
      setRateLimited(true);
      setTimeout(() => setRateLimited(false), RATE_WINDOW_MS);
      Alert.alert("Limit reached", "Wait before loading more.");
      return;
    }
    fetchLock.current = true;
    fetchNextPage().finally(() => (fetchLock.current = false));
  };
  
  // -------------------------------------------------------------
  // CONDITIONAL RETURNS (After all hooks are called)
  // -------------------------------------------------------------
  
  // 1. Wait for initial ZIP loading
  if (!initialZipLoaded) {
    return (
      // ✅ HC: Apply background color
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        {/* FONT SCALING & HC: info (Base 15) */}
        <Text style={[styles.info, { fontSize: getFontSize(15), color: theme.textSecondary }]}>Loading user location preference...</Text>
      </View>
    );
  }
  
  // 2. Invalid keyword
  if (!keyword?.trim()) {
    return (
      // ✅ HC: Apply background color
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        {/* FONT SCALING & HC: error (Base 16) */}
        <Text style={[styles.error, { fontSize: getFontSize(16), color: theme.primary }]}>❌ Invalid category.</Text>
      </View>
    );
  }

  // 3. Main resource loading
  if (loadingResources && !data) {
    return (
      // 🎯 MODIFICATION: Replace ActivityIndicator with ResourceCardSkeleton
      <View style={[styles.container, { backgroundColor: theme.background, paddingVertical: 12 }]}>
        {/* Render 8 ResourceCardSkeleton components while loading */}
        {[...Array(8)].map((_, index) => (
          <ResourceCardSkeleton key={index} />
        ))}
      </View>
    );
  }
  
  // 4. Error state
  if (isError) {
    return (
      // ✅ HC: Apply background color
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        {/* FONT SCALING & HC: error (Base 16) */}
        <Text style={[styles.error, { fontSize: getFontSize(16), color: theme.primary }]}>❌ {error?.message}</Text>
        {/* ✅ HC: Apply button colors */}
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={() => refetch()}>
          {/* FONT SCALING & HC: retryText (Base 16) */}
          <Text style={[styles.retryText, { fontSize: getFontSize(16), color: theme.backgroundSecondary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // ✅ HC: Apply container background color
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ✅ HC: Apply header background and border colors */}
      <View style={[styles.headerContainer, { 
        backgroundColor: theme.backgroundSecondary,
        borderBottomColor: theme.border,
      }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.headerBack}
        >
          {/* ✅ HC: Apply icon color */}
          <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
          {/* FONT SCALING & HC: headerBackText (Base 16) */}
          <Text style={[styles.headerBackText, { fontSize: getFontSize(16), color: theme.primary }]}>Home</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {/* FONT SCALING & HC: headerTitle (Base 16) */}
          <Text style={[styles.headerTitle, { fontSize: getFontSize(16), color: theme.text }]}>
            {`${subcat || keyword} Resources`}
          </Text>
          {/* FONT SCALING & HC: headerSubtitle (Base 15) */}
          <Text style={[styles.headerSubtitle, { fontSize: getFontSize(15), color: theme.textSecondary }]}>{resources.length} found</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* ✅ HC: Apply dropdown wrapper background color */}
      <View style={[styles.dropdownWrapper, { backgroundColor: theme.backgroundSecondary }]}>
        <SubcategoryDropdown
          categoryKeyword={keyword.toLowerCase()}
          selectedSubcategory={subcat}
          onSelectSubcategory={(name: string | null) => {
            setSubcat(name);
            refetch();
          }}
        />
      </View>

      <FlatList
    data={resources}
    renderItem={({ item }) => {
      // ... (Rest of renderItem logic remains the same)
      const resourceLat = parseFloat(item.address?.latitude || '');
      const resourceLng = parseFloat(item.address?.longitude || '');
      const isResourceLocationValid = !isNaN(resourceLat) && !isNaN(resourceLng);

      if (item.address) {
          console.log(`Resource ID: ${getResourceUniqueId(item)}`);
          console.log(`Resource Coords: ${item.address.latitude}, ${item.address.longitude}`);
          if (homeCoords && isResourceLocationValid) {
             console.log(`Distance Check: Ready to calculate! Home: ${homeCoords.latitude}, Resource: ${resourceLat}`);
          } else {
             console.log(`Distance Check: NOT ready. HomeCoords: ${!!homeCoords}, Resource Valid: ${isResourceLocationValid}`);
          }
      } else {
          console.log(`Resource ID: ${getResourceUniqueId(item)} - Address missing!`);
      }
      return (
      // NOTE: ResourceCard must be updated to use the context internally for its colors
      <ResourceCard
        resource={item}
        distanceMiles={
          homeCoords && isResourceLocationValid
            ? haversineDistance(
                homeCoords.latitude,
                homeCoords.longitude,
                resourceLat,
                resourceLng
              )
            : undefined
        }
        onPress={() => handleCardPress(item)} 
      />
      );
    }}
    keyExtractor={(item, idx) =>
      getResourceUniqueId(item) ?? `res-${idx}`
    }
    onEndReached={loadMore}
    onEndReachedThreshold={0.8}
    ListFooterComponent={
      rateLimited ? (
        // FONT SCALING & HC: info (Base 15)
        <Text style={[styles.info, { fontSize: getFontSize(15), color: theme.textSecondary }]}>Loading too fast.</Text>
      ) : isFetchingNextPage ? (
        <ActivityIndicator style={styles.footer} color={theme.primary} />
      ) : null
    }
  />

      {!hasNextPage && (
        // ✅ HC: Apply background color for the 'No more results' message area
        <View style={[styles.center, { flex: 0, paddingVertical: 16, backgroundColor: theme.background }]}>
          {/* FONT SCALING & HC: info (Base 15) */}
          <Text style={[styles.info, { fontSize: getFontSize(15), color: theme.textSecondary }]}>No more results.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Stylesheet: Removed hardcoded colors where they were overridden inline
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" }, // Overridden inline
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  info: { marginTop: 12, color: "#555" }, // Overridden inline
  error: { color: "#c00", marginBottom: 12 }, // Overridden inline
  retryBtn: { backgroundColor: "#005191", padding: 8, borderRadius: 6 }, // Overridden inline
  retryText: { color: "#fff", fontWeight: "600" }, // Overridden inline
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white", // Overridden inline
    padding: 12,
    marginTop: -60,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // Overridden inline
    position: "relative",
  },
  headerBack: { flexDirection: "row", alignItems: "center", width: 90, zIndex: 1, },
  headerBackText: { marginLeft: 4, color: "#005191", fontSize: 16 }, // Overridden inline
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "600" }, // Overridden inline
  headerSubtitle: { fontSize: 15, color: "#666" }, // Overridden inline
  headerRight: { width: 90 },
  searchSection: { backgroundColor: "white", padding: 12 }, // Not visible/used in final view
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdfdfd",
    borderRadius: 8,
    padding: 10,
  },
  locationInput: { flex: 1, marginLeft: 8, fontSize: 16, color: "#333" }, 
  clearButton: {
    marginLeft: 8,
    backgroundColor: "#dc3545",
    paddingHorizontal: 2,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: { color: "white", fontSize: 14 },
  saveButton: {
    marginLeft: 8,
    backgroundColor: "#005191",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: { color: "white", fontSize: 14 },
  dropdownWrapper: { backgroundColor: "white" }, // Overridden inline
  footer: { padding: 16 },
});