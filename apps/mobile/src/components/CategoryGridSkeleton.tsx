import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "./ui/Skeleton";

export default function CategoryGridSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton style={styles.titleSkeleton} />
      <View style={styles.grid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={index} style={styles.gridItem}>
            <Skeleton style={styles.cardSkeleton} />
            <Skeleton style={styles.labelSkeleton} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    gap: 16,
  },
  titleSkeleton: {
    height: 32,
    width: 192,
    marginBottom: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gridItem: {
    width: "48%",
    marginBottom: 14,
  },
  cardSkeleton: {
    height: 64,
    width: "100%",
    borderRadius: 14,
    marginBottom: 8,
  },
  labelSkeleton: {
    height: 16,
    width: "80%",
    borderRadius: 5,
    alignSelf: "center",
  },
});
