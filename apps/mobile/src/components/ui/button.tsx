import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type ButtonVariant = "default" | "outline" | "ghost";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

// Color and border mapping by variant
const variantStyles: Record<ButtonVariant, ViewStyle> = {
  default: {
    backgroundColor: "#256BAE",
    borderWidth: 0,
  },
  outline: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#256BAE",
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
};

const variantText: Record<ButtonVariant, TextStyle> = {
  default: { color: "#fff", fontWeight: "600" },
  outline: { color: "#256BAE", fontWeight: "600" },
  ghost: { color: "#256BAE", fontWeight: "600" },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  disabled,
  variant = "default",
  style = {},
  textStyle = {},
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    disabled={disabled}
    style={[
      styles.button,
      variantStyles[variant],
      disabled && styles.disabled,
      style,
    ]}
  >
    <Text style={[styles.text, variantText[variant], textStyle]}>{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
