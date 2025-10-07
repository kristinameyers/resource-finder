import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";

interface CardProps {
  children: React.ReactNode;
  // ✅ FIX 1: Change ViewStyle to StyleProp<ViewStyle> to allow style arrays
  style?: StyleProp<ViewStyle>; 
  elevation?: number;
  rounded?: number;
  backgroundColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  // ⚠️ Note: If `style` is a default empty object, it should be an empty array []
  // to avoid issues when merging arrays, but we will leave the default as {} for simplicity
  // since the main fix is the type update.
  style = {},
  elevation = 3,
  rounded = 12,
  backgroundColor = "#fff",
}) => {
  return (
    <View
      style={[
        styles.card,
        // The array combines: 
        // 1. The base static style
        // 2. Dynamic/default props (elevation, rounded, backgroundColor)
        // 3. The user-provided `style` prop (which is the combined array from AboutScreen)
        { elevation, borderRadius: rounded, backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 7,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
});