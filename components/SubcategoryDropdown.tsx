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
      >
        <Text style={styles.buttonText}>
          {selectedSubcategory || "All Subcategories"}
        </Text>
        <MaterialIcons
          name={open ? "expand-less" : "expand-more"}
          size={24}
          color="#005191"
        />
      </TouchableOpacity>
      {open && (
        <ScrollView style={styles.list}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              onSelectSubcategory(null);
              setOpen(false);
            }}
          >
            <Text
              style={[
                styles.itemText,
                !selectedSubcategory && styles.selectedText,
              ]}
            >
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
  container: { padding: 12 },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: { fontSize: 16, color: "#005191" },
  list: {
    maxHeight: 200,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 4,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: { fontSize: 16, color: "#333" },
  selectedText: { color: "#005191", fontWeight: "600" },
});
