import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  display: 'default' | 'high-contrast';
  reduceMotion: boolean;
  screenReader: boolean;
  hapticFeedback: boolean;
}

export default function AccessibilityScreen() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    display: 'default',
    reduceMotion: false,
    screenReader: false,
    hapticFeedback: false
  });

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('accessibilitySettings').then(saved => {
      if (saved) {
        try { setSettings(JSON.parse(saved)); }
        catch (e) { /* ignore */ }
      }
    });
  }, []);

  // Apply and save settings
  useEffect(() => {
    AsyncStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    // Mobile: apply font scaling/high contrast by passing settings to context or style everywhere
    // Screen reader, haptics, etc. are handled by your actual native contexts
  }, [settings]);

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Toast/haptic: implement your mobile notification/haptic utility here if available
  };
  const resetSettings = () => {
    setSettings({
      fontSize: 'medium',
      display: 'default',
      reduceMotion: false,
      screenReader: false,
      hapticFeedback: false
    });
    // Toast/haptic
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="visibility" size={32} color="#005191" />
        </View>
        <Text style={styles.headerTitle}>Accessibility Settings</Text>
        <Text style={styles.headerDesc}>
          Customize your experience to meet your accessibility needs
        </Text>
      </View>
      {/* Font Size */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="text-fields" size={24} color="#005191" />
          <Text style={styles.cardTitle}>Font Size</Text>
        </View>
        <View style={styles.radioRow}>
          {['small', 'medium', 'large'].map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.radioBtn,
                settings.fontSize === size && styles.radioActive
              ]}
              onPress={() => handleSettingChange('fontSize', size)}
              accessible accessibilityLabel={`Set font size to ${size}`}
            >
              <Text style={[
                styles.radioText,
                size === "small" ? styles.fontSmall : (size === "large" ? styles.fontLarge : styles.fontMedium)
              ]}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Text>
              {settings.fontSize === size &&
                <MaterialIcons name="check" size={20} color="#007aff" style={styles.checkIcon} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Display */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="contrast" size={24} color="#005191" />
          <Text style={styles.cardTitle}>Display</Text>
        </View>
        <View style={styles.radioRow}>
          {['default', 'high-contrast'].map(mode => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.radioBtn,
                settings.display === mode && styles.radioActive
              ]}
              onPress={() => handleSettingChange('display', mode)}
              accessible accessibilityLabel={`Set display mode to ${mode}`}
            >
              <Text style={styles.radioText}>
                {mode === 'default' ? 'Default colors' : 'High contrast colors'}
              </Text>
              {settings.display === mode &&
                <MaterialIcons name="check" size={20} color="#007aff" style={styles.checkIcon} />}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.infoText}>High contrast increases color contrast for visibility.</Text>
      </View>
      {/* Motion */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="motion-photos-on" size={22} color="#005191" />
          <Text style={styles.cardTitle}>Motion & Animation</Text>
        </View>
        <View style={styles.switchRow}>
          <Text>Reduce motion</Text>
          <Switch
            value={settings.reduceMotion}
            onValueChange={val => handleSettingChange('reduceMotion', val)}
          />
        </View>
      </View>
      {/* Screen Reader */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="volume-up" size={22} color="#005191" />
          <Text style={styles.cardTitle}>Screen Reader</Text>
        </View>
        <View style={styles.switchRow}>
          <Text>Enable screen reader optimizations</Text>
          <Switch
            value={settings.screenReader}
            onValueChange={val => handleSettingChange('screenReader', val)}
          />
        </View>
      </View>
      {/* Haptic */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <FontAwesome5 name="mobile" size={22} color="#005191" />
          <Text style={styles.cardTitle}>Haptic Feedback</Text>
        </View>
        <View style={styles.switchRow}>
          <Text>Enable haptic feedback</Text>
          <Switch
            value={settings.hapticFeedback}
            onValueChange={val => handleSettingChange('hapticFeedback', val)}
          />
        </View>
      </View>
      {/* Reset and Extra Info */}
      <View style={styles.resetSection}>
        <TouchableOpacity onPress={resetSettings} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>Reset All Settings</Text>
        </TouchableOpacity>
        <Text style={styles.resetDesc}>
          This will restore all accessibility settings to their default values.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.infoTitle}>Additional Accessibility Resources</Text>
        <Text style={styles.infoItem}>
          • Contact us at <Text style={styles.phoneLink}>1-800-400-1572</Text> for accessibility assistance
        </Text>
        <Text style={styles.infoItem}>• Screen readers announce page content and form labels</Text>
        <Text style={styles.infoItem}>• All interactive elements meet accessibility standards</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faff' },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 18 },
  iconCircle: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  headerTitle: { fontSize: 27, fontWeight: 'bold', marginBottom: 7, color: '#222' },
  headerDesc: { fontSize: 16, color: '#555' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 18 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 18, marginLeft: 7, fontWeight: 'bold', color: '#005191' },
  radioRow: { flexDirection: 'row', marginBottom: 7, justifyContent: 'space-around' },
  radioBtn: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 7, borderWidth: 2, borderColor: '#eaeaea', marginHorizontal: 4 },
  radioActive: { borderColor: '#007aff', backgroundColor: '#e0f2fe' },
  radioText: { fontSize: 15, color: '#222', fontWeight: '600' },
  fontSmall: { fontSize: 13 }, fontMedium: { fontSize: 15 }, fontLarge: { fontSize: 19 },
  checkIcon: { marginTop: 3 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoText: { fontSize: 13, color: '#666', marginTop: 6 },
  resetSection: { alignItems: 'center', marginVertical: 22 },
  resetBtn: { backgroundColor: '#e0e7ff', borderRadius: 8, paddingHorizontal: 22, paddingVertical: 10 },
  resetBtnText: { color: '#005191', fontWeight: '700', fontSize: 16 },
  resetDesc: { fontSize: 13, color: '#666', marginTop: 5, textAlign: 'center' },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#005191', marginBottom: 7 },
  infoItem: { fontSize: 13, color: '#257', marginBottom: 4 },
  phoneLink: { textDecorationLine: 'underline', color: '#007aff' },
});
