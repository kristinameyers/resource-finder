import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Resource } from "../types/shared-schema";

interface Props {
  resource: Resource;
  distanceMiles?: number;
  onPress: () => void;
}

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
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{name}</Text>
      {distanceMiles != null && (
        <Text style={styles.distance}>{distanceMiles.toFixed(1)} mi</Text>
      )}
      {resource.nameOrganization && (
        <Text style={styles.organization}>{resource.nameOrganization}</Text>
      )}
      {address ? <Text style={styles.address}>{address}</Text> : null}
    </TouchableOpacity>
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
  title: { fontSize: 16, fontWeight: "600", color: "#005191" },
  distance: { fontSize: 14, color: "#555", marginTop: 4 },
  organization: { fontSize: 14, color: "#000", marginTop: 4 },
  address: { fontSize: 14, color: "#000", marginTop: 4 },
});
