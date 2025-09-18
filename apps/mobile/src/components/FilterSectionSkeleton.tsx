import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "./ui/Skeleton";
import { Card } from "./ui/Card";

export default function FilterSectionSkeleton() {
  return (
    <Card style={{ marginBottom: 18 }}>
      {/* Card Header Skeleton */}
      <View style={styles.header}>
        <Skeleton style={styles.headerTitle} />
        <Skeleton style={styles.headerDesc} />
      </View>
      {/* Card Content Skeleton */}
      <View style={styles.content}>
        {/* Category Filter Skeleton */}
        <View style={styles.filterSection}>
          <Skeleton style={styles.label} />
          <Skeleton style={styles.input} />
        </View>
        {/* Subcategory Filter Skeleton */}
        <View style={styles.filterSection}>
          <Skeleton style={styles.labelWide} />
          <Skeleton style={styles.input} />
        </View>
        {/* Location Section Skeleton */}
        <View style={styles.filterSection}>
          <Skeleton style={styles.labelShort} />
          <View style={{ gap: 12 }}>
            <Skeleton style={styles.button} />
            <View style={styles.row}>
              <Skeleton style={styles.input} />
              <Skeleton style={styles.buttonSmall} />
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18, gap: 8 },
  headerTitle: { height: 24, width: 128, borderRadius: 6, marginBottom: 6 },
  headerDesc: { height: 14, width: 190, borderRadius: 6 },

  content: { gap: 16 },
  filterSection: { gap: 10, marginBottom: 16 },
  label: { height: 14, width: 80, borderRadius: 4 },
  input: { height: 40, width: "100%", borderRadius: 8 },
  labelWide: { height: 14, width: 110, borderRadius: 4 },
  labelShort: { height: 14, width: 60, borderRadius: 4 },
  button: { height: 36, width: 120, borderRadius: 8, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  buttonSmall: { height: 36, width: 56, borderRadius: 8 },
});
