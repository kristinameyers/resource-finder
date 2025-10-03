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
  QueryFunctionContext,
  useQuery,
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
  haversineDistance,
  ResourcePage,
} from "../api/resourceApi";
import { fetchLocationByZipCode } from "../api/locationApi";
// Types
import type { FavoriteResource } from "../contexts/FavoritesContext";
import type { Resource } from "../types/shared-schema";
import type { HomeStackParamList } from "../navigation/AppNavigator";
import SubcategoryDropdown from "../components/SubcategoryDropdown";
import ResourceCard from "../components/ResourceCard";
import { SafeAreaView } from "react-native-safe-area-context";

type ResourceListRouteProp = RouteProp<HomeStackParamList, "ResourceList">;
interface Coordinates {
  latitude: number;
  longitude: number;
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
  const [zipCode, setZipCode] = useState(zipParam);
  const [subcat, setSubcat] = useState<string | null>(null);
  const fetchLock = useRef(false);
  const [rateLimited, setRateLimited] = useState(false);

  const queryKey = ["resources", keyword, zipCode, subcat] as const;

  const handleCardPress = useCallback(
    async (item: Resource & FavoriteResource) => {
      const id = getResourceUniqueId(item);
      if (!id) return;
      await storeResourceForDetailView(item);
      navigation.navigate("ResourceDetail", {
        id: id,
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

  useFocusEffect(useCallback(() => setSubcat(null), [keyword, zipCode]));
  
  // -------------------------------------------------------------
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY BEFORE ANY RETURNS
  // -------------------------------------------------------------

  const { data: homeCoords, isLoading: coordsLoading } = useQuery<Coordinates>({
    queryKey: ["zipCoords", zipCode],
    queryFn: () => fetchLocationByZipCode(zipCode),
    enabled: zipCode.length === 5,
  });

  useEffect(() => {
    // If zipParam is empty (meaning no zip was passed from Home),
    // check storage for a saved one.
    if (!zipParam) { 
      AsyncStorage.getItem("saved_zip_code").then((saved) => {
        if (saved) setZipCode(saved);
      });
    }
  }, [zipParam]);

  const handleZipChange = useCallback((z: string) => setZipCode(z), []);
  const handleSaveZip = useCallback(async () => {
    Keyboard.dismiss();
    await AsyncStorage.setItem("saved_zip_code", zipCode);
  }, [zipCode]);
  const handleClearZip = useCallback(async () => {
    setZipCode("");
    await AsyncStorage.removeItem("saved_zip_code");
  }, []);

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

  const resources = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.items) ?? [];

    // 1. Deduplication
    const deduped = all.filter(
      (r, i, a) =>
        r &&
        // Filter out any resources that don't have a unique ID
        getResourceUniqueId(r) &&
        a.findIndex((x) => x && getResourceUniqueId(x) === getResourceUniqueId(r)) === i
    ) as (Resource & FavoriteResource)[];

    // 🌟 CRITICAL FIX: Explicitly map fields for FavoritesContext
    const resourcesForDisplay = deduped.map(r => {
      // Use explicit type assertion for reliable property access
      const apiResource = r as any; 

      const primaryName = (
        apiResource.nameServiceAtLocation || 
        apiResource.nameService || 
        apiResource.name ||
        apiResource.organization || // Fallback to Organization name if all else fails
        'Unknown Service Name'
      );  
      const orgName = apiResource.organization || apiResource.organizationName;
      
      return ({
        ...r,
        // Guarantee 'id' is present for FavoritesContext
        id: getResourceUniqueId(r) || r.id, 
        // Ensure 'name' is set from the service title
        name: primaryName,
        // Ensure 'organization' is set
        organization: orgName,
      });
    }) as (Resource & FavoriteResource)[];

    // 2. Immutability and Sorting
    const sortableResources = [...resourcesForDisplay];

    // Sort by distance if we have homeCoords
    if (homeCoords) {
      return sortableResources.sort((a, b) => {
        const aDist = a.address?.latitude
          ? haversineDistance(
              homeCoords.latitude,
              homeCoords.longitude,
              Number(a.address.latitude),
              Number(a.address.longitude)
            )
          : Infinity;
        const bDist = b.address?.latitude
          ? haversineDistance(
              homeCoords.latitude,
              homeCoords.longitude,
              Number(b.address.latitude),
              Number(b.address.longitude)
            )
          : Infinity;
        return aDist - bDist;
      });
    }

    // Return the ID/name-corrected array if no sorting is applied
    return resourcesForDisplay; 
  }, [data, homeCoords]);

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
  // CONDITIONAL RETURNS (After all hooks)
  // -------------------------------------------------------------
  
  // 🛠️ FIX: Invalid keyword check moved here, after all Hooks
  if (!keyword?.trim()) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Invalid category.</Text>
      </View>
    );
  }

  if (coordsLoading || loadingResources) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.info}>Loading…</Text>
      </View>
    );
  }
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
    renderItem={({ item }) => (
      <ResourceCard
        resource={item}
        distanceMiles={
          homeCoords && item.address?.latitude
            ? haversineDistance(
                homeCoords.latitude,
                homeCoords.longitude,
                Number(item.address.latitude),
                Number(item.address.longitude)
              )
            : undefined
        }
        onPress={() => handleCardPress(item)} 
      />
    )}
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
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerBack: { flexDirection: "row", alignItems: "center" },
  headerBackText: { marginLeft: 4, color: "#005191", fontSize: 16 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  headerSubtitle: { fontSize: 16, color: "#666" },
  headerRight: { width: 60 },
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
    paddingHorizontal: 12,
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