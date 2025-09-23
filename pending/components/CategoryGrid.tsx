import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import CardFrame from './CardFrame';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 3; // 3 columns with padding

interface Category {
  id: string;
  name: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string | null;
  isLoading?: boolean;
}

const categoryColors: Record<string, string> = {
  'children-family': '#539ed0',
  'food': '#ffb351',
  'education': '#4eb99f',
  'housing': '#ff443b',
  'healthcare': '#f2b131',
  'finance-employment': '#76ced9',
  'transportation': '#f2b131',
  'mental-wellness': '#4eb99f',
  'substance-use': '#ffb351',
  'hygiene-household': '#76ced9',
  'young-adults': '#539ed0',
  'utilities': '#f2b131',
};

// PNG icon imports
const CategoryPNGIcons: Record<string, any> = {
  'education': require('../assets/icons/education.png'),
  'legal-assistance': require('../assets/icons/legal-assistance.png'),
  'children-family': require('../assets/icons/children-family.png'),
  'food': require('../assets/icons/food.png'),
  'finance-employment': require('../assets/icons/finance-employment.png'),
  'healthcare': require('../assets/icons/healthcare.png'),
  'housing': require('../assets/icons/housing.png'),
  'substance-use': require('../assets/icons/substance-use.png'),
  'young-adults': require('../assets/icons/young-adults.png'),
  'transportation': require('../assets/icons/transportation.png'),
  'hygiene-household': require('../assets/icons/hygiene-household.png'),
  // Add fallback for missing icons
  'mental-wellness': require('../assets/icons/healthcare.png'), // Using healthcare as fallback  
  'utilities': require('../assets/icons/finance-employment.png'), // Using finance as fallback
};

export function CategoryGrid({ 
  categories, 
  onCategorySelect, 
  selectedCategoryId, 
  isLoading 
}: CategoryGridProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Browse all Categories</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse all Categories</Text>
      <View style={styles.grid}>
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const categoryIcon = CategoryPNGIcons[category.id];

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                isSelected && styles.selectedCard,
              ]}
              onPress={() => onCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <CardFrame>
                <View style={styles.iconContainer}>
                  {categoryIcon ? (
                    <Image source={categoryIcon} style={styles.icon} />
                  ) : (
                    <View style={[styles.iconPlaceholder, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  )}
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </CardFrame>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#005191',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto-Bold',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: 'white',
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    marginBottom: 10,
  },
  icon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  iconPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  categoryText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    marginTop: 8,
  },
});