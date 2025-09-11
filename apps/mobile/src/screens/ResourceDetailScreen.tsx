import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ResourceDetailScreen({ route, navigation }: any) {
  const { resource } = route.params;

  const handleCall = () => {
    if (resource.phone) {
      Linking.openURL(`tel:${resource.phone}`);
    }
  };

  const handleDirections = () => {
    if (resource.address) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(resource.address)}`;
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resource Details</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.resourceName}>{resource.name}</Text>
          <Text style={styles.organization}>{resource.organization}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{resource.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#005191" />
            <Text style={styles.infoText}>{resource.address}</Text>
          </View>

          {resource.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#005191" />
              <Text style={styles.infoText}>{resource.phone}</Text>
            </View>
          )}

          {resource.hours && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color="#005191" />
              <Text style={styles.infoText}>{resource.hours}</Text>
            </View>
          )}

          {resource.website && (
            <View style={styles.infoRow}>
              <Ionicons name="globe" size={20} color="#005191" />
              <Text style={styles.infoText}>{resource.website}</Text>
            </View>
          )}
        </View>

        {resource.eligibility && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eligibility</Text>
            <Text style={styles.infoText}>{resource.eligibility}</Text>
          </View>
        )}

        {resource.applicationProcess && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Apply</Text>
            <Text style={styles.infoText}>{resource.applicationProcess}</Text>
          </View>
        )}

        {resource.requiredDocuments && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            <Text style={styles.infoText}>{resource.requiredDocuments}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#005191',
    padding: 15,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  mainInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  resourceName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  organization: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005191',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});