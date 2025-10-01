import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import FavoriteButton from './FavoriteButton';
import { FavoriteResource } from '../contexts/FavoritesContext';
import type { Resource } from "../types/shared-schema";
// Utility to get a unique identifier for a resource
interface Props {
  resource: Resource & FavoriteResource;
  distanceMiles?: number;
  onPress: () => void;
}
// Utility function to get a unique identifier for a resource
export default function ResourceCard({
  resource,
  distanceMiles,
  onPress,
}: Props) {
  const name =
    resource.nameServiceAtLocation ||
    resource.nameService ||
    resource.name ||
    "Unknown Service";

  const address = resource.address
    ? [
      resource.address.streetAddress,
      resource.address.city,
      resource.address.stateProvince,
      resource.address.postalCode,
    ]
      .filter(Boolean)
      .join(", ")
    : "";

  return (
    // Use a top-level View for the Card Styling (Background/Shadow/Margin)
    <View style={styles.cardContainer}>
      {/* The TouchableOpacity wraps the main content for the onPress action */}
      <TouchableOpacity style={styles.contentWrapper} onPress={onPress}>
        {/* 1. Header/Title Row */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {name}
          </Text>

          {/* 2. Favorite Button */}
          <FavoriteButton
            resource={resource} // Pass the full resource object
            showText={false} // Show icon only for list view
          />
        </View>

        {/* 3. Distance and other details */}
        {distanceMiles != null && (
          <Text style={styles.distance}>{distanceMiles.toFixed(1)} mi</Text>
        )}
        {resource.nameOrganization && (
          <Text style={styles.organization}>{resource.nameOrganization}</Text>
        )}
        {address ? <Text style={styles.address}>{address}</Text> : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 8,
    elevation: 1,
  },
  cardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  contentWrapper: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // Add a bit of space below the header
  },
  title: { fontSize: 16, fontWeight: "600", color: "#005191", flex: 1, flexShrink:1, paddingRight: 10 },
  distance: { fontSize: 15, color: "#555", marginTop: 4 },
  organization: { fontSize: 15, color: "#000", marginTop: 4 },
  address: { fontSize: 14, color: "#000", marginTop: 4 },
});
