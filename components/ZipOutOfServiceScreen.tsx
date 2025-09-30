import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  onStartNewSearch: () => void;
};

export default function ZipOutOfServiceScreen({ onStartNewSearch }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        This zip code is outside of the service range! Enter a new zip code.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onStartNewSearch}>
        <Text style={styles.buttonText}>Start a new search</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  message: {
    fontSize: 18,
    color: "#c00",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#005191",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
