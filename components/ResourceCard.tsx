import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import FavoriteButton from './FavoriteButton';
import { FavoriteResource } from '../contexts/FavoritesContext';
import type { Resource } from "../types/shared-schema";
import { useAccessibility } from "../contexts/AccessibilityContext"; // 👈 Imported

interface Props {
  resource: Resource & FavoriteResource;
  distanceMiles?: number;
  onPress: () => void;
}

// 1. Define the component as a regular function
function ResourceCard({
  resource,
  distanceMiles,
  onPress,
}: Props) {
  // ✅ Access the accessibility context
  const { theme, getFontSize, highContrast } = useAccessibility();

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

  // 💡 FIX: Replaced theme.shadow with a hardcoded shadow color ('#000') for non-HC mode.
  const shadowStyle = highContrast
    ? { borderWidth: 1, borderColor: theme.border, elevation: 0 }
    : { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 };

  return (
    // ✅ Apply dynamic container styling (HC borders, shadow reduction, background)
    <View style={[
      styles.cardContainer, 
      { backgroundColor: theme.backgroundSecondary }, 
      shadowStyle
    ]}>
      {/* The TouchableOpacity wraps the main content for the onPress action */}
      <TouchableOpacity 
        style={styles.contentWrapper} 
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${name}.`}
        >
        {/* 1. Header/Title Row */}
        <View style={styles.headerRow}>
          {/* FONT SCALING & HC: Title */}
          <Text 
            style={[
              styles.title, 
              { 
                fontSize: getFontSize(16), 
                color: theme.primary,
              }
            ]} 
            numberOfLines={2}
          >
            {name}
          </Text>

          {/* 2. Favorite Button (assumes internal HC updates) */}
          <FavoriteButton
            resource={resource} // Pass the full resource object
            showText={false} // Show icon only for list view
          />
        </View>

        {/* 3. Distance and other details */}
        {/* FONT SCALING & HC: Distance */}
        {distanceMiles != null && (
          <Text style={[styles.distance, { fontSize: getFontSize(15), color: theme.textSecondary }]}>
            {distanceMiles.toFixed(1)} mi
          </Text>
        )}
        {/* FONT SCALING & HC: Organization Name */}
        {resource.nameOrganization && (
          <Text style={[styles.organization, { fontSize: getFontSize(15), color: theme.text }]}>
            {resource.nameOrganization}
          </Text>
        )}
        {/* FONT SCALING & HC: Address */}
        {address ? (
          <Text style={[styles.address, { fontSize: getFontSize(14), color: theme.text }]}>
            {address}
          </Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

// 2. Export the component wrapped in React.memo
export default memo(ResourceCard);

// Styles are adjusted to remove hardcoded values that are now dynamic
const styles = StyleSheet.create({
  cardContainer: {
    // Background and shadow managed inline
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 0, // Set elevation to 0 and manage shadow via prop for control
  },
  contentWrapper: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { 
    // fontSize and color managed inline
    fontWeight: "600", 
    flex: 1, 
    flexShrink: 1, 
    paddingRight: 10 
  },
  distance: { 
    // fontSize and color managed inline
    marginTop: 4 
  },
  organization: { 
    // fontSize and color managed inline
    marginTop: 4 
  },
  address: { 
    // fontSize and color managed inline
    marginTop: 4 
  },
});