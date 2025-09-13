import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MAIN_CATEGORIES } from '../../../packages/taxonomy/index';

const categoryIconMap = {
  'housing': { icon: 'home', color: '#4A90E2' },
  'food': { icon: 'restaurant', color: '#F5A623' },
  'healthcare': { icon: 'medkit', color: '#BD10E0' },
  'mental-wellness': { icon: 'heart', color: '#7ED321' },
  'substance-use': { icon: 'medical', color: '#9013FE' },
  'children-family': { icon: 'people', color: '#50E3C2' },
  'young-adults': { icon: 'school', color: '#B8E986' },
  'legal-assistance': { icon: 'briefcase', color: '#417505' },
  'utilities': { icon: 'bulb', color: '#F8E71C' },
  'transportation': { icon: 'car', color: '#D0021B' },
  'hygiene-household': { icon: 'water', color: '#4A4A4A' },
  'finance-employment': { icon: 'cash', color: '#F5A623' },
  'education': { icon: 'book', color: '#002766' }
};

const categories = Object.entries(MAIN_CATEGORIES).map(([id, category]) => ({
  id,
  name: category.name,
  ...categoryIconMap[id]
}));

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleCategoryPress = (categoryId, categoryName) => {
    navigation.navigate('ResourceList', {
      categoryId,
      categoryName,
      zipCode,
      use211Api: true,
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('ResourceList', {
        keyword: searchQuery.trim(),
        zipCode,
        use211Api: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Santa Barbara 211</Text>
          <Text style={styles.subtitle}>Find Resources Near You</Text>
        </View>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for resources..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <View style={styles.locationBar}>
            <Ionicons name="location" size={20} color="#666" />
            <TextInput
              style={styles.locationInput}
              placeholder="Enter ZIP code"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: category.color + '20' }]}
                onPress={() => handleCategoryPress(category.id, category.name)}
              >
                <Ionicons
                  name={category.icon}
                  size={32}
                  color={category.color}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#005191', padding: 20, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: 'white', marginTop: 5 },
  searchSection: { padding: 15 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 10, padding: 10, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  locationBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 10, padding: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  locationInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  categoriesSection: { padding: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: {
    width: '48%', padding: 15, borderRadius: 10, marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  categoryName: {
    marginTop: 10, fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#333',
  },
});
