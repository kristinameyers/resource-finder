import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "./ui/Skeleton";
import { Card } from "./ui/Card";

export default function ResourceCardSkeleton() {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Skeleton style={styles.titleSkeleton} />
            <View style={styles.iconRow}>
              <Skeleton style={styles.iconSkeleton} />
              <Skeleton style={styles.subtitleSkeleton} />
            </View>
          </View>
          <Skeleton style={styles.avatarSkeleton} />
        </View>
      </View>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.lineGroup}>
          <Skeleton style={styles.lineFull} />
          <Skeleton style={styles.line86} />
          <Skeleton style={styles.line66} />
        </View>
        <View style={styles.lineGroup}>
          <View style={styles.iconRow}>
            <Skeleton style={styles.iconSkeleton2} />
            <Skeleton style={styles.detailSkeleton32} />
          </View>
          <View style={styles.iconRow}>
            <Skeleton style={styles.iconSkeleton2} />
            <Skeleton style={styles.detailSkeleton24} />
          </View>
          <View style={styles.iconRow}>
            <Skeleton style={styles.iconSkeleton2} />
            <Skeleton style={styles.detailSkeleton28} />
          </View>
        </View>
        <View style={styles.footerRow}>
          <View style={styles.footerIcons}>
            <Skeleton style={styles.footerIcon} />
            <Skeleton style={styles.footerIcon} />
            <Skeleton style={styles.footerLabel} />
          </View>
          <Skeleton style={styles.actionSkeleton} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { height: "100%" },
  header: { paddingBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flex: 1, gap: 8 },
  titleSkeleton: { height: 24, width: "75%", marginBottom: 6, borderRadius: 6 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconSkeleton: { height: 16, width: 16, borderRadius: 8 },
  subtitleSkeleton: { height: 16, width: 96, borderRadius: 5 },
  avatarSkeleton: { height: 32, width: 32, borderRadius: 16 },
  content: { gap: 14 },
  lineGroup: { gap: 7 },
  lineFull: { height: 14, width: "100%", borderRadius: 3 },
  line86: { height: 14, width: "86%", borderRadius: 3 },
  line66: { height: 14, width: "66%", borderRadius: 3 },
  iconSkeleton2: { height: 14, width: 14, borderRadius: 7 },
  detailSkeleton32: { height: 14, width: 128, borderRadius: 5 },
  detailSkeleton24: { height: 14, width: 96, borderRadius: 5 },
  detailSkeleton28: { height: 14, width: 112, borderRadius: 5 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 },
  footerIcons: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerIcon: { height: 20, width: 20, borderRadius: 10 },
  footerLabel: { height: 15, width: 80, borderRadius: 6 },
  actionSkeleton: { height: 28, width: 106, borderRadius: 8 },
});
