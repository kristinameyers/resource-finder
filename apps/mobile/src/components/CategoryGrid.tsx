// apps/mobile/src/components/CategoryGrid.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, AccessibilityState } from "react-native";
import { Category } from "../types/shared-schema";
import { getCategoryColor } from './CategoryIcons';
import { useTranslatedText } from "./TranslatedText";
import { useAccessibility } from "../contexts/AccessibilityContext";

import educationIcon from "../assets/icons/education.png";
import legalAssistanceIcon from "../assets/icons/legal-assistance.png";
import childrenFamilyIcon from "../assets/icons/children-family.png";
import foodIcon from "../assets/icons/food.png";
import financeEmploymentIcon from "../assets/icons/finance-employment.png";
import healthcareIcon from "../assets/icons/healthcare.png";
import housingIcon from "../assets/icons/housing.png";
import substanceUseIcon from "../assets/icons/substance-use.png";
import youngAdultsIcon from "../assets/icons/young-adults.png";
import transportationIcon from "../assets/icons/transportation.png";
import hygieneHouseholdIcon from "../assets/icons/hygiene-household.png";

function CategoryLabel({ category }: { category: Category }) {
  const { text } = useTranslatedText(category.name);
  return <Text style={styles.categoryLabel}>{text}</Text>;
}

// Map of category id to icon
const iconMap: Record<string, any> = {
  'education': educationIcon,
  'legal-assistance': legalAssistanceIcon,
  'children-family': childrenFamilyIcon,
  'food': foodIcon,
  'finance-employment': financeEmploymentIcon,
  'healthcare': healthcareIcon,
  'housing': housingIcon,
  'substance-use': substanceUseIcon,
  'young-adults': youngAdultsIcon,
  'transportation': transportationIcon,
  'hygiene-household': hygieneHouseholdIcon,
  'mental-wellness': healthcareIcon,
  'utilities': financeEmploymentIcon,
};

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId: string | null;
}

export default function CategoryGrid({ categories, onCategorySelect, selectedCategoryId }: CategoryGridProps) {
  const { text: browseCategoriesText } = useTranslatedText("Search Category");
  const { triggerHaptic, reduceMotion } = useAccessibility();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{browseCategoriesText}</Text>
      <View style={styles.grid}>
        {categories.map((category) => {
          const categoryIcon = iconMap[category.id];
          const isSelected = selectedCategoryId === category.id;

          const accessibilityState: AccessibilityState = { selected: isSelected };
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.gridItem,
                isSelected && styles.selectedItem,
                !isSelected && !reduceMotion && styles.unselectedAnimated
              ]}
              onPress={() => {
                triggerHaptic && triggerHaptic('light');
                onCategorySelect(category.id);
              }}
              accessibilityLabel={`Select ${category.name} category`}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              activeOpacity={0.85}
            >
              <View style={styles.iconWrap}>
                {categoryIcon ? (
                  <Image source={categoryIcon} style={styles.iconImage} resizeMode="contain" />
                ) : (
                  <View style={styles.iconPlaceholder} />
                )}
              </View>
              <CategoryLabel category={category} />
              {isSelected && (
                <Text
                  style={styles.srOnly}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  Selected
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#005191",
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 0,
    margin: 0,
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 26,
    marginBottom: 24,
    fontWeight: "400",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gridItem: {
    width: 140,
    height: 140,
    backgroundColor: "#256BAE",
    borderRadius: 32,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 8,
    borderWidth: 0,
    overflow: "hidden",
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowOpacity: 0.18,
    transform: [{ scale: 1.05 }],
    zIndex: 1,
  },
  unselectedAnimated: {
    // Could add scale/transform or shadow for hover-like feel on native if needed
  },
  iconWrap: {
    width: 48,
    height: 48,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  iconImage: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  iconPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#ffffff22",
  },
  categoryLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  srOnly: {
    position: "absolute",
    height: 1,
    width: 1,
    overflow: "hidden",
    left: -1000,
    top: -1000,
  },
});
