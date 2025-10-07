import React from 'react';
import { View, Text, ScrollView, Linking, StyleSheet } from 'react-native';
import { Card } from '../components/ui/Card';
import { useTranslatedText } from '../components/TranslatedText';
// 👈 NEW IMPORT:
import { useAccessibility } from "../contexts/AccessibilityContext";

// Scaling Constants (Same as other screens)
const FONT_SCALING = {
  small: -2,
  medium: 0,
  large: 4,
};


export default function About() {
  // 1. Get `fontSize` AND `theme` from context
  const { fontSize, theme, highContrast } = useAccessibility();
  
  // 2. Define the scaling utility function (Can be simplified by using getFontSize from context)
  const getScaledFontSize = (base: number) => {
    const scale = FONT_SCALING[fontSize as 'small' | 'medium' | 'large'] || 0;
    return base + scale;
  };
  
  const { text: aboutTitleText } = useTranslatedText("About 2-1-1");
  const { text: aboutSubtitleText } = useTranslatedText("Connecting people with the resources they need, when they need them most.");
  const { text: missionTitleText } = useTranslatedText("Our Mission");
  const { text: missionDescText } = useTranslatedText("2-1-1 is a comprehensive information and referral service that connects people with local resources in their community. We provide access to essential services including housing assistance, food programs, healthcare, employment resources, and emergency support - all available 24/7 by simply dialing 2-1-1.");
  const { text: servicesTitleText } = useTranslatedText("What We Offer");
  const { text: essentialServicesText } = useTranslatedText("Essential Services");
  const { text: supportServicesText } = useTranslatedText("Support Services");

  const handleCall = () => {
    Linking.openURL('tel:18004001572');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.211.org');
  };

  // Define High Contrast colors for the emergency box
  const emergencyColors = highContrast ? {
    backgroundColor: '#330000', // Dark red background
    borderColor: theme.border, // White/Yellow border
    titleColor: theme.text, // Yellow text
    subtextColor: theme.textSecondary, // White text
  } : {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    titleColor: '#991b1b',
    subtextColor: '#b91c1c',
  };


  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {/* FONT SCALING & HIGH CONTRAST: title (Base 28) */}
          <Text style={[styles.title, { 
            fontSize: getScaledFontSize(28),
            color: theme.text
          }]}>{aboutTitleText}</Text>
          {/* FONT SCALING & HIGH CONTRAST: subtitle (Base 18) */}
          <Text style={[styles.subtitle, { 
            fontSize: getScaledFontSize(18),
            color: theme.textSecondary
          }]}>
            {aboutSubtitleText}
          </Text>
        </View>

        {/* Mission Card */}
        {/* HIGH CONTRAST: Card background and shadow */}
        <Card style={[styles.card, { backgroundColor: theme.backgroundSecondary, shadowColor: highContrast ? theme.border : '#000' }]}>
          {/* FONT SCALING & HIGH CONTRAST: cardTitle (Base 20) */}
          <Text style={[styles.cardTitle, { 
            fontSize: getScaledFontSize(20),
            color: theme.primary
          }]}>{missionTitleText}</Text>
          {/* FONT SCALING & HIGH CONTRAST: cardContent (Base 16) */}
          <Text style={[styles.cardContent, { 
            fontSize: getScaledFontSize(16),
            color: theme.text
          }]}>
            {missionDescText}
          </Text>
        </Card>

        {/* Services Card */}
        {/* HIGH CONTRAST: Card background and shadow */}
        <Card style={[styles.card, { backgroundColor: theme.backgroundSecondary, shadowColor: highContrast ? theme.border : '#000' }]}>
          {/* FONT SCALING & HIGH CONTRAST: cardTitle (Base 20) */}
          <Text style={[styles.cardTitle, { 
            fontSize: getScaledFontSize(20),
            color: theme.primary
          }]}>{servicesTitleText}</Text>
          <View style={styles.servicesGrid}>
            <View style={styles.serviceColumn}>
              {/* FONT SCALING & HIGH CONTRAST: serviceTitle (Base 16) */}
              <Text style={[styles.serviceTitle, { 
                fontSize: getScaledFontSize(16),
                color: theme.text
              }]}>{essentialServicesText}</Text>
              {/* FONT SCALING & HIGH CONTRAST: serviceItem (Base 15) */}
              <Text style={[styles.serviceItem, { 
                fontSize: getScaledFontSize(15),
                color: theme.textSecondary
              }]}>• Housing & Shelter Assistance</Text>
              {/* FONT SCALING & HIGH CONTRAST: serviceItem (Base 15) */}
              <Text style={[styles.serviceItem, { 
                fontSize: getScaledFontSize(15),
                color: theme.textSecondary
              }]}>• Food & Nutrition Programs</Text>
              {/* FONT SCALING & HIGH CONTRAST: serviceItem (Base 15) */}
              <Text style={[styles.serviceItem, { 
                fontSize: getScaledFontSize(15),
                color: theme.textSecondary
              }]}>• Healthcare & Mental Health</Text>
              {/* FONT SCALING & HIGH CONTRAST: serviceItem (Base 15) */}
              <Text style={[styles.serviceItem, { 
                fontSize: getScaledFontSize(15),
                color: theme.textSecondary
              }]}>• Employment & Training</Text>
            </View>
            <View style={styles.serviceColumn}>
              {/* FONT SCALING & HIGH CONTRAST: serviceTitle (Base 16) */}
              <Text style={[styles.serviceTitle, { 
                fontSize: getScaledFontSize(16),
                color: theme.text
              }]}>{supportServicesText}</Text>
              {/* FONT SCALING & HIGH CONTRAST: serviceItem (Base 15) */}
              <Text style={[styles.serviceItem, { 
                fontSize: getScaledFontSize(15),
                color: theme.textSecondary
              }]}>• Legal Assistance</Text>
              {/* FONT SCALING & HIGH CONTRAST: serviceItem (Base 15) */}
              <Text style={[styles.serviceItem, { 
                fontSize: getScaledFontSize(15),
                color: theme.textSecondary
              }]}>• Transportation Services</Text>
              {/* FONT SCALING & HIGH CONTRAST: serviceItem (Base 15) */}
              <Text style={[styles.serviceItem, { 
                fontSize: getScaledFontSize(15),
                color: theme.textSecondary
              }]}>• Child & Family Support</Text>
              {/* FONT SCALING & HIGH CONTRAST: serviceItem (Base 15) */}
              <Text style={[styles.serviceItem, { 
                fontSize: getScaledFontSize(15),
                color: theme.textSecondary
              }]}>• Emergency Financial Aid</Text>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        {/* HIGH CONTRAST: Card background and shadow */}
        <Card style={[styles.card, { backgroundColor: theme.backgroundSecondary, shadowColor: highContrast ? theme.border : '#000' }]}>
          {/* FONT SCALING & HIGH CONTRAST: cardTitle (Base 20) */}
          <Text style={[styles.cardTitle, { 
            fontSize: getScaledFontSize(20),
            color: theme.primary
          }]}>Get Help Now</Text>
          <View style={styles.contactGrid}>
            <View style={styles.contactSection}>
              <View style={styles.contactItem}>
                {/* FONT SCALING & HIGH CONTRAST: contactIcon (Base 20) */}
                <Text style={[styles.contactIcon, { 
                  fontSize: getScaledFontSize(20),
                  color: theme.text // Emoji color is based on text color
                }]}>📞</Text>
                <View>
                  {/* FONT SCALING & HIGH CONTRAST: contactLabel (Base 16) */}
                  <Text style={[styles.contactLabel, { 
                    fontSize: getScaledFontSize(16),
                    color: theme.text
                  }]}>Call 2-1-1</Text>
                  {/* FONT SCALING & HIGH CONTRAST: contactLink (Base 16) */}
                  <Text style={[styles.contactLink, { 
                    fontSize: getScaledFontSize(16),
                    color: theme.primary
                  }]} onPress={handleCall}>
                    1-800-400-1572
                  </Text>
                </View>
              </View>
              
              <View style={styles.contactItem}>
                {/* FONT SCALING & HIGH CONTRAST: contactIcon (Base 20) */}
                <Text style={[styles.contactIcon, { 
                  fontSize: getScaledFontSize(20),
                  color: theme.text // Emoji color is based on text color
                }]}>🌐</Text>
                <View>
                  {/* FONT SCALING & HIGH CONTRAST: contactLabel (Base 16) */}
                  <Text style={[styles.contactLabel, { 
                    fontSize: getScaledFontSize(16),
                    color: theme.text
                  }]}>Online</Text>
                  {/* FONT SCALING & HIGH CONTRAST: contactLink (Base 16) */}
                  <Text style={[styles.contactLink, { 
                    fontSize: getScaledFontSize(16),
                    color: theme.primary
                  }]} onPress={handleWebsite}>
                    www.211.org
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.contactSection}>
              <View style={styles.infoSection}>
                {/* FONT SCALING & HIGH CONTRAST: infoTitle (Base 16) */}
                <Text style={[styles.infoTitle, { 
                  fontSize: getScaledFontSize(16),
                  color: theme.text
                }]}>Available 24/7</Text>
                {/* FONT SCALING & HIGH CONTRAST: infoText (Base 15) */}
                <Text style={[styles.infoText, { 
                  fontSize: getScaledFontSize(15),
                  color: theme.textSecondary
                }]}>
                  Our trained specialists are available around the clock to help you 
                  find the resources you need in your community.
                </Text>
              </View>
              
              <View style={styles.infoSection}>
                {/* FONT SCALING & HIGH CONTRAST: infoTitle (Base 16) */}
                <Text style={[styles.infoTitle, { 
                  fontSize: getScaledFontSize(16),
                  color: theme.text
                }]}>Multilingual Support</Text>
                {/* FONT SCALING & HIGH CONTRAST: infoText (Base 15) */}
                <Text style={[styles.infoText, { 
                  fontSize: getScaledFontSize(15),
                  color: theme.textSecondary
                }]}>
                  Services available in multiple languages to serve diverse communities.
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Emergency Notice */}
        {/* HIGH CONTRAST: Dynamic emergency background and border */}
        <View style={[styles.emergencyNotice, {
          backgroundColor: emergencyColors.backgroundColor,
          borderColor: emergencyColors.borderColor,
          borderWidth: 1, // Ensure border is visible in HC mode
        }]}>
          {/* FONT SCALING & HIGH CONTRAST: emergencyTitle (Base 16) */}
          <Text style={[styles.emergencyTitle, { 
            fontSize: getScaledFontSize(16),
            color: emergencyColors.titleColor
          }]}>
            Emergency? Call 9-1-1 for immediate emergency assistance.
          </Text>
          {/* FONT SCALING & HIGH CONTRAST: emergencySubtext (Base 14) */}
          <Text style={[styles.emergencySubtext, { 
            fontSize: getScaledFontSize(14),
            color: emergencyColors.subtextColor
          }]}>
            2-1-1 is for information and referrals to community resources, not emergency services.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ⚠️ NOTE: The fixed `fontSize` and `color` properties are removed or managed
