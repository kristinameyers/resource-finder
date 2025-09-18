import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

interface SortControlProps {
  value: 'relevance' | 'distance' | 'name';
  onValueChange: (value: 'relevance' | 'distance' | 'name') => void;
  hasLocation?: boolean;
}

export default function SortControl({
  value,
  onValueChange,
  hasLocation
}: SortControlProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="swap-vertical" size={22} color="#fff" style={styles.icon} />
      <Picker
        selectedValue={value}
        style={styles.picker}
        onValueChange={(val) => onValueChange(val as 'relevance' | 'distance' | 'name')}
        dropdownIconColor="#005191"
      >
        <Picker.Item label="Relevance" value="relevance" />
        {hasLocation && <Picker.Item label="Distance" value="distance" />}
        <Picker.Item label="Name (A-Z)" value="name" />
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { marginRight: 6 },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    color: "#005191",
    height: 40, // to match styled input
    width: 110,
  },
});
