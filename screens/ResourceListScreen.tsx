import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import {
  useInfiniteQuery,
  InfiniteData,
  QueryFunctionContext,
  useQuery,
} from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";

import {
  fetchResourcesByMainCategory,
  fetchResourcesBySubcategory,
  storeResourceForDetailView,
  getResourceUniqueId,
  ResourcePage,
  haversineDistance,
} from "../api/resourceApi";
import { fetchLocationByZipCode } from "../api/locationApi";
import type { Resource } from "../types/shared-schema";
import type { HomeStackParamList } from "../navigation/AppNavigator";
import { SUBCATEGORIES } from "../taxonomy/officialTaxonomy";

type ResourceListRouteProp = RouteProp<HomeStackParamList, "ResourceList">;
interface Coordinates { latitude: number; longitude: number; }

export default function ResourceListScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<ResourceListRouteProp>();
  const { keyword, zipCode = "", isSubcategory = false } = params || {};

  if (!keyword.trim()) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Invalid category.</Text>
      </View>
    );
  }

  // ZIP → coords
  const { data: homeCoords, isLoading: coordsLoading } = useQuery<Coordinates>(
    { queryKey: ["zipCoords", zipCode], queryFn: () => fetchLocationByZipCode(zipCode), enabled: zipCode.length === 5 }
  );

  // Subcategory filter state
  const [subcat, setSubcat] = useState<string | null>(null);

  const PAGE_SIZE = 20;
  const queryKey = ["resources", keyword, zipCode, subcat] as const;

  // Infinite resources query
  const {
    data,
    isLoading: loadingResources,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<ResourcePage, Error, InfiniteData<ResourcePage>, typeof queryKey, number>({
    queryKey,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }: QueryFunctionContext<typeof queryKey, number>) =>
      subcat
        ? fetchResourcesBySubcategory(subcat, zipCode, pageParam, PAGE_SIZE)
        : isSubcategory
        ? fetchResourcesBySubcategory(keyword, zipCode, pageParam, PAGE_SIZE)
        : fetchResourcesByMainCategory(keyword, pageParam, PAGE_SIZE),
    getNextPageParam: (_, pages) => pages.length * PAGE_SIZE,
    retry: 2,
    staleTime: 300_000,
  });

  // Flatten & dedupe
  const resources = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.items) ?? [];
    return all.filter(
      (r, i, a) =>
        a.findIndex((x) => getResourceUniqueId(x) === getResourceUniqueId(r)) === i
    );
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.headerBack}>
          <MaterialIcons name="arrow-back" size={24} color="#005191" />
          <Text style={styles.headerBackText}>Home</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{(subcat || keyword) + " Resources"}</Text>
          <Text style={styles.headerSubtitle}>{resources.length} found</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Subcategory Filter */}
      <View style={styles.dropdownWrapper}>
        <SubcategoryDropdown
          categoryKeyword={keyword.toLowerCase()}
          selectedSubcategory={subcat}
          onSelectSubcategory={(name) => {
            setSubcat(name);
            refetch();
          }}
        />
      </View>

      {/* Resource List */}
      <FlatList
        data={resources}
        renderItem={({ item }) => {
          const dist =
            homeCoords &&
            item.address?.latitude &&
            item.address.longitude
              ? haversineDistance(
                  homeCoords.latitude,
                  homeCoords.longitude,
                  Number(item.address.latitude),
                  Number(item.address.longitude)
                )
              : undefined;
          return (
            <ResourceCard
              resource={item}
              distanceMiles={dist}
              onPress={async () => {
                const id = getResourceUniqueId(item);
                if (!id) return;
                await storeResourceForDetailView(item);
                navigation.navigate("ResourceDetail", {
                  resourceId: id,
                  backToList: { keyword, zipCode, isSubcategory, selectedSubcategory: subcat },
                });
              }}
            />
          );
        }}
        keyExtractor={(item, i) => getResourceUniqueId(item) || `res-${i}`}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null
        }
      />
    </View>
  );
}

// SubcategoryDropdown component
function SubcategoryDropdown({
  categoryKeyword,
  selectedSubcategory,
  onSelectSubcategory,
}: {
  categoryKeyword: string;
  selectedSubcategory: string | null;
  onSelectSubcategory: (name: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const subs = SUBCATEGORIES[categoryKeyword] || [];
  if (!subs.length) return null;

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} style={styles.dropdownButton}>
        <Text style={styles.dropdownButtonText}>{selectedSubcategory || "All Subcategories"}</Text>
        <MaterialIcons name={open ? "expand-less" : "expand-more"} size={24} color="#005191" />
      </TouchableOpacity>
      {open && (
        <ScrollView style={styles.dropdownList}>
          <TouchableOpacity
            onPress={() => { onSelectSubcategory(null); setOpen(false); }}
            style={styles.dropdownItem}
          >
            <Text style={[styles.dropdownItemText, !selectedSubcategory && styles.dropdownItemSelected]}>
              All Subcategories
            </Text>
          </TouchableOpacity>
          {subs.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              onPress={() => { onSelectSubcategory(sub.name); setOpen(false); }}
              style={styles.dropdownItem}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedSubcategory === sub.name && styles.dropdownItemSelected,
                ]}
              >
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ResourceCard component
function ResourceCard({ resource, distanceMiles, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{resource.nameServiceAtLocation || resource.nameService}</Text>
      {distanceMiles != null && <Text style={styles.distance}>{distanceMiles.toFixed(1)} mi</Text>}
      <Text style={styles.sub}>{resource.nameOrganization}</Text>
      <Text style={styles.address}>
        {[
          resource.address?.streetAddress,
          resource.address?.city,
          resource.address?.stateProvince,
          resource.address?.postalCode,
        ]
          .filter(Boolean)
          .join(", ")}
      </Text>
    </TouchableOpacity>
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
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "white", padding: 12, borderBottomWidth: 1, borderBottomColor: "#ddd"
  },
  headerBack: { flexDirection: "row", alignItems: "center" },
  headerBackText: { marginLeft: 4, color: "#005191", fontSize: 16 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  headerSubtitle: { fontSize: 14, color: "#666" },
  headerRight: { width: 60 },
  dropdownWrapper: { backgroundColor: "white" },
  dropdownContainer: { padding: 12 },
  dropdownButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownButtonText: { fontSize: 16 },
  dropdownList: { maxHeight: 200, backgroundColor: "white" },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  dropdownItemText: { fontSize: 16 },
  dropdownItemSelected: { fontWeight: "600", color: "#005191" },
  card: { backgroundColor: "#fff", margin: 16, padding: 14, borderRadius: 8 },
  title: { fontSize: 17, fontWeight: "600" },
  distance: { fontSize: 14, color: "#555" },
  sub: { fontSize: 14, color: "#555" },
  address: { fontSize: 12, color: "#777", fontStyle: "italic" },
  footer: { padding: 16 },
});
