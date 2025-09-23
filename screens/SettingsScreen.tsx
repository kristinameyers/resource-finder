import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Modal, Pressable } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useLanguage, Language } from "../contexts/LanguageContext";
import { useAccessibility } from "../contexts/AccessibilityContext";

export default function SettingsScreen() {
  const { currentLanguage, setLanguage, translateBatch, clearTranslationCache } = useLanguage();
  const { fontSize, highContrast, reduceMotion, screenReader, hapticFeedback,
    setFontSize, setHighContrast, setReduceMotion, setScreenReader, setHapticFeedback,
    triggerHaptic, theme } = useAccessibility();

  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [pickerVisible, setPickerVisible] = useState(false);

  // Language support
  const languages: { code: Language, name: string, nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish (Mexican)', nativeName: 'Español (México)' },
    { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' }
  ];

  useEffect(() => {
    let isCancelled = false;
    const defaultTexts: Record<string, string> = {
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
      'Settings are automatically saved and will be remembered next time you visit.': 'Settings are automatically saved and will be remembered next time you visit.'
    };
    if (currentLanguage === 'en') {
      if (!isCancelled) setTranslatedTexts(defaultTexts);
      return;
    }

    const textsToTranslate = Object.keys(defaultTexts);
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
  }, [currentLanguage]);

  const t = (text: string) => translatedTexts[text] || text;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconCircle}>
          <MaterialIcons name="settings" size={32} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>{t('Resource Finder Settings')}</Text>
        <Text style={styles.headerDesc}>{t('Configure your app preferences')}</Text>
      </View>

      {/* Language Settings */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="globe-outline" size={22} color="#005191" />
          <Text style={styles.cardHeaderTitle}>{t('Language')}</Text>
        </View>
        <Text style={styles.cardDesc}>{t('Choose your preferred language')}</Text>
        <Text style={styles.label}>{t('Current Language')}</Text>
        <View style={styles.currentLanguageRow}>
          <FontAwesome name="check" size={18} color="#005191" />
          <Text style={styles.currentLanguageMain}>{languages.find(l => l.code === currentLanguage)?.nativeName}</Text>
          <Text style={styles.currentLanguageSub}>({languages.find(l => l.code === currentLanguage)?.name})</Text>
        </View>
        {/* Language Picker - replaced native-base Picker with custom modal */}
        <TouchableOpacity
          style={styles.languagePickerBtn}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.languagePickerBtnText}>
            {t('Choose your preferred language')}
          </Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={pickerVisible}
          onRequestClose={() => setPickerVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
            <View style={styles.modalContent}>
              {languages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.modalOption}
                  onPress={() => {
                    setLanguage(lang.code);
                    triggerHaptic('light');
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    currentLanguage === lang.code && styles.modalOptionTextSelected
                  ]}>
                    {lang.nativeName} ({lang.name})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>

      {/* Accessibility Settings (unchanged) */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="accessibility" size={22} color="#005191" />
          <Text style={styles.cardHeaderTitle}>{t('Accessibility')}</Text>
        </View>
        <Text style={styles.cardDesc}>{t('Customize display and interaction settings')}</Text>
        {/* Font Size */}
        <Text style={styles.label}>{t('Font Size')}</Text>
        <View style={styles.fontSizeRow}>
          {['small', 'medium', 'large'].map(size => (
            <TouchableOpacity
              key={size}
              style={[styles.fontSizeOption, fontSize === size && styles.fontSizeActive]}
              onPress={() => setFontSize(size as 'small' | 'medium' | 'large')}
            >
              <Text style={[
                styles.fontSizeLabel,
                size === 'large' ? styles.fontSizeLarge :
                  size === 'small' ? styles.fontSizeSmall : styles.fontSizeMedium
              ]}>
                Aa
              </Text>
              <Text style={styles.fontSizeOptionText}>{t(size.charAt(0).toUpperCase() + size.slice(1))}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Display Mode */}
        <Text style={styles.label}>{t('Display Mode')}</Text>
        <View style={styles.displayModeRow}>
          <TouchableOpacity style={[styles.displayModeOption, !highContrast && styles.displayModeActive]}
            onPress={() => setHighContrast(false)}>
            <MaterialIcons name="visibility" size={20} color="#007aff" />
            <Text style={styles.displayModeOptionText}>{t('Default')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.displayModeOption, highContrast && styles.displayModeActive]}
            onPress={() => setHighContrast(true)}>
            <MaterialIcons name="contrast" size={20} color="#005191" />
            <Text style={styles.displayModeOptionText}>{t('High Contrast')}</Text>
          </TouchableOpacity>
        </View>
        {/* Reduce Motion */}
        <View style={styles.switchRow}>
          <MaterialIcons name="waves" size={18} color="#888" />
          <Text style={styles.switchLabel}>{t('Reduce Motion')}</Text>
          <Switch value={reduceMotion} onValueChange={setReduceMotion} />
        </View>
        {/* Screen Reader */}
        <View style={styles.switchRow}>
          <MaterialIcons name="record-voice-over" size={18} color="#888" />
          <Text style={styles.switchLabel}>{t('Enable Screen Reader Mode')}</Text>
          <Switch value={screenReader} onValueChange={setScreenReader} />
        </View>
        {/* Haptic Feedback */}
        <View style={styles.switchRow}>
          <MaterialIcons name="phonelink-ring" size={18} color="#888" />
          <Text style={styles.switchLabel}>{t('Enable Haptic Feedback')}</Text>
          <Switch value={hapticFeedback} onValueChange={setHapticFeedback} />
        </View>
      </View>
      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.infoText}>
          {t('Settings are automatically saved and will be remembered next time you visit.')}
        </Text>
      </View>
      {/* Developer Card */}
      {__DEV__ && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons name="build" size={22} color="#999" />
            <Text style={styles.cardHeaderTitle}>Developer Tools</Text>
          </View>
          <View style={styles.devRow}>
            <Text style={styles.devLabel}>{t("Clear Translation Cache")}</Text>
            <TouchableOpacity onPress={clearTranslationCache} style={styles.clearCacheBtn}>
              <Text style={styles.clearCacheText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

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
  fontSizeSmall: { fontSize: 14 }, fontSizeMedium: { fontSize: 18 }, fontSizeLarge: { fontSize: 22 },
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
  devRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
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
