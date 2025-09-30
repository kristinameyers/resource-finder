import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
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
import ZipOutOfServiceScreen from '../components/ZipOutOfServiceScreen';
import {
  useRoute,
  RouteProp,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

import {
  fetchResourcesByMainCategory,
  fetchResourcesBySubcategory,
  storeResourceForDetailView,
  getResourceUniqueId,
  haversineDistance,
} from "../api/resourceApi";
import {
  ResourcePage,
} from "../types/shared-schema";
import { fetchLocationByZipCode } from "../api/locationApi";
import type { HomeStackParamList } from "../navigation/AppNavigator";
import SubcategoryDropdown from "../components/SubcategoryDropdown";
import ResourceCard from "../components/ResourceCard";

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

  const [isZipOutOfService, setIsZipOutOfService] = useState(false);
  const [zipCode, setZipCode] = useState(zipParam);
  const [subcat, setSubcat] = useState<string | null>(null);
  const fetchLock = useRef(false);
  const [rateLimited, setRateLimited] = useState(false);

  useFocusEffect(useCallback(() => setSubcat(null), [keyword, zipCode]));

  useEffect(() => {
    AsyncStorage.getItem("saved_zip_code").then((saved) => {
      if (saved) setZipCode(saved);
    });
  }, []);

  // Fetch main resource data
  const queryKey = ["resources", keyword, zipCode, subcat] as const;
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

  // Watch for zip fallback
  useEffect(() => {
    if (data?.pages && data.pages[0]?.usedCountyInstead) {
      setIsZipOutOfService(true);
    } else {
      setIsZipOutOfService(false);
    }
  }, [data]);

  // Fetch origin coordinates for distance calc
  const { data: homeCoords, isLoading: coordsLoading } = useQuery<Coordinates>({
    queryKey: ["zipCoords", zipCode],
    queryFn: () => fetchLocationByZipCode(zipCode),
    enabled: zipCode.length === 5,
  });

  const handleZipChange = useCallback((z: string) => setZipCode(z), []);
  const handleSaveZip = useCallback(async () => {
    Keyboard.dismiss();
    await AsyncStorage.setItem("saved_zip_code", zipCode);
  }, [zipCode]);
  const handleClearZip = useCallback(async () => {
    setZipCode("");
    await AsyncStorage.removeItem("saved_zip_code");
  }, []);

  if (isZipOutOfService) {
    return (
      <ZipOutOfServiceScreen onStartNewSearch={() => navigation.replace('Home')} />
    );
  }

  if (!keyword?.trim()) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Invalid category.</Text>
      </View>
    );
  }

  const resources = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.items) ?? [];
    const deduped = all.filter(
      (r, i, a) =>
        r &&
        a.findIndex((x) => x && getResourceUniqueId(x) === getResourceUniqueId(r)) === i
    );
    if (homeCoords) {
      return deduped.sort((a, b) => {
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
    return deduped;
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

  // ----- HEADER STRUCTURE: This guarantees center alignment -----
  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={styles.headerBack}
          >
            <MaterialIcons name="arrow-back" size={24} color="#005191" />
            <Text style={styles.headerBackText}>Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
            {subcat ? subcat : keyword}
          </Text>
          <Text style={styles.headerSubtitle}>
            {resources.length} found
          </Text>
        </View>
        <View style={styles.headerSide}>{/* Placeholder, retains symmetry */}</View>
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
            onPress={async () => {
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
            }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  message: { fontSize: 18, color: "#c00", marginBottom: 20, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: { backgroundColor: "#005191", padding: 12, borderRadius: 6 },
  buttonText: { color: "white", fontSize: 16 },
  info: { marginTop: 12, color: "#555" },
  error: { color: "#c00", marginBottom: 12 },
  retryBtn: { backgroundColor: "#005191", padding: 8, borderRadius: 6 },
  retryText: { color: "#fff", fontWeight: "600" },
  headerBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerSide: {
    width: 70, // enough space for the back button + "Home"
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerBack: { flexDirection: "row", alignItems: "center" },
  headerBackText: { marginLeft: 4, color: "#005191", fontSize: 16 },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    paddingBottom: 2,
    color: "#000000",
    textAlign: "center",
  },
  headerSubtitle: { fontSize: 16, color: "#666" },
  searchSection: { backgroundColor: "white", padding: 12 },
  dropdownWrapper: { backgroundColor: "white", width: "100%" },
  footer: { padding: 16 },
});
