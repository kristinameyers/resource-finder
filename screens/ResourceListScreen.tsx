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
} from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";

import {
  fetchResourcesByMainCategory,
  fetchResourcesBySubcategory,
  storeResourceForDetailView,
  getResourceUniqueId,
  ResourcePage,
} from "../api/resourceApi";
import type { Resource } from "../types/shared-schema";
import type { HomeStackParamList } from "../navigation/AppNavigator";
import { SUBCATEGORIES } from "../taxonomy/officialTaxonomy";

type ResourceListRouteProp = RouteProp<HomeStackParamList, "ResourceList">;

function SubcategoryDropdown({
  categoryKeyword,
  selectedSubcategory,
  onSelectSubcategory,
}: {
  categoryKeyword: string;
  selectedSubcategory: string | null;
  onSelectSubcategory: (name: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const subs = SUBCATEGORIES[categoryKeyword] || [];
  if (!subs.length) return null;

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen((o) => !o)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedSubcategory || "All Subcategories"}
        </Text>
        <MaterialIcons
          name={isOpen ? "expand-less" : "expand-more"}
          size={24}
          color="#005191"
        />
      </TouchableOpacity>
      {isOpen && (
        <ScrollView style={styles.dropdownList}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onSelectSubcategory(null);
              setIsOpen(false);
            }}
          >
            <Text
              style={[
                styles.dropdownItemText,
                !selectedSubcategory && styles.dropdownItemSelected,
              ]}
            >
              All Subcategories
            </Text>
          </TouchableOpacity>
          {subs.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={styles.dropdownItem}
              onPress={() => {
                onSelectSubcategory(sub.name);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedSubcategory === sub.name &&
                    styles.dropdownItemSelected,
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

function ResourceCard({
  resource,
  onPress,
}: {
  resource: Resource;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>
        {resource.nameServiceAtLocation || resource.nameService || "Unknown"}
      </Text>
      {resource.nameOrganization && (
        <Text style={styles.sub}>{resource.nameOrganization}</Text>
      )}
      {resource.address && (
        <Text style={styles.address}>
          {resource.address.streetAddress
            ? resource.address.streetAddress + ", "
            : ""}
          {resource.address.city
            ? resource.address.city + ", "
            : ""}
          {resource.address.stateProvince} {resource.address.postalCode}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function ResourceListScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<ResourceListRouteProp>();
  const { keyword, zipCode, isSubcategory = false } = params || {};
  if (!keyword?.trim()) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          Invalid category. Go back and select a valid one.
        </Text>
      </View>
    );
  }

  const [subcat, setSubcat] = useState<string | null>(null);
  const PAGE_SIZE = 20;
  const queryKey = ["resources", keyword, zipCode, subcat] as const;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<
    ResourcePage,
    Error,
    InfiniteData<ResourcePage>,
    typeof queryKey
  >({
    queryKey,
    queryFn: async (ctx: QueryFunctionContext<typeof queryKey, unknown>) => {
      const page = (ctx.pageParam as number) ?? 0;
      if (subcat)
        return fetchResourcesBySubcategory(subcat, zipCode, page, PAGE_SIZE);
      if (isSubcategory)
        return fetchResourcesBySubcategory(
          keyword,
          zipCode,
          page,
          PAGE_SIZE
        );
      return fetchResourcesByMainCategory(keyword, page, PAGE_SIZE);
    },
    getNextPageParam: (last, pages) =>
      last.hasMore ? pages.reduce((s, p) => s + p.items.length, 0) : undefined,
    initialPageParam: 0,
    retry: 2,
    staleTime: 300_000,
  });

  const resources = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.items) ?? [];
    return all.filter(
      (r, i, a) =>
        a.findIndex((x) => getResourceUniqueId(x) === getResourceUniqueId(r)) ===
        i
    );
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  if (isLoading) {
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
        <Text style={styles.error}>❌ {error.message}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SubcategoryDropdown
        categoryKeyword={keyword.toLowerCase()}
        selectedSubcategory={subcat}
        onSelectSubcategory={setSubcat}
      />
      <FlatList
        data={resources}
        renderItem={({ item }) => (
          <ResourceCard
            resource={item}
            onPress={async () => {
              const id = getResourceUniqueId(item);
              if (!id) return;
              await storeResourceForDetailView(item);
              navigation.navigate("ResourceDetail", { resourceId: id });
            }}
          />
        )}
        keyExtractor={(item, i) =>
          getResourceUniqueId(item) || `res-${i}`
        }
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  list: { paddingBottom: 12 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  info: { marginTop: 12, color: "#555" },
  error: { color: "#c00", marginBottom: 12 },
  retryBtn: { backgroundColor: "#005191", padding: 8, borderRadius: 6 },
  retryText: { color: "#fff", fontWeight: "600" },
  dropdownContainer: { backgroundColor: "white", padding: 12, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  dropdownButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownButtonText: { fontSize: 16, color: "#333" },
  dropdownList: { maxHeight: 300, marginTop: 8 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  dropdownItemText: { fontSize: 16 },
  dropdownItemSelected: { color: "#005191", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    margin: 16,
    elevation: 2,
  },
  title: { fontSize: 17, fontWeight: "600", color: "#222" },
  sub: { fontSize: 14, color: "#555", marginBottom: 4 },
  address: { fontSize: 12, color: "#777", fontStyle: "italic" },
  footer: { padding: 16 },
});