// via inline styles to support both font scaling and color theming.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f9fafb', // Managed by theme
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    // color: '#111827', // Managed by theme
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    // color: '#4b5563', // Managed by theme
    textAlign: 'center',
    lineHeight: 26,
  },
  card: {
    marginBottom: 24,
    padding: 20,
    // backgroundColor: 'white', // Managed by theme
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    // border is added dynamically in HC mode
  },
  cardTitle: {
    fontWeight: '600',
    // color: '#1e40af', // Managed by theme
    marginBottom: 12,
  },
  cardContent: {
    // color: '#374151', // Managed by theme
    lineHeight: 24,
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceColumn: {
    flex: 1,
    marginRight: 16,
  },
  serviceTitle: {
    fontWeight: '600',
    // color: '#111827', // Managed by theme
    marginBottom: 8,
  },
  serviceItem: {
    // color: '#374151', // Managed by theme
    marginBottom: 4,
  },
  contactGrid: {
    flexDirection: 'column',
  },
  contactSection: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactLabel: {
    fontWeight: '600',
    // color: '#111827', // Managed by theme
  },
  contactLink: {
    // color: '#2563eb', // Managed by theme
    textDecorationLine: 'underline',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontWeight: '600',
    // color: '#111827', // Managed by theme
    marginBottom: 8,
  },
  infoText: {
    // color: '#374151', // Managed by theme
    lineHeight: 22,
  },
  emergencyNotice: {
    // backgroundColor: '#fef2f2', // Managed dynamically
    // borderColor: '#fecaca', // Managed dynamically
    // borderWidth: 1, // Managed dynamically
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontWeight: '600',
    // color: '#991b1b', // Managed dynamically
    textAlign: 'center',
    marginBottom: 4,
  },
  emergencySubtext: {
    // color: '#b91c1c', // Managed dynamically
    textAlign: 'center',
  },
});