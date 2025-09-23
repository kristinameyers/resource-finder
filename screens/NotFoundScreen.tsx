import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslatedText } from "../components/TranslatedText";

export default function NotFoundScreen() {
  const { text: pageNotFoundText } = useTranslatedText("404 Page Not Found");
  const { text: routerMessageText } = useTranslatedText("Did you forget to add the page to the router?");

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <MaterialIcons name="error-outline" size={34} color="#d90429" style={styles.icon} />
          <Text style={styles.title}>{pageNotFoundText}</Text>
        </View>
        <Text style={styles.msg}>{routerMessageText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#f5f5f5", alignItems: "center", justifyContent: "center"
  },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 26, width: "84%", elevation: 4,
  },
  titleRow: {
    flexDirection: "row", alignItems: "center", marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 22, fontWeight: "bold", color: "#222",
  },
  msg: {
    fontSize: 15, color: "#555",
  },
});
