import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
// Using the MaterialIcons from Expo Vector Icons
import { MaterialIcons } from "@expo/vector-icons";
import { SUBCATEGORIES } from "../taxonomy/officialTaxonomy";

interface Props {
  categoryKeyword: string;
  selectedSubcategory: string | null;
  onSelectSubcategory: (name: string | null) => void;
}

export default function SubcategoryDropdown({
  categoryKeyword,
  selectedSubcategory,
  onSelectSubcategory,
}: Props) {
  // Reverting to the original 'open' state
  const [open, setOpen] = useState(false);
  const subs = SUBCATEGORIES[categoryKeyword] || [];

  if (!subs.length) return null;

  return (
    <View style={styles.container}>
      {/* --- Accordion Header Button --- */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7} // Use 0.7 for a standard press effect
      >
        <Text style={styles.buttonText}>
          {selectedSubcategory || "Click to Search Subcategories"}
        </Text>
        <MaterialIcons
          name={open ? "expand-less" : "expand-more"}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      {/* --- Dropdown List --- */}
      {open && (
        <ScrollView style={styles.list}>
          {/* "All Subcategories" menu item */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              onSelectSubcategory(null);
              setOpen(false);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.itemText, !selectedSubcategory && styles.selectedText]}>
              All Subcategories
            </Text>
          </TouchableOpacity>

          {/* Map through subcategories */}
          {subs.map((sub) => {
            const isSelected = selectedSubcategory === sub.name;
            return (
              <TouchableOpacity
                key={sub.id}
                style={styles.item}
                onPress={() => {
                  onSelectSubcategory(sub.name);
                  setOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {sub.name}
                </Text>
                {/* Optional: Add a checkmark or icon for the selected item */}
                {isSelected && (
                  <MaterialIcons
                    name="check"
                    size={24}
                    color="#52f1ecff"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 0 },
  // Header Button Style
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#256BAE", // Primary button color
    padding: 14,
    borderRadius: 2,
  },
  buttonText: { 
    fontSize: 17, 
    color: "#fff", 
    fontWeight: "600" 
  },
  // Dropdown List Container
  list: {
    maxHeight: 650,
    backgroundColor: "#005191", // Background for the list container
    marginBottom: 1,
  },
  // Individual List Item
  item: {
    flexDirection: 'row', // To align text and checkmark
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.25,
    borderBottomColor: "#76ced9",
    backgroundColor: "#005191", // 🎯 Requested List Item Background Color
  },
  itemText: { 
    fontSize: 17, 
    color: "#ffffff", // 🎯 Requested List Item Font Color
    fontWeight: "500",
    flex: 1, // Allows the text to take up space and push the icon
  },
  // Selected Item Style
  selectedText: { 
    color: "#52f1ecff", 
    fontWeight: "600" 
  },
  checkIcon: {
    marginLeft: 10,
  }
});