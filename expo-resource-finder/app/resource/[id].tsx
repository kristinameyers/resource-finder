import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { API_BASE_URL } from '../../constants/api';

export default function ResourcePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Get resource from cache or fetch
  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      // Try to get from localStorage cache first (like web app)
      const cached = global.localStorage?.getItem(`resource-${id}`);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Fallback to API call if needed
      const response = await fetch(`${API_BASE_URL}/api/resource/${id}`);
      return response.json();
    },
    enabled: !!id,
  });

  const handleCall = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleWebsite = (url: string) => {
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    Linking.openURL(url);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#005191" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#005191" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resource Not Found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#005191" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>{resource.name}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Main Info */}
        <View style={styles.section}>
          <Text style={styles.resourceName}>{resource.name}</Text>
          {resource.distance && (
            <Text style={styles.distance}>{resource.distance} miles away</Text>
          )}
          <Text style={styles.description}>{resource.description}</Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {resource.address && (
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>📍 Address</Text>
              <Text style={styles.contactValue}>{resource.address}</Text>
            </View>
          )}

          {resource.phone && (
            <TouchableOpacity 
              style={styles.contactItem} 
              onPress={() => handleCall(resource.phone)}
            >
              <Text style={styles.contactLabel}>📞 Phone</Text>
              <Text style={[styles.contactValue, styles.linkText]}>{resource.phone}</Text>
            </TouchableOpacity>
          )}

          {resource.website && (
            <TouchableOpacity 
              style={styles.contactItem} 
              onPress={() => handleWebsite(resource.website)}
            >
              <Text style={styles.contactLabel}>🌐 Website</Text>
              <Text style={[styles.contactValue, styles.linkText]}>{resource.website}</Text>
            </TouchableOpacity>
          )}

          {resource.email && (
            <TouchableOpacity 
              style={styles.contactItem} 
              onPress={() => handleEmail(resource.email)}
            >
              <Text style={styles.contactLabel}>✉️ Email</Text>
              <Text style={[styles.contactValue, styles.linkText]}>{resource.email}</Text>
            </TouchableOpacity>
          )}

          {resource.hours && (
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>🕒 Hours</Text>
              <Text style={styles.contactValue}>{resource.hours}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            {resource.phone && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleCall(resource.phone)}
              >
                <Text style={styles.actionButtonText}>📞 Call</Text>
              </TouchableOpacity>
            )}
            
            {resource.website && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleWebsite(resource.website)}
              >
                <Text style={styles.actionButtonText}>🌐 Visit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Additional Information */}
        {(resource.applicationProcess || resource.requiredDocuments || resource.fees) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            {resource.applicationProcess && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Application Process</Text>
                <Text style={styles.infoValue}>{resource.applicationProcess}</Text>
              </View>
            )}

            {resource.requiredDocuments && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Required Documents</Text>
                <Text style={styles.infoValue}>{resource.requiredDocuments}</Text>
              </View>
            )}

            {resource.fees && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fees</Text>
                <Text style={styles.infoValue}>{resource.fees}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#005191',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'System',
  },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resourceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  distance: {
    fontSize: 14,
    color: '#005191',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  contactItem: {
    marginBottom: 15,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  contactValue: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    color: '#005191',
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#005191',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
});