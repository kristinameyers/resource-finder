// OnboardingFlow.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  Image,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Use relative or properly aliased imports for modules; adjust as needed.
import { useTranslatedText } from '../../components/TranslatedText'; // or @sb211/components/TranslatedText if alias is configured
import { useAccessibility } from '../../contexts/AccessibilityContext';

export interface OnboardingPreferences {
  zipCode?: string;
  useLocation?: boolean;
  favoriteCategories: string[];
}

interface OnboardingFlowProps {
  onComplete: (preferences: OnboardingPreferences) => void;
}

const categories = [
  { id: 'children-family', name: 'Children & Family' },
  { id: 'food', name: 'Food' },
  { id: 'education', name: 'Education' },
  { id: 'finance-employment', name: 'Finance & Employment' },
  { id: 'housing', name: 'Housing' },
  { id: 'healthcare', name: 'Health Care' },
  { id: 'hygiene-household', name: 'Hygiene & Household' },
  { id: 'mental-wellness', name: 'Mental Wellness' },
  { id: 'legal-assistance', name: 'Legal Assistance' },
  { id: 'substance-use', name: 'Substance Use' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'young-adults', name: 'Young Adults' },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [zipCode, setZipCode] = useState<string>('');
  const [useLocation, setUseLocation] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { triggerHaptic } = useAccessibility();

  // Translations
  const { text: welcomeText } = useTranslatedText('Welcome To');
  const { text: santaBarbaraText } = useTranslatedText('Santa Barbara 211');
  const { text: descriptionText } = useTranslatedText('Find essential services, including food, shelter, health care and more.');
  const { text: letsGoText } = useTranslatedText("Let's Go");
  const { text: findResourcesText } = useTranslatedText('Find Resources Closest To You');
  const { text: locationDescText } = useTranslatedText('Use Your Current Location or Enter Your Zip Code');
  const { text: enterZipText } = useTranslatedText('Enter your zip code');
  const { text: useLocationText } = useTranslatedText('Click to use your current location');
  const { text: saveText } = useTranslatedText('Save');
  const { text: skipText } = useTranslatedText('Skip');
  const { text: selectThreeText } = useTranslatedText('Select Three Resources That You Use Most Often');

  const handleNext = (): void => {
    if (triggerHaptic) triggerHaptic('light');
    setCurrentStep((prev) => prev + 1);
    Keyboard.dismiss();
  };

  const handleCategoryToggle = (categoryId: string): void => {
    if (triggerHaptic) triggerHaptic('light');
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : prev.length < 3
        ? [...prev, categoryId]
        : prev
    );
  };

  const handleComplete = (): void => {
    if (triggerHaptic) triggerHaptic('medium');
    onComplete({
      zipCode: zipCode || undefined,
      useLocation,
      favoriteCategories: selectedCategories,
    });
    Keyboard.dismiss();
  };

  const handleLocationRequest = (): void => {
    setUseLocation(true);
    if (triggerHaptic) triggerHaptic('light');
  };

  // Import the image via static import if possible.
  // Place your logo at: apps/mobile/assets/new-211-logo.png
  // Then import like this:
  import logoSource from '../../assets/new-211-logo.png';

  if (currentStep === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          <Text style={styles.logoDesc}>Get connected. Get Help.</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.welcome}>
            {welcomeText}{"\n"}{santaBarbaraText}
          </Text>
          <Text style={styles.description}>{descriptionText}</Text>
        </View>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleNext}
          accessibilityLabel="Continue to next step"
        >
          <Text style={styles.primaryBtnText}>{letsGoText}</Text>
          <MaterialIcons name="arrow-forward" size={22} color="#fff" style={{ marginLeft: 7 }} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.center}>
        <Image source={logoSource} style={styles.logoSmall} resizeMode="contain" />
        <Text style={styles.logoDesc}>Get connected. Get Help.</Text>
      </View>
      <Text style={styles.sectionTitle}>{findResourcesText}</Text>
      <Text style={styles.description}>{locationDescText}</Text>
      <TextInput
        style={styles.input}
        placeholder={enterZipText}
        value={zipCode}
        onChangeText={setZipCode}
        keyboardType="numeric"
        maxLength={5}
        accessibilityLabel="Enter zip code"
      />
      <TouchableOpacity
        style={styles.outlineBtn}
        onPress={handleLocationRequest}
        accessibilityLabel="Use current location"
      >
        <Ionicons name="location" size={20} color="#005191" style={{ marginRight: 8 }} />
        <Text style={styles.outlineBtnText}>{useLocationText}</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>{selectThreeText}</Text>
      <View style={styles.categoriesSection}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryBtn,
              selectedCategories.includes(category.id) && styles.categoryBtnSelected,
              selectedCategories.length >= 3 && !selectedCategories.includes(category.id) ? styles.categoryBtnDisabled : {},
            ]}
            onPress={() => handleCategoryToggle(category.id)}
            disabled={!selectedCategories.includes(category.id) && selectedCategories.length >= 3}
            accessibilityLabel={`Select ${category.name} category`}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategories.includes(category.id) && styles.categoryTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.selectedCount}>
        {selectedCategories.length > 0
          ? `${selectedCategories.length} of 3 categories selected`
          : "Categories are optional - click Continue to proceed"}
      </Text>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleComplete}
        accessibilityLabel="Complete onboarding and go to home screen"
      >
        <MaterialIcons name="home" size={22} color="#fff" style={{ marginRight: 10 }} />
        <Text style={styles.primaryBtnText}>Continue to Home</Text>
        <MaterialIcons name="arrow-forward" size={22} color="#fff" style={{ marginLeft: 7 }} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleComplete}
        accessibilityLabel="Skip location and category setup"
      >
        <Text style={styles.skipBtnText}>{skipText}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 22 },
  scrollContent: { paddingBottom: 30 },
  center: { alignItems: "center", marginVertical: 10 },
  logo: { width: 120, height: 120, marginBottom: 10 },
  logoSmall: { width: 80, height: 80, marginBottom: 10 },
  logoDesc: { color: "#666", fontSize: 14, marginBottom: 12 },
  welcome: { fontSize: 22, color: "#222", textAlign: "center", marginBottom: 8, fontWeight: "600" },
  description: { color: "#555", fontSize: 15, marginBottom: 15, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#007aff", marginVertical: 8, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 13, fontSize: 16,
    marginVertical: 10, backgroundColor: "#f5fafd"
  },
  outlineBtn: {
    flexDirection: "row", alignItems: "center", borderColor: "#005191", borderWidth: 2,
    borderRadius: 8, paddingVertical: 11, paddingHorizontal: 16, marginVertical: 5
  },
  outlineBtnText: { color: "#005191", fontWeight: "700", fontSize: 16 },
  categoriesSection: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "center", padding: 4,
    marginVertical: 10, gap: 7
  },
  categoryBtn: {
    borderRadius: 8, borderWidth: 1, borderColor: "#ccc", padding: 8,
    margin: 6, backgroundColor: "#f7f7fa", minWidth: 110, minHeight: 40, alignItems: "center",
    justifyContent: "center"
  },
  categoryBtnSelected: { backgroundColor: "#00519122", borderColor: "#005191" },
  categoryBtnDisabled: { backgroundColor: "#eee", borderColor: "#ddd" },
  categoryText: { fontSize: 15, color: "#222", fontWeight: "600" },
  categoryTextSelected: { color: "#005191" },
  selectedCount: { textAlign: "center", color: "#555", fontSize: 13, marginVertical: 7 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#005191", borderColor: "#FFB351", borderWidth: 2,
    borderRadius: 10, paddingVertical: 15, marginVertical: 11,
    shadowColor: "#000", shadowOpacity: 0.13, shadowRadius: 8, elevation: 9
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  skipBtn: {
    alignItems: "center", justifyContent: "center", backgroundColor: "#FFB351",
    borderRadius: 9, paddingVertical: 11, marginVertical: 7,
    shadowColor: "#000", shadowOpacity: 0.09, shadowRadius: 5, elevation: 6
  },
  skipBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

