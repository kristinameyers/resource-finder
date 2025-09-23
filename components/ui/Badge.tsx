import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface BadgeProps {
  text: string;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  color = "#EBF8FF",
  style = {},
  textStyle = {},
}) => (
  <View style={[styles.badge, { backgroundColor: color }, style]}>
    <Text style={[styles.text, textStyle]} numberOfLines={1} ellipsizeMode="tail">
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: 22,
    marginRight: 4,
  },
  text: {
    fontSize: 13,
    color: "#226db3",
    fontWeight: "700",
  },
});

export default Badge;
