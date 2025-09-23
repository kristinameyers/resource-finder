import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ImageSourcePropType } from "react-native";

// Import custom PNG icons
import childrenFamilyIcon from "../assets/Children and Family_1754356261782.png";
import foodIcon from "../assets/food_1754356284244.png";
import educationIcon from "../assets/education_1754356313451.png";

// Emoji or Icon codes for category fallback (could be any RN icon set)
export const CategoryIcons: Record<string, { iconSet: "Ionicons" | "MaterialCommunityIcons"; name: string }> = {
  "children-family": { iconSet: "Ionicons", name: "people" },     // Will be replaced with custom PNG
  food: { iconSet: "MaterialCommunityIcons", name: "food" },      // Will be replaced with custom PNG
  education: { iconSet: "MaterialCommunityIcons", name: "school" },  // Will be replaced with custom PNG
  housing: { iconSet: "Ionicons", name: "home" },
  "finance-employment": { iconSet: "Ionicons", name: "cash" },
  healthcare: { iconSet: "Ionicons", name: "medkit" },
  "legal-assistance": { iconSet: "Ionicons", name: "briefcase" },
  transportation: { iconSet: "Ionicons", name: "car" },
  "mental-wellness": { iconSet: "Ionicons", name: "heart" },
  "substance-use": { iconSet: "MaterialCommunityIcons", name: "pill" },
  "hygiene-household": { iconSet: "MaterialCommunityIcons", name: "water" },
  "young-adults": { iconSet: "Ionicons", name: "school" },
  utilities: { iconSet: "Ionicons", name: "bulb" },
};

// Custom PNG icons for specific categories
export const CustomCategoryIcons: Record<string, ImageSourcePropType> = {
  "children-family": require("../assets/Children and Family_1754356261782.png"),
  food: require("../assets/food_1754356284244.png"),
  education: require("../assets/education_1754356313451.png"),
};

/**
 * Get icon config for a category.
 */
export const getCategoryIcon = (categoryId: string) => {
  return CategoryIcons[categoryId] || { iconSet: "Ionicons", name: "home" };
};

/**
 * Get custom PNG icon for a category, or null.
 */
export const getCustomCategoryIcon = (
  categoryId: string
): ImageSourcePropType | null => {
  return CustomCategoryIcons[categoryId] || null;
};

/**
 * Get color for a category (use with style prop).
 */
export const getCategoryColor = (categoryId: string): string => {
  const colorMap: Record<string, string> = {
    housing: "#4A90E2",
    food: "#F5A623",
    healthcare: "#BD10E0",
    education: "#002766",
    "finance-employment": "#F5A623",
    "legal-assistance": "#417505",
    transportation: "#D0021B",
    "mental-wellness": "#7ED321",
    "substance-use": "#9013FE",
    "children-family": "#50E3C2",
    "hygiene-household": "#4A4A4A",
    "young-adults": "#B8E986",
    utilities: "#F8E71C"
  };
  return colorMap[categoryId] || "#4A90E2";
};
