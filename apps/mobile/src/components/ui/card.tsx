import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  rounded?: number;
  backgroundColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style = {},
  elevation = 3,
  rounded = 12,
  backgroundColor = "#fff",
}) => {
  return (
    <View
      style={[
        styles.card,
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
