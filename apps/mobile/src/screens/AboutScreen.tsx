import React from 'react';
import { View, Text, ScrollView, Linking, StyleSheet } from 'react-native';
import { Card } from '../components/ui/card';
import { useTranslatedText } from '../components/TranslatedText';

export default function About() {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{aboutTitleText}</Text>
          <Text style={styles.subtitle}>
            {aboutSubtitleText}
          </Text>
        </View>

        {/* Mission Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{missionTitleText}</Text>
          <Text style={styles.cardContent}>
            {missionDescText}
          </Text>
        </Card>

        {/* Services Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{servicesTitleText}</Text>
          <View style={styles.servicesGrid}>
            <View style={styles.serviceColumn}>
              <Text style={styles.serviceTitle}>{essentialServicesText}</Text>
              <Text style={styles.serviceItem}>• Housing & Shelter Assistance</Text>
              <Text style={styles.serviceItem}>• Food & Nutrition Programs</Text>
              <Text style={styles.serviceItem}>• Healthcare & Mental Health</Text>
              <Text style={styles.serviceItem}>• Employment & Training</Text>
            </View>
            <View style={styles.serviceColumn}>
              <Text style={styles.serviceTitle}>{supportServicesText}</Text>
              <Text style={styles.serviceItem}>• Legal Assistance</Text>
              <Text style={styles.serviceItem}>• Transportation Services</Text>
              <Text style={styles.serviceItem}>• Child & Family Support</Text>
              <Text style={styles.serviceItem}>• Emergency Financial Aid</Text>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Get Help Now</Text>
          <View style={styles.contactGrid}>
            <View style={styles.contactSection}>
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>📞</Text>
                <View>
                  <Text style={styles.contactLabel}>Call 2-1-1</Text>
                  <Text style={styles.contactLink} onPress={handleCall}>
                    1-800-400-1572
                  </Text>
                </View>
              </View>
              
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>🌐</Text>
                <View>
                  <Text style={styles.contactLabel}>Online</Text>
                  <Text style={styles.contactLink} onPress={handleWebsite}>
                    www.211.org
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.contactSection}>
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Available 24/7</Text>
                <Text style={styles.infoText}>
                  Our trained specialists are available around the clock to help you 
                  find the resources you need in your community.
                </Text>
              </View>
              
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Multilingual Support</Text>
                <Text style={styles.infoText}>
                  Services available in multiple languages to serve diverse communities.
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <Text style={styles.emergencyTitle}>
            Emergency? Call 9-1-1 for immediate emergency assistance.
          </Text>
          <Text style={styles.emergencySubtext}>
            2-1-1 is for information and referrals to community resources, not emergency services.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 26,
  },
  card: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  cardContent: {
    fontSize: 16,
    color: '#374151',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  serviceItem: {
    fontSize: 15,
    color: '#374151',
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
    fontSize: 20,
    marginRight: 12,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactLink: {
    fontSize: 16,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  emergencyNotice: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    textAlign: 'center',
    marginBottom: 4,
  },
  emergencySubtext: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
  },
});
