import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Resource, Category, Subcategory } from "../types/shared-schema";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import FavoriteButton from "./FavoriteButton";
import { useTranslatedText } from "./TranslatedText";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

// You must define RootStackParamList somewhere in your app:
type RootStackParamList = {
  ResourceDetail: { resourceId: string };
  // ...other screens
};

function Clamp({ children, lines = 2 }: { children: React.ReactNode; lines?: number }) {
  return (
    <Text numberOfLines={lines} ellipsizeMode="tail" style={{ flex: 1 }}>
      {children}
    </Text>
  );
}

interface ResourceCardProps {
  resource: Resource;
  category?: Category;
  subcategory?: Subcategory;
}

export default function ResourceCard({
  resource,
  category,
  subcategory,
}: ResourceCardProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { text: viewDetailsText } = useTranslatedText("View Details");

  return (
    <Card style={styles.card}>
      <View style={styles.badgesRow}>
        {category && <Badge text={category.name} color="#4287f5" />}
        {subcategory && <Badge text={subcategory.name} color="#0ea5e9" />}
      </View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            <Clamp>{resource.name}</Clamp>
          </Text>
        </View>
        {resource.distanceMiles !== undefined && (
          <View style={styles.distance}>
            <Text style={styles.distanceText}>{resource.distanceMiles.toFixed(2)} mi</Text>
          </View>
        )}
      </View>
      {!!resource.description && (
        <Text style={styles.desc} numberOfLines={2}>
          {resource.description}
        </Text>
      )}
      {resource.location && (
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#005191" style={{ marginRight: 4 }} />
          <Text style={styles.location}>{resource.location}</Text>
        </View>
      )}
      <View style={styles.actions}>
        <FavoriteButton
          resourceId={resource.id}
          style={styles.flexBtn}
        />
        <TouchableOpacity
          style={[styles.flexBtn, styles.detailsBtn]}
          onPress={() => navigation.navigate("ResourceDetail", { resourceId: resource.id })}
        >
          <Feather name="eye" size={18} color="#005191" style={{ marginRight: 7 }} />
          <Text style={styles.detailsText}>{viewDetailsText}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2 },
  title: { fontWeight: "700", fontSize: 17, color: "#1b1b1b", flexShrink: 1, marginRight: 12 },
  distance: {
    backgroundColor: "#4287f5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  distanceText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  desc: { color: "#444", fontSize: 14, marginBottom: 6 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  location: { color: "#777", fontSize: 13 },
  actions: { flexDirection: "row", gap: 10, marginTop: "auto" },
  flexBtn: { flex: 1 },
  detailsBtn: {
    backgroundColor: "#E6F1FA",
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  detailsText: { color: "#005191", fontWeight: "600", fontSize: 15 },
});
