import { View, Text, TouchableOpacity, StyleSheet, AccessibilityState, Image, ImageSourcePropType } from "react-native";
import { Category } from "../types/shared-schema";
import { getCategoryGridIcon } from './CategoryIcons';
import { useTranslatedText } from "./TranslatedText";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Get accessibility context outside of CategoryLabel to ensure it has access to props
function CategoryLabel({ category }: { category: Category }) {
  const { getFontSize, theme, highContrast } = useAccessibility();
  const { text } = useTranslatedText(category.name);
  
  // ✅ FIX: Force the text color to white if in high contrast mode to guarantee visibility 
  // on the dark primary/accent button backgrounds.
  const textColor = highContrast ? '#fff' : theme.backgroundSecondary;

  return <Text style={[styles.categoryLabel, { 
    fontSize: getFontSize(16), 
    color: textColor
  }]}>{text}</Text>;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  selectedCategoryId: string | null;
}

// type guards for icon config
type IconConfig =
  | { type: "png"; icon: ImageSourcePropType }
  | { type: "vector"; icon: { iconSet: "Ionicons" | "MaterialCommunityIcons"; name: string } };

export default function CategoryGrid({ categories, onCategorySelect, selectedCategoryId }: CategoryGridProps) {
  // ✅ ACCESS CONTEXT FOR STYLING AND SCALING
  const { triggerHaptic, reduceMotion, theme, getFontSize, highContrast } = useAccessibility();
  const { text: browseCategoriesText } = useTranslatedText("Search Category");

  // Default button colors
  const defaultGridItemColor = highContrast ? theme.background : '#256BAE'; // Light background in HC, dark blue otherwise
  
  // Selected border colors
  const selectedBorderColor = highContrast ? theme.accent : theme.backgroundSecondary; // Use accent border in HC for better visibility on dark button

  return (
    // ✅ HC: Apply primary color to the wrapper background
    <View style={[styles.wrapper, { backgroundColor: theme.primary }]}>
      {/* FONT SCALING & HC: Title */}
      <Text style={[styles.title, { 
        fontSize: getFontSize(26), 
        color: theme.backgroundSecondary // Title text color should be light/white
      }]}>{browseCategoriesText}</Text>
      <View style={styles.grid}>
        {categories.map((category) => {
          const iconConfig = getCategoryGridIcon(category.id) as IconConfig;
          const isSelected = selectedCategoryId === category.id;
          const accessibilityState: AccessibilityState = { selected: isSelected };

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.gridItem,
                { 
                    backgroundColor: isSelected ? theme.accent : defaultGridItemColor, 
                    borderColor: isSelected ? selectedBorderColor : theme.primary, 
                    borderWidth: isSelected || highContrast ? 2 : 0,
                    shadowOpacity: highContrast ? 0 : 0.09, 
                },
                isSelected && styles.selectedItem,
                !isSelected && !reduceMotion && styles.unselectedAnimated,
              ]}
              onPress={() => {
                triggerHaptic && triggerHaptic("light");
                onCategorySelect(category.id, category.name);
              }}
              accessibilityLabel={`Select ${category.name} category`}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              activeOpacity={0.85}
            >
              <View style={styles.iconWrap}>
                {iconConfig.type === "png" ? (
                  <Image 
                    source={iconConfig.icon} 
                    style={styles.iconImage} 
                    resizeMode="contain" 
                  />
                ) : iconConfig.icon.iconSet === "Ionicons" ? (
                  // ✅ Icon color should be theme.backgroundSecondary (light/white)
                  <Ionicons name={iconConfig.icon.name as any} size={getFontSize(38)} color={theme.backgroundSecondary} />
                ) : (
                  // ✅ Icon color should be theme.backgroundSecondary (light/white)
                  <MaterialCommunityIcons name={iconConfig.icon.name as any} size={getFontSize(38)} color={theme.backgroundSecondary} />
                )}
              </View>

              {/* CategoryLabel component now forces white text in HC */}
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
// ... (Styles are left largely unchanged)
  wrapper: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 0,
    margin: 0,
  },
  title: {
    textAlign: "center",
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
    borderRadius: 32,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 8,
    overflow: "hidden",
  },
  selectedItem: {
    shadowOpacity: 0.18,
    transform: [{ scale: 1.05 }],
    zIndex: 1,
  },
  unselectedAnimated: {},
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
  categoryLabel: {
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