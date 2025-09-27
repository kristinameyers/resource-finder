import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslatedText } from '../components/TranslatedText';
import { 
  fetchServiceAtLocationDetails,
  ServiceAtLocationDetails,
  stripHtmlTags,
} from '../api/resourceApi';

export default function ResourceDetailScreen({ route, navigation }: any) {
  const { resourceId } = route.params; // This should be the serviceAtLocationId

  // Translation hooks (only the ones actually used)
  const { text: backText } = useTranslatedText('Back');
  const { text: resourceDetailText } = useTranslatedText('Resource Details');
  const { text: callText } = useTranslatedText('Call');
  const { text: websiteText } = useTranslatedText('Visit Website');
  const { text: descriptionText } = useTranslatedText('Description');
  const { text: eligibilityText } = useTranslatedText('Eligibility');
  const { text: accessibilityText } = useTranslatedText('Accessibility');
  const { text: languagesText } = useTranslatedText('Languages');
  const { text: addressText } = useTranslatedText('Address');
  const { text: hoursText } = useTranslatedText('Hours');
  const { text: loadingText } = useTranslatedText('Loading...');
  const { text: feesText } = useTranslatedText('Fees');
  const { text: applicationProcessText } = useTranslatedText('Application Process');
  const { text: documentsRequiredText } = useTranslatedText('Documents Required');

  // Fetch service at location details using the new endpoint
  const detailsQuery = useQuery({
    queryKey: ['serviceAtLocationDetails', resourceId],
    queryFn: () => fetchServiceAtLocationDetails(resourceId),
    enabled: !!resourceId
  });

  const resourceDetails = detailsQuery.data;

// Custom header component
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#005191" />
        <Text style={styles.backButtonText}>{backText}</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{resourceDetailText}</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (detailsQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#005191" />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  if (detailsQuery.isError || !resourceDetails) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>Resource details not available</Text>
        <Text style={styles.debugText}>Resource ID: {resourceId}</Text>
        <Text style={styles.debugText}>
          Unable to load resource details. Please try again.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <MaterialIcons name="arrow-back" size={20} color="#005191" />
          <Text style={{ color: '#005191', marginLeft: 8 }}>Back to List</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => detailsQuery.refetch()} style={styles.retryButton}>
          <MaterialIcons name="refresh" size={20} color="#005191" />
          <Text style={{ color: '#005191', marginLeft: 8 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper function to format address
  const getFormattedAddress = (address: ServiceAtLocationDetails['address']): string | null => {
    if (!address) return null;
    return [
      address.streetAddress,
      address.city,
      address.stateProvince,
      address.postalCode
    ].filter(Boolean).join(', ');
  };

  const formattedAddress = getFormattedAddress(resourceDetails.address);

  return (

    <ScrollView style={styles.container}>
      {renderHeader()}
      {/* Header Section */}
      <View style={styles.section}>
        <Text style={styles.title}>
          {resourceDetails.serviceName || 'Service Details'}
        </Text>
        
        {/* Organization */}
        {resourceDetails.organizationName && (
          <Text style={styles.organizationText}>{resourceDetails.organizationName}</Text>
        )}

        {/* Location */}
        {resourceDetails.locationName && (
          <Text style={styles.locationText}>{resourceDetails.locationName}</Text>
        )}

        {/* Description */}
        {resourceDetails.serviceDescription && (
          <>
            <Text style={styles.label}>{descriptionText}</Text>
            <Text style={styles.text}>{stripHtmlTags(resourceDetails.serviceDescription)}</Text>
          </>
        )}
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        {/* Phone Numbers */}
        {resourceDetails.servicePhones && resourceDetails.servicePhones.length > 0 && (
          resourceDetails.servicePhones.map((phone, index) => {
            if (!phone.number) return null;
            
            const phoneDisplay = phone.extension 
              ? `${phone.number} ext. ${phone.extension}`
              : phone.number;
            
            const phoneType = phone.type ? ` (${phone.type})` : '';
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.actionRow}
                onPress={() => Linking.openURL(`tel:${phone.number?.replace(/[^\d]/g, '')}`)}
              >
                <Ionicons name="call-outline" size={20} color="#005191" />
                <Text style={styles.actionLabel}>
                  {callText}: {phoneDisplay}{phoneType}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {/* Website */}
        {resourceDetails.website && (
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Linking.openURL(resourceDetails.website!)}
          >
            <Ionicons name="globe-outline" size={20} color="#005191" />
            <Text style={styles.actionLabel}>{websiteText}</Text>
          </TouchableOpacity>
        )}

        {/* Address */}
        {formattedAddress && (
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() =>
              Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(formattedAddress)}`)
            }
          >
            <Ionicons name="location-outline" size={20} color="#005191" />
            <Text style={styles.actionLabel}>{addressText}: {formattedAddress}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Service Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Information</Text>
        
        {/* Hours */}
        {resourceDetails.serviceHoursText && (
          <>
            <Text style={styles.label}>{hoursText}</Text>
            <Text style={styles.text}>{resourceDetails.serviceHoursText}</Text>
          </>
        )}

        {/* Fees */}
        {resourceDetails.fees && (
          <>
            <Text style={styles.label}>{feesText}</Text>
            <Text style={styles.text}>{resourceDetails.fees}</Text>
          </>
        )}

        {/* Eligibility */}
        {resourceDetails.eligibility && (
          <>
            <Text style={styles.label}>{eligibilityText}</Text>
            <Text style={styles.text}>{resourceDetails.eligibility}</Text>
          </>
        )}

        {/* Application Process */}
        {resourceDetails.applicationProcess && (
          <>
            <Text style={styles.label}>{applicationProcessText}</Text>
            <Text style={styles.text}>{resourceDetails.applicationProcess}</Text>
          </>
        )}

        {/* Documents Required */}
        {resourceDetails.documentsRequired && (
          <>
            <Text style={styles.label}>{documentsRequiredText}</Text>
            <Text style={styles.text}>{resourceDetails.documentsRequired}</Text>
          </>
        )}
      </View>

      {/* Accessibility & Languages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility & Languages</Text>
        
        {/* Disabilities Access */}
        {resourceDetails.disabilitiesAccess && (
          <>
            <Text style={styles.label}>{accessibilityText}</Text>
            <Text style={styles.text}>{resourceDetails.disabilitiesAccess}</Text>
          </>
        )}

        {/* Languages Offered */}
        {resourceDetails.languagesOffered && resourceDetails.languagesOffered.length > 0 && (
          <>
            <Text style={styles.label}>{languagesText}</Text>
            <View style={styles.badgeRow}>
              {resourceDetails.languagesOffered.map((lang, index) => (
                <Text key={index} style={styles.languageBadge}>{lang}</Text>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Debug Information (only in development) */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.label}>Debug Info</Text>
          <Text style={styles.debugText}>Service At Location ID: {resourceId}</Text>
          <Text style={styles.debugText}>Organization: {resourceDetails.organizationName || 'N/A'}</Text>
          <Text style={styles.debugText}>Service: {resourceDetails.serviceName || 'N/A'}</Text>
          <Text style={styles.debugText}>Location: {resourceDetails.locationName || 'N/A'}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#005191',
    marginLeft: 4,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 60, // Same width as back button to center the title
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  noDataText: { 
    fontSize: 18, 
    color: '#333', 
    marginBottom: 16, 
    textAlign: 'center',
    fontWeight: '600' 
  },
  debugText: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 8, 
    textAlign: 'center',
    fontStyle: 'italic' 
  },
  loadingText: { 
    fontSize: 16, 
    color: '#005191', 
    marginTop: 10 
  },
  section: { 
    margin: 16, 
    padding: 16, 
    backgroundColor: 'white', 
    borderRadius: 8, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#005191',
    lineHeight: 28 
  },
  organizationText: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 8, 
    fontWeight: '500' 
  },
  locationText: { 
    fontSize: 14, 
    color: '#888', 
    marginBottom: 12, 
    fontStyle: 'italic' 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#005191',
    marginBottom: 12,
  },
  badgeRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 8, 
    gap: 6 
  },
  languageBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 4, 
    fontSize: 12,
    color: '#333' 
  },
  label: { 
    fontSize: 15, 
    fontWeight: '600', 
    marginTop: 12, 
    marginBottom: 6, 
    color: '#222' 
  },
  text: { 
    fontSize: 14, 
    color: '#333', 
    lineHeight: 20,
    marginBottom: 8 
  },
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 4 
  },
  actionLabel: { 
    fontSize: 15, 
    marginLeft: 8, 
    color: '#007aff',
    flex: 1 
  },
  goBackButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8 
  },
  retryButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e8f4f8',
    borderRadius: 8 
  },
});
