import React from 'react';
import { Image, ActivityIndicator } from 'react-native';
import { View, Text, Button, XStack, YStack, Spinner, getTokenValue } from 'tamagui';

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

const categoryIcons: Record<string, any> = {
  'children-family': require('../assets/icons/children-family.png'),
  'food': require('../assets/icons/food.png'),
  'education': require('../assets/icons/education.png'),
  'housing': require('../assets/icons/housing.png'),
  'healthcare': require('../assets/icons/healthcare.png'),
  'finance-employment': require('../assets/icons/finance-employment.png'),
  'substance-use': require('../assets/icons/substance-use.png'),
  'young-adults': require('../assets/icons/young-adults.png'),
  'legal-assistance': require('../assets/icons/legal-assistance.png'),
  'hygiene-household': require('../assets/icons/hygiene-household.png'),
};

export function CategoryGrid({ 
  categories, 
  onCategorySelect, 
  selectedCategoryId, 
  isLoading 
}: CategoryGridProps) {
  if (isLoading) {
    return (
      <View backgroundColor="#005191" padding={20} borderRadius={12}>
        <Text fontSize={24} color="white" textAlign="center" marginBottom={20} fontFamily="$heading">
          Browse all Categories
        </Text>
        <View height={200} justifyContent="center" alignItems="center">
          <Spinner size="large" color="white" />
        </View>
      </View>
    );
  }

  return (
    <View backgroundColor="#005191" borderRadius={12} padding={20}>
      <Text fontSize={24} color="white" textAlign="center" marginBottom={20} fontFamily="$heading">
        Browse all Categories
      </Text>
      <XStack flexWrap="wrap" justifyContent="space-between" gap={15}>
        {categories.map((category) => {
          const backgroundColor = categoryColors[category.id] || '#005191';
          const isSelected = selectedCategoryId === category.id;
          const icon = categoryIcons[category.id];

          return (
            <Button
              key={category.id}
              backgroundColor={backgroundColor}
              width="30%"
              minHeight={120}
              borderRadius={12}
              padding={15}
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              borderWidth={isSelected ? 2 : 0}
              borderColor="white"
              transform={isSelected ? [{ scale: 1.05 }] : undefined}
              onPress={() => onCategorySelect(category.id)}
              pressStyle={{ opacity: 0.8 }}
              unstyled
            >
              <View marginBottom={10}>
                {icon ? (
                  <Image source={icon} style={{ width: 42, height: 42, resizeMode: 'contain' }} />
                ) : (
                  <View 
                    width={42} 
                    height={42} 
                    borderRadius={21} 
                    backgroundColor="rgba(255,255,255,0.3)" 
                  />
                )}
              </View>
              <Text fontSize={18} color="black" textAlign="center" fontWeight="500" fontFamily="$body">
                {category.name}
              </Text>
            </Button>
          );
        })}
      </XStack>
    </View>
  );
}

// Styles removed - now using Tamagui components