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
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslatedText } from '../components/TranslatedText';
import {
  fetchServiceAtLocationDetails,
  ServiceAtLocationDetails,
  stripHtmlTags,
} from '../api/resourceApi';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../App';
import { useAccessibility } from '../contexts/AccessibilityContext'; // 👈 IMPORTED

// The correct, specific props type for this screen.
type ResourceDetailScreenProps = DrawerScreenProps<DrawerParamList, 'ResourceDetail'>;

// ❌ Removed: FONT_SCALING constants (using getFontSize from context)
// const FONT_SCALING = { ... };

export default function ResourceDetailScreen({
  route,
  navigation,
}: ResourceDetailScreenProps) {
  // ✅ UPDATE: Get theme and getFontSize (instead of `fontSize` and custom scaler)
  const { theme, getFontSize, highContrast } = useAccessibility();
  
  // ❌ Removed: Define the scaling utility function (using getFontSize instead)
  // const getScaledFontSize = (base: number) => { ... };

  const { resourceId, backToList } = route.params;
  
  const idToQuery = resourceId; 

  // Translated Texts
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
    queryKey: ['serviceAtLocationDetails', idToQuery], 
    queryFn: () => fetchServiceAtLocationDetails(idToQuery),
    enabled: !!idToQuery,
    staleTime: Infinity, // Details are unlikely to change frequently
  });

  useEffect(() => {
    if (resourceDetails) {
      console.log('Loaded resource details:', {
        id: idToQuery,
        name: resourceDetails.serviceName,
        org: resourceDetails.organizationName,
      });
    }
  }, [resourceDetails, idToQuery]);

  const renderHeader = () => (
    // ✅ HC: Apply header background and border
    <View style={[styles.header, { 
        backgroundColor: theme.backgroundSecondary,
        borderBottomColor: theme.border,
    }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (backToList && backToList.keyword) {
            navigation.navigate('ResourceList', {
              keyword: backToList.selectedSubcategory || backToList.keyword,
              zipCode: backToList.zipCode,
              isSubcategory: Boolean(backToList.selectedSubcategory) || backToList.isSubcategory,
            });
          } else {
            navigation.goBack(); 
          }
        }}
      >
        {/* ✅ HC: Apply icon color */}
        <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
        {/* FONT SCALING & HC: backButtonText (Base 16) */}
        <Text style={[styles.backButtonText, { 
            fontSize: getFontSize(16),
            color: theme.primary
        }]}>{backText}</Text>
      </TouchableOpacity>
      {/* FONT SCALING & HC: headerTitle (Base 18) */}
      <Text style={[styles.headerTitle, { 
          fontSize: getFontSize(18),
          color: theme.text
      }]}>{resourceDetailText}</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (isLoading) {
    return (
      // ✅ HC: Apply container background
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          {/* ✅ HC: Apply indicator color */}
          <ActivityIndicator size="large" color={theme.primary} />
          {/* FONT SCALING & HC: loadingText (Base 16) */}
          <Text style={[styles.loadingText, { 
              fontSize: getFontSize(16),
              color: theme.primary
          }]}>{loadingText}</Text>
        </View>
      </View>
    );
  }

  if (isError || !resourceDetails) {
    return (
      // ✅ HC: Apply container background
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          {/* FONT SCALING & HC: noDataText (Base 18) */}
          <Text style={[styles.noDataText, { 
              fontSize: getFontSize(18),
              color: theme.text
          }]}>Resource details not available</Text>
          {/* FONT SCALING & HC: debugText (Base 14) */}
          <Text style={[styles.debugText, { 
              fontSize: getFontSize(14),
              color: theme.textSecondary
          }]}>Resource ID: {idToQuery}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            {/* ✅ HC: Apply icon color */}
            <MaterialIcons name="refresh" size={20} color={theme.primary} />
            {/* FONT SCALING & HC: retryText (Base 16) */}
            <Text style={[styles.retryText, { 
                fontSize: getFontSize(16),
                color: theme.primary
            }]}>Retry</Text>
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
    // ✅ HC: Apply container background
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader()}
      <ScrollView style={styles.scrollContainer}>
        {/* ✅ HC: Apply section background and optional border */}
        <View style={[styles.section, { 
            backgroundColor: theme.backgroundSecondary,
            borderWidth: highContrast ? 1 : 0,
            borderColor: theme.border,
        }]}>
          {/* FONT SCALING & HC: title (Base 22) */}
          <Text style={[styles.title, { 
              fontSize: getFontSize(22),
              color: theme.primary
          }]}>
            {resourceDetails.serviceName || 'Service Details'}
          </Text>
          {resourceDetails.organizationName && (
            // FONT SCALING & HC: organizationText (Base 16)
            <Text style={[styles.organizationText, { 
                fontSize: getFontSize(16),
                color: theme.text
            }]}>
              {resourceDetails.organizationName}
            </Text>
          )}
          {resourceDetails.locationName && (
            // FONT SCALING & HC: locationText (Base 14)
            <Text style={[styles.locationText, { 
                fontSize: getFontSize(14),
                color: theme.textSecondary
            }]}>
              {resourceDetails.locationName}
            </Text>
          )}
          {resourceDetails.serviceDescription && (
            <>
              {/* FONT SCALING & HC: label (Base 15) */}
              <Text style={[styles.label, { 
                  fontSize: getFontSize(15),
                  color: theme.text
              }]}>{descriptionText}</Text>
              {/* FONT SCALING & HC: text (Base 14) */}
              <Text style={[styles.text, { 
                  fontSize: getFontSize(14),
                  color: theme.textSecondary
              }]}>
                {stripHtmlTags(resourceDetails.serviceDescription)}
              </Text>
            </>
          )}
        </View>

        {/* ✅ HC: Apply section background and optional border */}
        <View style={[styles.section, { 
            backgroundColor: theme.backgroundSecondary,
            borderWidth: highContrast ? 1 : 0,
            borderColor: theme.border,
        }]}>
          {/* FONT SCALING & HC: sectionTitle (Base 18) */}
          <Text style={[styles.sectionTitle, { 
              fontSize: getFontSize(18),
              color: theme.primary
          }]}>Contact Information</Text>
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
                  {/* ✅ HC: Apply icon color */}
                  <Ionicons name="call-outline" size={20} color={theme.primary} />
                  {/* FONT SCALING & HC: actionLabel (Base 15) */}
                  <Text style={[styles.actionLabel, { 
                      fontSize: getFontSize(15),
                      color: theme.primary // Links/actions use primary color
                  }]}>
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
              {/* ✅ HC: Apply icon color */}
              <Ionicons name="globe-outline" size={20} color={theme.primary} />
              {/* FONT SCALING & HC: actionLabel (Base 15) */}
              <Text style={[styles.actionLabel, { 
                  fontSize: getFontSize(15),
                  color: theme.primary
              }]}>{websiteText}</Text>
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
              {/* ✅ HC: Apply icon color */}
              <Ionicons name="location-outline" size={20} color={theme.primary} />
              {/* FONT SCALING & HC: actionLabel (Base 15) */}
              <Text style={[styles.actionLabel, { 
                  fontSize: getFontSize(15),
                  color: theme.primary
              }]}>
                {addressText}: {formattedAddress}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ✅ HC: Apply section background and optional border */}
        <View style={[styles.section, { 
            backgroundColor: theme.backgroundSecondary,
            borderWidth: highContrast ? 1 : 0,
            borderColor: theme.border,
        }]}>
          {/* FONT SCALING & HC: sectionTitle (Base 18) */}
          <Text style={[styles.sectionTitle, { 
              fontSize: getFontSize(18),
              color: theme.primary
          }]}>Service Information</Text>
          {resourceDetails.serviceHoursText && (
            <>
              {/* FONT SCALING & HC: label (Base 15) */}
              <Text style={[styles.label, { 
                  fontSize: getFontSize(15),
                  color: theme.text
              }]}>{hoursText}</Text>
              {/* FONT SCALING & HC: text (Base 14) */}
              <Text style={[styles.text, { 
                  fontSize: getFontSize(14),
                  color: theme.textSecondary
              }]}>
                {resourceDetails.serviceHoursText}
              </Text>
            </>
          )}
          {resourceDetails.fees && (
            <>
              {/* FONT SCALING & HC: label (Base 15) */}
              <Text style={[styles.label, { 
                  fontSize: getFontSize(15),
                  color: theme.text
              }]}>{feesText}</Text>
              {/* FONT SCALING & HC: text (Base 14) */}
              <Text style={[styles.text, { 
                  fontSize: getFontSize(14),
                  color: theme.textSecondary
              }]}>{resourceDetails.fees}</Text>
            </>
          )}
          {resourceDetails.eligibility && (
            <>
              {/* FONT SCALING & HC: label (Base 15) */}
              <Text style={[styles.label, { 
                  fontSize: getFontSize(15),
                  color: theme.text
              }]}>{eligibilityText}</Text>
              {/* FONT SCALING & HC: text (Base 14) */}
              <Text style={[styles.text, { 
                  fontSize: getFontSize(14),
                  color: theme.textSecondary
              }]}>{resourceDetails.eligibility}</Text>
            </>
          )}
          {resourceDetails.applicationProcess && (
            <>
              {/* FONT SCALING & HC: label (Base 15) */}
              <Text style={[styles.label, { 
                  fontSize: getFontSize(15),
                  color: theme.text
              }]}>
                {applicationProcessText}
              </Text>
              {/* FONT SCALING & HC: text (Base 14) */}
              <Text style={[styles.text, { 
                  fontSize: getFontSize(14),
                  color: theme.textSecondary
              }]}>
                {resourceDetails.applicationProcess}
              </Text>
            </>
          )}
          {resourceDetails.documentsRequired && (
            <>
              {/* FONT SCALING & HC: label (Base 15) */}
              <Text style={[styles.label, { 
                  fontSize: getFontSize(15),
                  color: theme.text
              }]}>
                {documentsRequiredText}
              </Text>
              {/* FONT SCALING & HC: text (Base 14) */}
              <Text style={[styles.text, { 
                  fontSize: getFontSize(14),
                  color: theme.textSecondary
              }]}>
                {resourceDetails.documentsRequired}
              </Text>
            </>
          )}
        </View>

        {/* ✅ HC: Apply section background and optional border */}
        <View style={[styles.section, { 
            backgroundColor: theme.backgroundSecondary,
            borderWidth: highContrast ? 1 : 0,
            borderColor: theme.border,
            marginBottom: 32, // Add extra space at the bottom
        }]}>
          {/* FONT SCALING & HC: sectionTitle (Base 18) */}
          <Text style={[styles.sectionTitle, { 
              fontSize: getFontSize(18),
              color: theme.primary
          }]}>
            Accessibility & Languages
          </Text>
          {resourceDetails.disabilitiesAccess && (
            <>
              {/* FONT SCALING & HC: label (Base 15) */}
              <Text style={[styles.label, { 
                  fontSize: getFontSize(15),
                  color: theme.text
              }]}>{accessibilityText}</Text>
              {/* FONT SCALING & HC: text (Base 14) */}
              <Text style={[styles.text, { 
                  fontSize: getFontSize(14),
                  color: theme.textSecondary
              }]}>
                {resourceDetails.disabilitiesAccess}
              </Text>
            </>
          )}
          {Array.isArray(resourceDetails.languagesOffered) &&
          resourceDetails.languagesOffered.length > 0 && (
            <>
              {/* FONT SCALING & HC: label (Base 15) */}
              <Text style={[styles.label, { 
                  fontSize: getFontSize(15),
                  color: theme.text
              }]}>{languagesText}</Text>
              <View style={styles.badgeRow}>
                {resourceDetails.languagesOffered.map(
                  (lang: string, i: number) => (
                    // FONT SCALING & HC: languageBadge (Base 12)
                    <Text key={i} style={[styles.languageBadge, { 
                        fontSize: getFontSize(12),
                        backgroundColor: theme.accent, // Use accent for badges
                        color: theme.backgroundSecondary, // Text color contrasts with accent
                    }]}>
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

// ⚠️ NOTE: Stylesheet is simplified and default colors are set to match standard light mode
// but are mostly overridden by inline styles.
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
  backButtonText: { marginLeft: 4, color: '#005191' }, 
  headerTitle: {
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
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  debugText: {
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: { color: '#005191', marginTop: 10 },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    // Shadow properties remain for standard mode
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#005191',
  },
  organizationText: { color: '#666', marginBottom: 8 },
  locationText: { color: '#888', marginBottom: 12 },
  sectionTitle: {
    fontWeight: '600',
    color: '#005191',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333', // Default text color
  },
  text: {
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  actionLabel: { marginLeft: 8, color: '#007aff', flex: 1, textDecorationLine: 'underline' },
  retryButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  retryText: { color: '#005191', marginLeft: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  languageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    color: '#333',
    marginRight: 6,
    marginBottom: 6,
  },
});