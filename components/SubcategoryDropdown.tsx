import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
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
  const [open, setOpen] = useState(false);
  const subs = SUBCATEGORIES[categoryKeyword] || [];
  if (!subs.length) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={1}
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
      {open && (
        <ScrollView style={styles.list}>
          {/* Optionally add an "All Subcategories" menu item at top */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              onSelectSubcategory(null);
              setOpen(false);
            }}
            activeOpacity={1}
          >
            <Text style={[styles.itemText, !selectedSubcategory && styles.selectedText]}>
              All Subcategories
            </Text>
          </TouchableOpacity>
          {subs.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={styles.item}
              onPress={() => {
                onSelectSubcategory(sub.name);
                setOpen(false);
              }}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedSubcategory === sub.name && styles.selectedText,
                ]}
              >
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 0 }, // removed padding for flush dropdown
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#256BAE",
    padding: 14,
    borderRadius: 2,
  },
  buttonText: { fontSize: 17, color: "#fff", fontWeight: "600" },
  list: {
    maxHeight: 650,
    backgroundColor: "#005191",
    marginBottom: 1,
  },
  item: {
    padding: 16,
    borderBottomWidth: 0.25,
    borderBottomColor: "#76ced9",
  },
  itemText: { fontSize: 17, color: "#fff", fontWeight: "500" },
  selectedText: { color: "#52f1ecff", fontWeight: "600" },
});
