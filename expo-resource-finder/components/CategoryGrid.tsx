import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, { Rect, Path, Circle, G } from 'react-native-svg';
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

// Custom SVG icons with rounded frame background - matching web app
const CustomCategoryIconComponents: Record<string, React.ComponentType<{ size?: number }>> = {
  'children-family': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#539ed0"/>
      <G transform="translate(10, 10)">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'food': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#ffb351"/>
      <G transform="translate(9, 9)">
        <Path d="M3 2v7c0 6 3 8 3 8s3-2 3-8V2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M7 13v8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M15 11v-1a4 4 0 0 0-4-4V2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M15 17v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'education': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#4eb99f"/>
      <G transform="translate(9, 9)">
        <Path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'housing': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#ff443b"/>
      <G transform="translate(9, 9)">
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M9 22V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'healthcare': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#f2b131"/>
      <G transform="translate(9, 9)">
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'finance-employment': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#76ced9"/>
      <G transform="translate(9, 9)">
        <Rect x="2" y="3" width="20" height="14" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M6 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'legal-assistance': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#539ed0"/>
      <G transform="translate(9, 9)">
        <Path d="M16 11l3-3m-9 1l9 9-3 3-9-9 3-3zm0 0l3-3m6 3H8l-2 2 3 3 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'transportation': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#f2b131"/>
      <G transform="translate(6, 9)">
        <Path d="M8 6v6M16 6v6M2 12h20l-2-7H4l-2 7zM7 19h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1zM21 19h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'mental-wellness': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#4eb99f"/>
      <G transform="translate(9, 9)">
        <Path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3-3 3 3 0 0 0-3 3c0 6 3 7 3 7s3-1 3-7a3 3 0 0 0-3-3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M7 13v8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M15 11v-1a4 4 0 0 0-4-4V2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M15 17v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'substance-use': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#ffb351"/>
      <G transform="translate(9, 9)">
        <Path d="M10.5 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M15.5 6.5a4.5 4.5 0 1 1-9 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M13 15.5a4.5 4.5 0 1 1-9 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'hygiene-household': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#76ced9"/>
      <G transform="translate(9, 9)">
        <Path d="M7 16.3c2.9-.3 5.2-2.8 5-5.7-.1-1.9-.8-3.7-2.1-5.1-.4-.4-1-.4-1.4 0C7.8 6.7 7.1 8.5 7 10.4c-.2 2.9 2.1 5.4 0 5.9z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M12.56 6.6A9 9 0 1 1 2.32 17.46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'young-adults': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#539ed0"/>
      <G transform="translate(9, 9)">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  ),
  'utilities': ({ size = 42 }) => (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Rect width="42" height="42" rx="9" fill="#f2b131"/>
      <G transform="translate(9, 9)">
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  )
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
          const IconComponent = CustomCategoryIconComponents[category.id] || CustomCategoryIconComponents['housing'];

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
                  <IconComponent size={42} />
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