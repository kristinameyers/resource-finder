import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslatedText } from '../components/TranslatedText';
import {
  fetchServiceAtLocationDetails,
  ServiceAtLocationDetails,
  stripHtmlTags,
} from '../api/resourceApi';

// Define the structure of the data passed from the ResourceListScreen
export type ResourceListBackParams = {
  keyword: string; // The main search keyword/category name
  zipCode: string; // The ZIP code used for sorting/filtering
  isSubcategory: boolean;
  selectedSubcategory: string | null;
};

export type DetailScreenParams = {
  ResourceList: {
    keyword: string;
    zipCode: string;
    isSubcategory: boolean;
    // Note: We don't explicitly pass selectedSubcategory here, as it's handled by keyword
  };
  ResourceDetail: {
    // These are the only params the screen cares about, regardless of the stack
    resourceId: string; 
    backToList?: ResourceListBackParams; // If you need this optional from ResourcesList
  };
};

type ResourceDetailScreenProps = StackScreenProps<DetailScreenParams, 'ResourceDetail'>;

export default function ResourceDetailScreen({
  route,
  navigation,
}: ResourceDetailScreenProps) {
  const { resourceId, backToList } = route.params;
  const id = resourceId;

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

  const {
    data: resourceDetails,
    isLoading,
    isError,
    refetch,
  } = useQuery<ServiceAtLocationDetails | null>({
    queryKey: ['serviceAtLocationDetails', id],
    queryFn: () => fetchServiceAtLocationDetails(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (resourceDetails) {
      console.log('Loaded resource details:', {
        id: id,
        name: resourceDetails.serviceName,
        org: resourceDetails.organizationName,
      });
    }
  }, [resourceDetails, id]);

  const renderHeader = () => (
    <View style={styles.header}>

      <TouchableOpacity
  style={styles.backButton}
  onPress={() => {
    // 🛠️ FIX: Check if backToList exists. It will be undefined when coming from FavoritesScreen.
    if (backToList && backToList.keyword) {
      // 1. Navigation path for returning to the specific ResourceList search
      navigation.navigate('ResourceList', {
        // This is safe because we checked if backToList exists
        keyword: backToList.selectedSubcategory || backToList.keyword,
        zipCode: backToList.zipCode,
        isSubcategory: Boolean(backToList.selectedSubcategory) || backToList.isSubcategory,
      });
    } else {
      // 2. Navigation path for when coming from FavoritesScreen (no list context)
      // Safely go back to the previous screen (which is the FavoritesScreen)
      navigation.goBack(); 
    }
  }}
>
        <MaterialIcons name="arrow-back" size={24} color="#005191" />
        <Text style={styles.backButtonText}>{backText}</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{resourceDetailText}</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#005191" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    );
  }

  if (isError || !resourceDetails) {
    // 🛑 TEMPORARY DEBUG LOGS 🛑
  console.log("-----------------------------------------");
  console.log("RENDERING DETAILS for ID:", id);
  console.log("Service Name (Found):", resourceDetails?.serviceName);
  console.log("Organization Name (Found):", resourceDetails?.organizationName);
  console.log("Full Resource Details Object:", JSON.stringify(resourceDetails, null, 2)); 
  console.log("-----------------------------------------");
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <Text style={styles.noDataText}>Resource details not available</Text>
          <Text style={styles.debugText}>Resource ID: {id}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <MaterialIcons name="refresh" size={20} color="#005191" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formattedAddress = resourceDetails.address
    ? [
        resourceDetails.address.streetAddress,
        resourceDetails.address.city,
        resourceDetails.address.stateProvince,
        resourceDetails.address.postalCode,
      ]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.title}>
            {resourceDetails.serviceName || 'Service Details'}
          </Text>
          {resourceDetails.organizationName && (
            <Text style={styles.organizationText}>
              {resourceDetails.organizationName}
            </Text>
          )}
          {resourceDetails.locationName && (
            <Text style={styles.locationText}>
              {resourceDetails.locationName}
            </Text>
          )}
          {resourceDetails.serviceDescription && (
            <>
              <Text style={styles.label}>{descriptionText}</Text>
              <Text style={styles.text}>
                {stripHtmlTags(resourceDetails.serviceDescription)}
              </Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {resourceDetails.servicePhones?.map(
            (
              phone: { number?: string; extension?: string; type?: string },
              idx: number
            ) => {
              const phoneNumber = phone.number;
              if (!phoneNumber) return null;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.actionRow}
                  onPress={() =>
                    Linking.openURL(`tel:${phoneNumber.replace(/\D/g, '')}`)
                  }
                >
                  <Ionicons name="call-outline" size={20} color="#005191" />
                  <Text style={styles.actionLabel}>
                    {callText}: {phoneNumber}
                    {phone.extension ? ` ext. ${phone.extension}` : ''}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
          {resourceDetails.website && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => Linking.openURL(resourceDetails.website!)}
            >
              <Ionicons name="globe-outline" size={20} color="#005191" />
              <Text style={styles.actionLabel}>{websiteText}</Text>
            </TouchableOpacity>
          )}
          {formattedAddress && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() =>
                Linking.openURL(
                  `https://maps.apple.com/?q=${encodeURIComponent(
                    formattedAddress
                  )}`
                )
              }
            >
              <Ionicons name="location-outline" size={20} color="#005191" />
              <Text style={styles.actionLabel}>
                {addressText}: {formattedAddress}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Information</Text>
          {resourceDetails.serviceHoursText && (
            <>
              <Text style={styles.label}>{hoursText}</Text>
              <Text style={styles.text}>
                {resourceDetails.serviceHoursText}
              </Text>
            </>
          )}
          {resourceDetails.fees && (
            <>
              <Text style={styles.label}>{feesText}</Text>
              <Text style={styles.text}>{resourceDetails.fees}</Text>
            </>
          )}
          {resourceDetails.eligibility && (
            <>
              <Text style={styles.label}>{eligibilityText}</Text>
              <Text style={styles.text}>{resourceDetails.eligibility}</Text>
            </>
          )}
          {resourceDetails.applicationProcess && (
            <>
              <Text style={styles.label}>
                {applicationProcessText}
              </Text>
              <Text style={styles.text}>
                {resourceDetails.applicationProcess}
              </Text>
            </>
          )}
          {resourceDetails.documentsRequired && (
            <>
              <Text style={styles.label}>
                {documentsRequiredText}
              </Text>
              <Text style={styles.text}>
                {resourceDetails.documentsRequired}
              </Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Accessibility & Languages
          </Text>
          {resourceDetails.disabilitiesAccess && (
            <>
              <Text style={styles.label}>{accessibilityText}</Text>
              <Text style={styles.text}>
                {resourceDetails.disabilitiesAccess}
              </Text>
            </>
          )}
          {Array.isArray(resourceDetails.languagesOffered) &&
          resourceDetails.languagesOffered.length > 0 && (
            <>
              <Text style={styles.label}>{languagesText}</Text>
              <View style={styles.badgeRow}>
                {resourceDetails.languagesOffered.map(
                  (lang: string, i: number) => (
                    <Text key={i} style={styles.languageBadge}>
                      {lang}
                    </Text>
                  )
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonText: { marginLeft: 4, color: '#005191', fontSize: 16 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: { width: 60 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noDataText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: { fontSize: 16, color: '#005191', marginTop: 10 },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#005191',
  },
  organizationText: { fontSize: 16, color: '#666', marginBottom: 8 },
  locationText: { fontSize: 14, color: '#888', marginBottom: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#005191',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  actionLabel: { fontSize: 15, marginLeft: 8, color: '#007aff', flex: 1 },
  retryButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  retryText: { color: '#005191', marginLeft: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  languageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    fontSize: 12,
    color: '#333',
    marginRight: 6,
    marginBottom: 6,
  },
});
