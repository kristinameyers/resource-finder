// ResourceListScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";

import {
  fetchResourcesByMainCategory,
  fetchResourcesBySubcategory,
} from "../api/resourceApi";
import type { Resource } from "../types/shared-schema";
import type { HomeStackParamList } from "../navigation/AppNavigator";

type ResourceListRouteProp = RouteProp<HomeStackParamList, "ResourceList">;

function ResourceCard({
  resource,
  onPress,
}: {
  resource: Resource;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{resource.name}</Text>
      {resource.organizationName && (
        <Text style={styles.sub}>{resource.organizationName}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ResourceListScreen() {
  const navigation = useNavigation();
  const {
    params: { keyword, zipCode = "", isSubcategory = false },
  } = useRoute<ResourceListRouteProp>();

  const PAGE_SIZE = 20;
  type ResourcePage = {
    items: Resource[];
    total: number;
    hasMore: boolean;
  };

  // Unified queryFn based on isSubcategory param
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<ResourcePage, Error>({
    queryKey: ["resources", keyword, zipCode, isSubcategory],
    queryFn: async ({ pageParam }) => {
      const skip = typeof pageParam === "number" ? pageParam : 0;
      // Decide between main category and subcategory logic:
      if (isSubcategory) {
        return await fetchResourcesBySubcategory(keyword, zipCode, skip, PAGE_SIZE);
      }
      return await fetchResourcesByMainCategory(keyword, zipCode, skip, PAGE_SIZE);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      const nextSkip = allPages.reduce(
        (sum, pg) => sum + pg.items.length,
        0
      );
      return nextSkip;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const flatResources: Resource[] = data?.pages?.flatMap(
    (pg: ResourcePage) => pg.items
  ) ?? [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: Resource }) => (
    <ResourceCard
      resource={item}
      onPress={() => {
        // navigation.navigate('ResourceDetail', { resourceId: item.id });
        console.log("Selected resource:", item.id);
      }}
    />
  );

  const keyExtractor = (item: Resource) => item.id;

  // UI states (loading, error, empty)
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.info}>Loading resources…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          ❌ {error?.message ?? "Failed to load resources."}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (flatResources.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>No results found for “{keyword}”.</Text>
      </View>
    );
  }

  // Main list UI
  return (
    <FlatList
      data={flatResources}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      onEndReached={loadMore}
      onEndReachedThreshold={0.2}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footerSpinner}>
            <ActivityIndicator size="small" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  info: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  error: {
    marginBottom: 12,
    fontSize: 16,
    color: "#c00",
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#005191",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    color: "#222",
  },
  sub: {
    fontSize: 14,
    color: "#555",
  },
  footerSpinner: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
