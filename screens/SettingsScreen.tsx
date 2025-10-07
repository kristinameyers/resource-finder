import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  Switch, Modal, Pressable, Platform, Alert 
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useLanguage, Language } from "../contexts/LanguageContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import Constants from 'expo-constants'; 

// 🛑 Configuration Constants
const GOOGLE_TRANSLATE_API_KEY = Constants.expoConfig?.extra?.GOOGLE_TRANSLATE_API_KEY;

const FONT_PREVIEW_SIZES = {
  small: 14, 
  medium: 18,
  large: 22,
};

// You can keep the scaling constants here or move them inside the component
const FONT_SCALING = {
  small: -2,
  medium: 0,
  large: 4,
};
const BASE_FONT_SIZE = 16;


// 🛑 Fallback/Utility colors for missing theme properties
const FALLBACK_THEME = {
    backgroundSecondary: '#f5f5f5', 
    cardBackground: 'white',
    iconColor: '#888',
    switchOff: '#ccc', 
    border: '#e0e0e0',
    accentBackground: '#e0e7ff', 
    textSecondary: '#666', 
    text: '#222', // Fallback for general text
    primary: '#005191', // Fallback for primary
    background: '#ffffff', // Fallback for background
};

// 🛑 High Contrast Color Palette (Define the specific high contrast colors)
const HIGH_CONTRAST_COLORS = {
    background: '#000000', // Black background
    backgroundSecondary: '#000000', // Black secondary background
    cardBackground: '#000000', // Black cards
    text: '#FFFF00', // Bright yellow text
    primary: '#FFFF00', // Bright yellow accent
    textSecondary: '#FFFFFF', // White secondary text
    iconColor: '#FFFFFF', // White icons
    switchOff: '#555555', // Dark grey switch track when off
    border: '#FFFFFF', // White border
    accentBackground: '#333333', // Dark grey accent background
};

