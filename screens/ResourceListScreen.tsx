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
import { SafeAreaView } from "react-native-safe-area-context";

type ResourceListRouteProp = RouteProp<HomeStackParamList, "ResourceList">;
// Coordinates interface is simplified as it's only used for homeCoords structure
interface Coordinates {
  lat: number;
  lng: number;
}

const RATE_LIMIT_KEY = "resource_page_fetch_timestamps";
const RATE_WINDOW_MS = 60 * 1000;
const PAGE_SIZE = 20;

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
  
  // STATE
  const [initialZipLoaded, setInitialZipLoaded] = useState(false);
  const [zipCode, setZipCode] = useState(zipParam);
  const [subcat, setSubcat] = useState<string | null>(null);
  const fetchLock = useRef(false);
  const [rateLimited, setRateLimited] = useState(false);

  const queryKey = ["resources", keyword, zipCode, subcat] as const;

  // -------------------------------------------------------------
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY FIRST
  // -------------------------------------------------------------

  // HOOK 1: Synchronous coordinate lookup
  const homeCoords = useMemo(() => {
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
    return null; // Returns null if zip is invalid or not found
}, [zipCode]);

  // HOOK 2: Load initial ZIP from storage and manage loading state
  useEffect(() => {
    // 1. If zip was passed via navigation, we are immediately done.
    if (zipParam) {
      setInitialZipLoaded(true);
      return;
    }

    // 2. If zipParam is empty, check storage and wait.
    AsyncStorage.getItem("saved_zip_code")
      .then((saved) => {
        if (saved) {
          // If a saved ZIP is found, update the state.
          setZipCode(saved);
        }
      })
      .catch(error => {
        console.error("Error reading saved ZIP from storage:", error);
      })
      .finally(() => {
        // 3. CRITICAL: Mark loading complete here
        setInitialZipLoaded(true);
      });
  }, [zipParam]);


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

  // HOOK X: Aggressive Refetch and ZIP Check on Focus
  useFocusEffect(
      useCallback(() => {
          // 1. Re-read saved ZIP on every focus to ensure we catch the cleared state
          AsyncStorage.getItem("saved_zip_code")
            .then((saved) => {
              // If the saved value is null/empty, but our state is 93111,
              // force the state to update to clear homeCoords.
              if (!saved && zipCode) {
                 console.log("Forcing ZIP state clear due to empty AsyncStorage.");
                 setZipCode("");
              } else if (saved && saved !== zipCode) {
                 // Or if AsyncStorage *still* has a value but our state is different
                 setZipCode(saved);
              }
            })
            .finally(() => {
                 // 2. Force the query to re-run with the *current* zipCode state (now cleared)
                 refetch();
            });

      }, [zipCode, refetch])
  );

  // HOOK 7: Refetch resources when homeCoords becomes available (if ZIP was entered later)
  useEffect(() => {
    // If homeCoords changes from null to a valid object, refetch the resources
    if (homeCoords) {
        console.log("📍 Home coordinates loaded. Refetching resources to apply API sorting.");
        refetch(); 
    }
  }, [homeCoords, refetch]);

  // HOOK 8: Memoized resource list processing
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.info}>Loading user location preference...</Text>
      </View>
    );
  }
  
  // 2. Invalid keyword
  if (!keyword?.trim()) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Invalid category.</Text>
      </View>
    );
  }

  // 3. Main resource loading
  if (loadingResources && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.info}>Loading…</Text>
      </View>
    );
  }
  
  // 4. Error state
  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>❌ {error?.message}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.headerBack}
        >
          <MaterialIcons name="arrow-back" size={24} color="#005191" />
          <Text style={styles.headerBackText}>Home</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {`${subcat || keyword} Resources`}
          </Text>
          <Text style={styles.headerSubtitle}>{resources.length} found</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.dropdownWrapper}>
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
      // FIX: Calculate parsed coordinates and validity check here
      const resourceLat = parseFloat(item.address?.latitude || '');
      const resourceLng = parseFloat(item.address?.longitude || '');
      const isResourceLocationValid = !isNaN(resourceLat) && !isNaN(resourceLng);

      // Standard JavaScript logic and control flow goes here
      if (item.address) {
          console.log(`Resource ID: ${getResourceUniqueId(item)}`);
          console.log(`Resource Coords: ${item.address.latitude}, ${item.address.longitude}`);
          // Add log to check validity of home and resource coords
          if (homeCoords && isResourceLocationValid) {
             console.log(`Distance Check: Ready to calculate! Home: ${homeCoords.latitude}, Resource: ${resourceLat}`);
          } else {
             console.log(`Distance Check: NOT ready. HomeCoords: ${!!homeCoords}, Resource Valid: ${isResourceLocationValid}`);
          }
      } else {
          console.log(`Resource ID: ${getResourceUniqueId(item)} - Address missing!`);
      }
      return (
      <ResourceCard
        resource={item}
        distanceMiles={
          // Use the pre-calculated validity and parsed numbers
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
        <Text style={styles.info}>Loading too fast.</Text>
      ) : isFetchingNextPage ? (
        <ActivityIndicator style={styles.footer} />
      ) : null
    }
  />

      {!hasNextPage && (
        <View style={styles.center}>
          <Text style={styles.info}>No more results.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  info: { marginTop: 12, color: "#555" },
  error: { color: "#c00", marginBottom: 12 },
  retryBtn: { backgroundColor: "#005191", padding: 8, borderRadius: 6 },
  retryText: { color: "#fff", fontWeight: "600" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 12,
    marginTop: -60,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    position: "relative",
  },
  headerBack: { flexDirection: "row", alignItems: "center", width: 90, zIndex: 1, },
  headerBackText: { marginLeft: 4, color: "#005191", fontSize: 16 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  headerSubtitle: { fontSize: 15, color: "#666" },
  headerRight: { width: 90 },
  searchSection: { backgroundColor: "white", padding: 12 },
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
  dropdownWrapper: { backgroundColor: "white" },
  footer: { padding: 16 },
});