import { ImageSourcePropType } from "react-native";

// Reference PNGs with correct paths (from /components to /assets/icons)
export const CustomCategoryIcons: Record<string, ImageSourcePropType> = {
  "children-family": require("../assets/icons/children-family.png"),
  "food": require("../assets/icons/food.png"),
  "education": require("../assets/icons/education.png"),
  "housing": require("../assets/icons/housing.png"),
  "finance-employment": require("../assets/icons/finance-employment.png"),
  "healthcare": require("../assets/icons/healthcare.png"),
  "legal-assistance": require("../assets/icons/legal-assistance.png"),
  "transportation": require("../assets/icons/transportation.png"),
  "mental-wellness": require("../assets/icons/healthcare.png"), // Use dedicated icon if available
  "substance-use": require("../assets/icons/substance-use.png"),
  "hygiene-household": require("../assets/icons/hygiene-household.png"),
  "young-adults": require("../assets/icons/young-adults.png"),
};

export const CategoryIcons: Record<string, { iconSet: "Ionicons" | "MaterialCommunityIcons"; name: string }> = {
  "children-family": { iconSet: "Ionicons", name: "people" },
  "food": { iconSet: "MaterialCommunityIcons", name: "food" },
  "education": { iconSet: "MaterialCommunityIcons", name: "school" },
  "housing": { iconSet: "Ionicons", name: "home" },
  "finance-employment": { iconSet: "Ionicons", name: "cash" },
  "healthcare": { iconSet: "Ionicons", name: "medkit" },
  "legal-assistance": { iconSet: "Ionicons", name: "briefcase" },
  "transportation": { iconSet: "Ionicons", name: "car" },
  "mental-wellness": { iconSet: "Ionicons", name: "heart" },
  "substance-use": { iconSet: "MaterialCommunityIcons", name: "pill" },
  "hygiene-household": { iconSet: "MaterialCommunityIcons", name: "water" },
  "young-adults": { iconSet: "Ionicons", name: "school" },
  "utilities": { iconSet: "Ionicons", name: "bulb" },
};

export function getCategoryGridIcon(categoryId: string) {
  // Prefer custom PNG if present
  if (CustomCategoryIcons[categoryId]) {
    return { type: "png", icon: CustomCategoryIcons[categoryId] };
  }
  // Fallback to icon set
  if (CategoryIcons[categoryId]) {
    return { type: "vector", icon: CategoryIcons[categoryId] };
  }
  // Always fallback to the default home icon
  return { type: "vector", icon: { iconSet: "Ionicons", name: "home" } };
}