export default function SettingsScreen() {
  const { currentLanguage, setLanguage, translateBatch, clearTranslationCache } = useLanguage();
  const { fontSize, highContrast, reduceMotion, screenReader, hapticFeedback,
    setFontSize, setHighContrast, setReduceMotion, setScreenReader, setHapticFeedback,
    triggerHaptic, theme: contextTheme } = useAccessibility(); // Renamed imported theme to contextTheme

  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [pickerVisible, setPickerVisible] = useState(false);

  // ✅ FIX 1: Define getScaledFontSize here where `fontSize` is in scope
  const getScaledFontSize = (base: number) => {
    // We use BASE_FONT_SIZE for reference, but the scaling is applied based on the component's original size
    const scale = FONT_SCALING[fontSize as 'small' | 'medium' | 'large'] || 0;
    return base + scale;
  };

  // ✅ FIX 3: Define the dynamic theme object based on highContrast state
  const dynamicTheme = highContrast 
    ? { ...contextTheme, ...HIGH_CONTRAST_COLORS }
    : { ...contextTheme, ...FALLBACK_THEME };
    
  // Merge dynamic theme with fallbacks (ensure fallbacks/base colors are used if contextTheme doesn't provide them)
  const effectiveTheme = { ...FALLBACK_THEME, ...dynamicTheme }; 

  // ... (Language Data and Translation Effect remain the same) ...

  // Language Data
  const languages: { code: Language, name: string, nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish (Mexican)', nativeName: 'Español (México)' },
    { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' }
  ];

  // Translation Effect (Ready for API Key)
  useEffect(() => {
    let isCancelled = false;
    const defaultTexts: Record<string, string> = {
      // ... (All default texts remain the same) ...
      'Settings': 'Settings', 'Language': 'Language', 'Choose your preferred language': 'Choose your preferred language',
      'Current Language': 'Current Language', 'Resource Finder Settings': 'Resource Finder Settings',
      'Configure your app preferences': 'Configure your app preferences', 'Accessibility': 'Accessibility',
      'Customize display and interaction settings': 'Customize display and interaction settings', 'Font Size': 'Font Size',
      'Make text easier to read': 'Make text easier to read', 'Small': 'Small', 'Medium': 'Medium', 'Large': 'Large',
      'Display Mode': 'Display Mode', 'Choose how content appears': 'Choose how content appears', 'Default': 'Default',
      'High Contrast': 'High Contrast', 'Reduce Motion': 'Reduce Motion', 'Motion': 'Motion',
      'Reduce animations and transitions': 'Reduce animations and transitions', 'Screen Reader': 'Screen Reader',
      'Optimize for screen reader users': 'Optimize for screen reader users', 'Enable Screen Reader Mode': 'Enable Screen Reader Mode',
      'Haptic Feedback': 'Haptic Feedback', 'Vibration feedback for interactions': 'Vibration feedback for interactions',
      'Enable Haptic Feedback': 'Enable Haptic Feedback',
      'Settings are automatically saved and will be remembered next time you visit.': 'Settings are automatically saved and will be remembered next time you visit.',
      'Clear Translation Cache': 'Clear Translation Cache'
    };
    if (currentLanguage === 'en') {
      if (!isCancelled) setTranslatedTexts(defaultTexts);
      return;
    }
    
    // We only check for the key, but do not pass it as an argument here.
    if (!GOOGLE_TRANSLATE_API_KEY) {
        console.warn("GOOGLE_TRANSLATE_API_KEY is missing. Using default (English) texts.");
        setTranslatedTexts(defaultTexts);
        return; 
    }

    const textsToTranslate = Object.keys(defaultTexts);
    // 🛑 FIX: Removed the third argument (GOOGLE_TRANSLATE_API_KEY) from translateBatch call.
    translateBatch(textsToTranslate, currentLanguage).then(results => {
      if (!isCancelled) {
        const translations = { ...defaultTexts };
        textsToTranslate.forEach((text, i) => { translations[text] = results[i] || text; });
        setTranslatedTexts(translations);
      }
    }).catch(err => {
      console.error('Batch translation error:', err);
      setTranslatedTexts(defaultTexts);
    });
    return () => { isCancelled = true; };
  }, [currentLanguage, translateBatch]); // Added translateBatch to dependencies

  const t = (text: string) => translatedTexts[text] || text;

  // Haptic Handler
  const handleAccessibilityToggle = (setter: (value: boolean) => void, newValue: boolean) => {
    setter(newValue);
    if (hapticFeedback) {
        triggerHaptic('light'); 
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: effectiveTheme.backgroundSecondary }]} 
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIconCircle, { backgroundColor: effectiveTheme.primary }]}>
          <MaterialIcons name="settings" size={32} color={highContrast ? '#000000' : '#fff'} />
        </View>
        {/* ✅ FIX 2: Apply scaled font size (Base size 26 from styles.headerTitle) */}
        <Text style={[
            styles.headerTitle, 
            { color: effectiveTheme.text, fontSize: getScaledFontSize(26) }
        ]}>{t('Resource Finder Settings')}</Text>
        {/* ✅ FIX 2: Apply scaled font size (Base size 15 from styles.headerDesc) */}
        <Text style={[
            styles.headerDesc, 
            { color: effectiveTheme.textSecondary, fontSize: getScaledFontSize(15) }
        ]}>{t('Configure your app preferences')}</Text>
      </View>

      {/* Language Settings */}
      <View style={[styles.card, { backgroundColor: effectiveTheme.cardBackground }]}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="globe-outline" size={22} color={effectiveTheme.primary} />
          <Text style={[styles.cardHeaderTitle, { color: effectiveTheme.primary }]}>{t('Language')}</Text>
        </View>
        <Text style={[styles.cardDesc, { color: effectiveTheme.textSecondary }]}>{t('Choose your preferred language')}</Text>
        {/* ✅ FIX 2: Apply scaled font size (Base size 15 from styles.label) */}
        <Text style={[
            styles.label, 
            { color: effectiveTheme.text, fontSize: getScaledFontSize(15) }
        ]}>{t('Current Language')}</Text>
        <View style={[styles.currentLanguageRow, { 
          backgroundColor: effectiveTheme.accentBackground,
          borderColor: highContrast ? effectiveTheme.border : 'transparent', // High contrast border
          borderWidth: highContrast ? 1 : 0, 
        }]}>
          <FontAwesome name="check" size={18} color={effectiveTheme.primary} />
          {/* ✅ FIX 2: Apply scaled font size (Base size 16 from styles.currentLanguageMain's implicit size/design) */}
          <Text style={[
            styles.currentLanguageMain, 
            { color: effectiveTheme.primary, fontSize: getScaledFontSize(16) }
          ]}>{languages.find(l => l.code === currentLanguage)?.nativeName}</Text>
          <Text style={[styles.currentLanguageSub, { color: effectiveTheme.textSecondary }]}>({languages.find(l => l.code === currentLanguage)?.name})</Text>
        </View>
        {/* Language Picker Button */}
        <TouchableOpacity
          style={[
            styles.languagePickerBtn, 
            { 
              backgroundColor: effectiveTheme.accentBackground,
              borderColor: highContrast ? effectiveTheme.border : 'transparent',
              borderWidth: highContrast ? 1 : 0,
            }
          ]}
          onPress={() => { setPickerVisible(true); triggerHaptic('light'); }} 
        >
          <Text style={[styles.languagePickerBtnText, { color: effectiveTheme.primary }]}>
            {t('Choose your preferred language')}
          </Text>
        </TouchableOpacity>
        {/* Language Picker Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={pickerVisible}
          onRequestClose={() => setPickerVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
            <Pressable style={[styles.modalContent, { backgroundColor: effectiveTheme.cardBackground }]}> 
              {languages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: highContrast ? effectiveTheme.border : '#e0e0e0' },
                  ]}
                  onPress={() => {
                    setLanguage(lang.code);
                    triggerHaptic('heavy'); 
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    { color: effectiveTheme.text }, // 🛑 FIX: Use theme.text instead of theme.textPrimary
                    currentLanguage === lang.code && styles.modalOptionTextSelected,
                    currentLanguage === lang.code && { color: effectiveTheme.primary }
                  ]}>
                    {lang.nativeName} ({lang.name})
                  </Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </View>

      {/* Accessibility Settings */}
      <View style={[styles.card, { backgroundColor: effectiveTheme.cardBackground }]}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="accessibility" size={22} color={effectiveTheme.primary} />
          <Text style={[styles.cardHeaderTitle, { color: effectiveTheme.primary }]}>{t('Accessibility')}</Text>
        </View>
        <Text style={[styles.cardDesc, { color: effectiveTheme.textSecondary }]}>{t('Customize display and interaction settings')}</Text>
        
        {/* Font Size Feature */}
        {/* ✅ FIX 2: Apply scaled font size (Base size 15 from styles.label) */}
        <Text style={[
            styles.label, 
            { color: effectiveTheme.text, fontSize: getScaledFontSize(15) }
        ]}>{t('Font Size')}</Text>
        
        <View style={styles.fontSizeRow}>
          {Object.entries(FONT_PREVIEW_SIZES).map(([sizeKey, sizeValue]) => (
            <TouchableOpacity
              key={sizeKey}
              style={[
                styles.fontSizeOption, 
                { borderColor: effectiveTheme.border }, 
                fontSize === sizeKey && [
                  styles.fontSizeActive, 
                  { 
                    borderColor: effectiveTheme.primary, 
                    backgroundColor: effectiveTheme.accentBackground 
                  }
                ] 
              ]}
              onPress={() => { 
                setFontSize(sizeKey as 'small' | 'medium' | 'large');
                triggerHaptic('light'); 
              }}
            >
              <Text style={[
                styles.fontSizeLabel,
                { fontSize: sizeValue, color: effectiveTheme.text } 
              ]}>
                Aa
              </Text>
              <Text style={[styles.fontSizeOptionText, { color: effectiveTheme.textSecondary }]}>{t(sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1))}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Display Mode Feature */}
        <Text style={[styles.label, { color: effectiveTheme.text }]}>{t('Display Mode')}</Text>
        <View style={styles.displayModeRow}>
          {/* Default */}
          <TouchableOpacity 
            style={[
              styles.displayModeOption, 
              { borderColor: effectiveTheme.border }, 
              !highContrast && [
                styles.displayModeActive, 
                { 
                  borderColor: effectiveTheme.primary, 
                  backgroundColor: effectiveTheme.accentBackground 
                }
              ] 
            ]}
            onPress={() => { setHighContrast(false); triggerHaptic('light'); }}
          >
            <MaterialIcons name="visibility" size={20} color={effectiveTheme.primary} />
            <Text style={[styles.displayModeOptionText, { color: effectiveTheme.text }]}>{t('Default')}</Text>
          </TouchableOpacity>
          {/* High Contrast */}
          <TouchableOpacity 
            style={[
              styles.displayModeOption, 
              { borderColor: effectiveTheme.border }, 
              highContrast && [
                styles.displayModeActive, 
                { 
                  borderColor: effectiveTheme.primary, 
                  backgroundColor: effectiveTheme.accentBackground 
                }
              ] 
            ]}
            onPress={() => { setHighContrast(true); triggerHaptic('light'); }}
          >
            <MaterialIcons name="contrast" size={20} color={effectiveTheme.primary} />
            <Text style={[styles.displayModeOptionText, { color: effectiveTheme.text }]}>{t('High Contrast')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Reduce Motion Switch */}
        <View style={styles.switchRow}>
          <MaterialIcons name="waves" size={18} color={effectiveTheme.iconColor} />
          <Text style={[styles.switchLabel, { color: effectiveTheme.text }]}>{t('Reduce Motion')}</Text>
          <Switch 
            value={reduceMotion} 
            onValueChange={(v) => handleAccessibilityToggle(setReduceMotion, v)} 
            trackColor={{ false: effectiveTheme.switchOff, true: effectiveTheme.primary }} 
          />
        </View>
        
        {/* Screen Reader Switch */}
        <View style={styles.switchRow}>
          <MaterialIcons name="record-voice-over" size={18} color={effectiveTheme.iconColor} />
          <Text style={[styles.switchLabel, { color: effectiveTheme.text }]}>{t('Enable Screen Reader Mode')}</Text>
          <Switch 
            value={screenReader} 
            onValueChange={(v) => handleAccessibilityToggle(setScreenReader, v)} 
            trackColor={{ false: effectiveTheme.switchOff, true: effectiveTheme.primary }}
          />
        </View>
        
        {/* Haptic Feedback Switch */}
        <View style={styles.switchRow}>
          <MaterialIcons name="phonelink-ring" size={18} color={effectiveTheme.iconColor} />
          <Text style={[styles.switchLabel, { color: effectiveTheme.text }]}>{t('Enable Haptic Feedback')}</Text>
          <Switch 
            value={hapticFeedback} 
            onValueChange={(v) => handleAccessibilityToggle(setHapticFeedback, v)} 
            trackColor={{ false: effectiveTheme.switchOff, true: effectiveTheme.primary }}
          />
        </View>
      </View>
      
      {/* Info Card */}
      <View style={[styles.card, { backgroundColor: effectiveTheme.cardBackground }]}>
        <Text style={[styles.infoText, { color: effectiveTheme.textSecondary }]}>
          {t('Settings are automatically saved and will be remembered next time you visit.')}
        </Text>
      </View>
      
      {/* Developer Card (For API Key Check) */}
      {__DEV__ && (
        <View style={[styles.card, { backgroundColor: effectiveTheme.cardBackground }]}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons name="build" size={22} color={effectiveTheme.textSecondary} />
            <Text style={[styles.cardHeaderTitle, { color: effectiveTheme.text }]}>Developer Tools</Text>
          </View>
          <View style={styles.devRow}>
            <Text style={[styles.devLabel, { color: effectiveTheme.text }]}>{t("Clear Translation Cache")}</Text>
            <TouchableOpacity onPress={() => { clearTranslationCache(); triggerHaptic('heavy');}} style={[styles.clearCacheBtn, { 
                backgroundColor: effectiveTheme.accentBackground,
                borderColor: highContrast ? effectiveTheme.border : 'transparent',
                borderWidth: highContrast ? 1 : 0,
            }]}>
              <Text style={[styles.clearCacheText, { color: effectiveTheme.text }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          {!GOOGLE_TRANSLATE_API_KEY && (
            <Text style={{ color: 'red', marginTop: 10 }}>
                Translation API Key Missing: Check Constants.expoConfig.extra
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ... (Styles remain the same) ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16 },
  header: { alignItems: "center", marginBottom: 20 },
  headerIconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#005191",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#222", marginBottom: 4 },
  headerDesc: { color: "#666", fontSize: 15 },
  card: { backgroundColor: "white", borderRadius: 8, padding: 16, marginBottom: 18 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  cardHeaderTitle: { fontSize: 19, marginLeft: 8, color: "#005191", fontWeight: "bold" },
  cardDesc: { fontSize: 16, color: "#555", marginBottom: 9 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  fontSizeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  fontSizeOption: { borderWidth: 2, borderColor: "#e0e0e0", borderRadius: 8, padding: 11, alignItems: "center", flex: 1, marginHorizontal: 4 },
  fontSizeActive: { borderColor: "#005191", backgroundColor: "#e3effb" },
  fontSizeLabel: { fontWeight: "bold" },
  fontSizeOptionText: { fontSize: 13, color: "#555", marginTop: 2 },
  currentLanguageRow: { flexDirection: "row", alignItems: "center", padding: 8, backgroundColor: "#e0e7ef", borderRadius: 6, marginVertical: 7 },
  currentLanguageMain: { fontWeight: "bold", color: "#005191", marginHorizontal: 8 },
  currentLanguageSub: { color: "#666", fontSize: 13 },
  displayModeRow: { flexDirection: "row", marginBottom: 8 },
  displayModeOption: { flex: 1, alignItems: "center", paddingVertical: 10, borderWidth: 2, borderColor: "#e0e0e0", borderRadius: 6, marginHorizontal: 3 },
  displayModeActive: { borderColor: "#007aff", backgroundColor: "#eef6ff" },
  displayModeOptionText: { fontSize: 15, color: "#333" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, marginTop: 10 },
  switchLabel: { fontSize: 15, flex: 1, marginLeft: 8 },
  infoText: { textAlign: "center", color: "#888", fontSize: 14 },
  devRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  devLabel: { fontSize: 15, color: "#444" },
  clearCacheBtn: { padding: 7, backgroundColor: "#eee", borderRadius: 5, marginLeft: 8 },
  clearCacheText: { color: "#222", fontWeight: "700" },
  languagePickerBtn: { marginTop: 10, padding: 10, backgroundColor: "#e8eaf6", borderRadius: 6, alignSelf: 'flex-start' },
  languagePickerBtnText: { color: "#005191", fontWeight: "bold", fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(0,0,0,0.24)" },
  modalContent: { backgroundColor: "#fff", borderRadius: 10, padding: 20, minWidth: 260 },
  modalOption: { padding: 11 },
  modalOptionText: { fontSize: 17, color: "#005191" },
  modalOptionTextSelected: { fontWeight: "bold", color: "#007aff" }
});