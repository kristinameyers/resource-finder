import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslatedText } from '../components/TranslatedText';
import { 
  fetchResourceById,
  fetchCategories,
  fetchSubcategories,
  getResourcePhoneNumber,
  getResourceFormattedAddress,
  getResourceDisplayName,
  getResourceDescription,
} from '../api/resourceApi';
import { Resource, Category, Subcategory } from '../types/shared-schema';

export default function ResourceDetailScreen({ route, navigation }: any) {
  const { resourceId } = route.params; // Changed from 'id' to 'resourceId'

  // Translation hooks
  const { text: resourceDetailText } = useTranslatedText('Resource Details');
  const { text: callText } = useTranslatedText('Call');
  const { text: websiteText } = useTranslatedText('Visit Website');
  const { text: categoryText } = useTranslatedText('Category');
  const { text: subcategoryText } = useTranslatedText('Subcategory');
  const { text: descriptionText } = useTranslatedText('Description');
  const { text: phoneText } = useTranslatedText('Phone');
  const { text: eligibilityText } = useTranslatedText('Eligibility');
  const { text: accessibilityText } = useTranslatedText('Accessibility');
  const { text: languagesText } = useTranslatedText('Languages');
  const { text: addressText } = useTranslatedText('Address');
  const { text: hoursText } = useTranslatedText('Hours');
  const { text: loadingText } = useTranslatedText('Loading...');
  const { text: noDataText } = useTranslatedText('No data available');
  const { text: organizationText } = useTranslatedText('Organization');
  const { text: serviceAreasText } = useTranslatedText('Service Areas');
  const { text: dataSourceText } = useTranslatedText('Data Source');

  const [resource, setResource] = useState<Resource | null>(null);

  // Fetch resource from AsyncStorage cache
  const resourceQuery = useQuery({
    queryKey: ['211resource', resourceId],
    queryFn: () => fetchResourceById(resourceId),
    enabled: !!resourceId
  });

  // Fetch categories and subcategories for display
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const subcategoriesQuery = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => fetchSubcategories('all')
  });

  useEffect(() => {
    if (resourceQuery.data) {
      setResource(resourceQuery.data);
    }
  }, [resourceQuery.data]);

  if (resourceQuery.isLoading || categoriesQuery.isLoading || subcategoriesQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#005191" />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>Resource details not available</Text>
        <Text style={styles.debugText}>Resource ID: {resourceId}</Text>
        <Text style={styles.debugText}>
          This resource may not be cached. Please go back and select it again from the list.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <MaterialIcons name="arrow-back" size={20} color="#005191" />
          <Text style={{ color: '#005191', marginLeft: 8 }}>Back to List</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract data using helper functions
  const displayName = getResourceDisplayName(resource);
  const description = getResourceDescription(resource);
  const phoneNumber = getResourcePhoneNumber(resource);
  const formattedAddress = getResourceFormattedAddress(resource);

  // Get category/subcategory info (if applicable for 211 resources)
  const category = categoriesQuery.data?.find((c: Category) => c.id === resource.categoryId);
  const subcategory = subcategoriesQuery.data?.find((sc: Subcategory) => sc.id === resource.subcategoryId);

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.section}>
        <Text style={styles.title}>{displayName}</Text>
        
        {/* Organization */}
        {resource.nameOrganization && (
          <Text style={styles.organizationText}>{resource.nameOrganization}</Text>
        )}

        {/* Taxonomy/Category Tags */}
        {resource.taxonomy && resource.taxonomy.length > 0 && (
          <View style={styles.badgeRow}>
            {resource.taxonomy.slice(0, 3).map((tax, index) => (
              <Text key={index} style={styles.categoryBadge}>
                {tax.taxonomyTermLevel2 || tax.taxonomyTerm}
              </Text>
            ))}
          </View>
        )}

        {/* Legacy category/subcategory badges (for backward compatibility) */}
        <View style={styles.badgeRow}>
          {category && <Text style={styles.categoryBadge}>{category.name}</Text>}
          {subcategory && <Text style={styles.subcategoryBadge}>{subcategory.name}</Text>}
        </View>

        {/* Description */}
        <Text style={styles.label}>{descriptionText}</Text>
        <Text style={styles.text}>{description}</Text>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        {phoneNumber && (
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Linking.openURL(`tel:${phoneNumber.replace(/[^\d]/g, '')}`)}
          >
            <Ionicons name="call-outline" size={20} color="#005191" />
            <Text style={styles.actionLabel}>{callText}: {phoneNumber}</Text>
          </TouchableOpacity>
        )}

        {resource.url && (
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Linking.openURL(resource.url!)}
          >
            <Ionicons name="globe-outline" size={20} color="#005191" />
            <Text style={styles.actionLabel}>{websiteText}</Text>
          </TouchableOpacity>
        )}

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

      {/* Service Areas */}
      {resource.serviceAreas && resource.serviceAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>{serviceAreasText}</Text>
          <View style={styles.badgeRow}>
            {resource.serviceAreas.map((area, index) => (
              <Text key={index} style={styles.languageBadge}>
                {area.value}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Additional Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        
        {resource.hoursOfOperation && (
          <>
            <Text style={styles.label}>{hoursText}</Text>
            <Text style={styles.text}>{resource.hoursOfOperation}</Text>
          </>
        )}

        {resource.applicationProcess && (
          <>
            <Text style={styles.label}>Application Process</Text>
            <Text style={styles.text}>{resource.applicationProcess}</Text>
          </>
        )}

        {resource.fees && (
          <>
            <Text style={styles.label}>Fees</Text>
            <Text style={styles.text}>{resource.fees}</Text>
          </>
        )}

        {resource.documents && (
          <>
            <Text style={styles.label}>Required Documents</Text>
            <Text style={styles.text}>{resource.documents}</Text>
          </>
        )}

        {resource.accessibility && (
          <>
            <Text style={styles.label}>{accessibilityText}</Text>
            <Text style={styles.text}>{resource.accessibility}</Text>
          </>
        )}

        {resource.languages && resource.languages.length > 0 && (
          <>
            <Text style={styles.label}>{languagesText}</Text>
            <View style={styles.badgeRow}>
              {resource.languages.map(lang => (
                <Text key={lang} style={styles.languageBadge}>{lang}</Text>
              ))}
            </View>
          </>
        )}

        {resource.additionalLanguages && resource.additionalLanguages.length > 0 && (
          <>
            <Text style={styles.label}>Additional Languages</Text>
            <View style={styles.badgeRow}>
              {resource.additionalLanguages.map(lang => (
                <Text key={lang} style={styles.languageBadge}>{lang}</Text>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Data Source */}
      {resource.dataOwnerDisplayName && (
        <View style={styles.section}>
          <Text style={styles.label}>{dataSourceText}</Text>
          <Text style={styles.text}>{resource.dataOwnerDisplayName}</Text>
        </View>
      )}

      {/* Debug Information (only in development) */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.label}>Debug Info</Text>
          <Text style={styles.debugText}>ID: {resource.idServiceAtLocation || resource.id}</Text>
          <Text style={styles.debugText}>Organization ID: {resource.idOrganization}</Text>
          <Text style={styles.debugText}>Service ID: {resource.idService}</Text>
          <Text style={styles.debugText}>Location ID: {resource.idLocation}</Text>
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
    marginBottom: 12, 
    gap: 6 
  },
  categoryBadge: { 
    padding: 6, 
    backgroundColor: '#e0e7ef', 
    borderRadius: 4, 
    color: '#005191', 
    fontSize: 12,
    fontWeight: '500' 
  },
  subcategoryBadge: { 
    padding: 6, 
    backgroundColor: '#e9eef4', 
    borderRadius: 4, 
    color: '#007aff',
    fontSize: 12 
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
    marginBottom: 4, 
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
});
