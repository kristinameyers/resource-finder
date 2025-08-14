import { Link, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Calendar, 
  Accessibility, 
  Languages, 
  ChevronLeft,
  AlertCircle,
  FileText,
  DollarSign,
  Clock,
  Users,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { fetchResourceById, fetchResourceDetails, fetchCategories, fetchSubcategories } from '@/lib/api';
import type { PhoneDetails } from '@/../../shared/schema';
import FavoriteButton from '@/components/favorite-button';
import { useTranslatedText } from "@/components/TranslatedText";

// Helper component for translating resource content
function TranslatedResourceText({ text }: { text: string }) {
  const { text: translatedText } = useTranslatedText(text);
  return <>{translatedText}</>;
}

// Helper component for translating category badges
function TranslatedCategoryName({ name }: { name: string }) {
  const { text } = useTranslatedText(name);
  return <>{text}</>;
}

export default function ResourceDetail() {
  // Translation hooks
  const { text: backToResourcesText } = useTranslatedText("Back to resources");
  const { text: loadingText } = useTranslatedText("Loading...");
  const { text: errorText } = useTranslatedText("Error loading resource");
  const { text: contactInfoText } = useTranslatedText("Contact Information");
  const { text: callText } = useTranslatedText("Call");
  const { text: websiteText } = useTranslatedText("Visit Website");
  const { text: hoursText } = useTranslatedText("Hours");
  const { text: accessibilityText } = useTranslatedText("Accessibility");
  const { text: languagesText } = useTranslatedText("Languages");
  const { text: applicationProcessText } = useTranslatedText("Application Process");
  const { text: requiredDocsText } = useTranslatedText("Required Documents");
  const { text: feesText } = useTranslatedText("Fees");
  const { text: serviceAreasText } = useTranslatedText("Service Areas");
  const { text: saveToFavoritesText } = useTranslatedText("Save to Favorites");
  const { text: aboutThisResourceText } = useTranslatedText("About this Resource");
  const { text: eligibilityText } = useTranslatedText("Eligibility");
  const { text: contactText } = useTranslatedText("Contact");
  const { text: descriptionText } = useTranslatedText("Description");
  const { text: phoneText } = useTranslatedText("Phone");
  const { text: emailText } = useTranslatedText("Email");
  const { text: documentsText } = useTranslatedText("Documents");
  const { text: contactOrganizationText } = useTranslatedText("Contact the organization directly for application information");
  const { text: contactForDocumentsText } = useTranslatedText("Contact the organization for required documentation");
  const { text: contactForFeesText } = useTranslatedText("Contact the organization for fee information");
  const { text: serviceLocationText } = useTranslatedText("Service Location");
  const { text: serviceDetailsText } = useTranslatedText("Service Details");
  const { text: hoursOfOperationText } = useTranslatedText("Hours of Operation");
  const { text: addressText } = useTranslatedText("Address");
  const { text: mainText } = useTranslatedText("Main");
  const { text: mustBeVeteranText } = useTranslatedText("Must be a veteran");
  const { text: fullyAccessibleText } = useTranslatedText("Fully accessible to individuals using mobility aids.");
  const { text: contactForHoursText } = useTranslatedText("Contact the organization for hours of operation");
  const { text: contactForEligibilityText } = useTranslatedText("Contact the organization for eligibility information");
  const { text: contactForAccessibilityText } = useTranslatedText("Contact for accessibility information");
  const { text: contactForLanguageText } = useTranslatedText("Contact for language information");
  const { id } = useParams();
  const { toast } = useToast();
  
  // Get basic resource data from localStorage (from search results), then enhance with API data
  const resourceQuery = useQuery({
    queryKey: ['/api/resources', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Resource ID is required');
      }
      
      // First try to get resource from localStorage (from recent search results)
      const storedResources = localStorage.getItem('recentResources');
      
      if (storedResources) {
        try {
          const resources = JSON.parse(storedResources);
          const foundResource = resources.find((r: any) => r.id === id);
          if (foundResource) {
            return foundResource;
          }
        } catch (parseError) {
          console.error('Error parsing stored resources:', parseError);
        }
      }
      
      // If not in localStorage, this means direct link access - show error
      throw new Error('Resource not found. Please search for resources first.');
    },
    enabled: !!id
  });

  // Fetch detailed resource information if this is a 211 API resource
  const detailsQuery = useQuery({
    queryKey: ['/api/resource-details', id],
    queryFn: async () => {
      if (!id || !id.includes('211santaba')) return null;
      
      // Get service ID from resource data for enhanced details
      const resource = resourceQuery.data;
      const serviceId = resource?.serviceId;
      
      console.log(`Fetching details for resource ${id}`, serviceId ? `with service ID ${serviceId}` : 'without service ID');
      return await fetchResourceDetails(id, serviceId);
    },
    enabled: !!id && id.includes('211santaba') && !resourceQuery.isLoading
  });

  // Get search context from localStorage for back navigation
  const getBackNavigationUrl = () => {
    const searchContext = localStorage.getItem('searchContext');
    if (searchContext) {
      const { categoryId, subcategoryId, location } = JSON.parse(searchContext);
      const params = new URLSearchParams();
      
      if (categoryId) params.set('category', categoryId);
      if (subcategoryId) params.set('subcategory', subcategoryId);
      if (location) {
        if (location.type === 'zipCode') {
          params.set('zipCode', location.value);
        } else if (location.type === 'coordinates') {
          params.set('lat', location.latitude.toString());
          params.set('lng', location.longitude.toString());
        }
      }
      
      return `/?${params.toString()}`;
    }
    return '/'; // Default fallback
  };

  const resource = resourceQuery.data;
  const detailedInfo = detailsQuery.data;
  
  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const categories = await fetchCategories();
      return { categories };
    }
  });

  // Find the category for this resource
  const category = categoriesQuery.data?.categories?.find((c: any) => c.id === resource?.categoryId);
  
  // Fetch subcategories if we have a category
  const subcategoriesQuery = useQuery({
    queryKey: ['/api/subcategories', resource?.categoryId],
    queryFn: async () => {
      if (!resource?.categoryId) throw new Error('Category ID is required');
      const subcategories = await fetchSubcategories(resource.categoryId);
      return { subcategories };
    },
    enabled: !!resource?.categoryId
  });

  // Find the subcategory for this resource
  const subcategory = subcategoriesQuery.data?.subcategories?.find((s: any) => s.id === resource?.subcategoryId);

  const isLoading = resourceQuery.isLoading || categoriesQuery.isLoading || 
                   (!!resource?.categoryId && subcategoriesQuery.isLoading) ||
                   (id?.includes('211santaba') && detailsQuery.isLoading);
  
  const error = resourceQuery.error || categoriesQuery.error || subcategoriesQuery.error;

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
        <p className="mb-6">We couldn't find the resource you're looking for.</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 pb-32">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href={getBackNavigationUrl()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {backToResourcesText}
        </Link>
      </Button>
      
      {/* Resource title and badges */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {detailedInfo?.serviceAtLocationName || detailedInfo?.serviceName || resource.name}
        </h1>
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge variant="outline" className="bg-primary/10 highlight">
              <TranslatedCategoryName name={category.name} />
            </Badge>
          )}
          {subcategory && (
            <Badge variant="outline" className="bg-secondary/10">
              <TranslatedCategoryName name={subcategory.name} />
            </Badge>
          )}
        </div>
      </div>
      
      {/* Favorites Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{saveToFavoritesText}</CardTitle>
        </CardHeader>
        <CardContent>
          <FavoriteButton 
            resourceId={resource.id}
            showText={true}
          />
        </CardContent>
      </Card>
      


      {/* About this Resource (organizationDescription) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{aboutThisResourceText}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {(detailedInfo?.organizationDescription || resource.description)?.split('\n').map((line: string, index: number) => {
              if (line.trim().startsWith('•')) {
                return (
                  <div key={index} className="flex items-start mb-1">
                    <span className="text-primary mr-2 mt-1">•</span>
                    <span><TranslatedResourceText text={line.replace('•', '').trim()} /></span>
                  </div>
                );
              }
              return <p key={index} className="mb-2"><TranslatedResourceText text={line} /></p>;
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Application Process */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-primary" />
            {applicationProcessText}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm">
            {detailedInfo?.applicationProcess ? (
              <TranslatedResourceText text={detailedInfo.applicationProcess} />
            ) : (
              contactOrganizationText
            )}
          </p>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            {documentsText}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm">
            {detailedInfo?.documentsRequired ? (
              <TranslatedResourceText text={detailedInfo.documentsRequired} />
            ) : (
              contactForDocumentsText
            )}
          </p>
        </CardContent>
      </Card>

      {/* Fees */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            {feesText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">
              {detailedInfo?.fees ? (
                <TranslatedResourceText text={detailedInfo.fees} />
              ) : (
                contactForFeesText
              )}
            </p>
          </CardContent>
        </Card>
      

      
      {/* Contact information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>{contactInfoText}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Phones from service-at-location-details */}
            {detailedInfo?.servicePhones && detailedInfo.servicePhones.length > 0 ? (
              // Display servicePhones from service-at-location-details endpoint
              detailedInfo.servicePhones.map((phone: any, index: number) => (
                <div key={index} className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{phone.name || phoneText}</p>
                    {/* Make phone clickable if not a fax */}
                    {phone.number && !phone.name?.toLowerCase().includes('fax') && !phone.description?.toLowerCase().includes('fax') ? (
                      <a 
                        href={`tel:${phone.number.replace(/[^\d]/g, '')}`}
                        className="text-primary hover:underline"
                      >
                        {phone.number}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">{phone.number}</p>
                    )}
                    {phone.description && (
                      <p className="text-xs text-muted-foreground">{phone.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (detailedInfo?.comprehensivePhones && detailedInfo.comprehensivePhones.length > 0) || 
               (resource.comprehensivePhones && resource.comprehensivePhones.length > 0) ? (
              // Fallback to comprehensive phone data from Query API
              (detailedInfo?.comprehensivePhones || resource.comprehensivePhones).map((phone: PhoneDetails, index: number) => (
                <div key={phone.id || index} className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {phone.name || phone.type || phoneText}
                      {phone.isMain && <span className="ml-1 text-xs bg-primary text-primary-foreground px-1 rounded">Main</span>}
                    </p>
                    {/* Make phone clickable if not a fax */}
                    {phone.number && !phone.name?.toLowerCase().includes('fax') && !phone.type?.toLowerCase().includes('fax') ? (
                      <p className="text-muted-foreground">
                        <a 
                          href={`tel:${phone.number.replace(/[^\d]/g, '')}`}
                          className="text-primary hover:underline"
                        >
                          {phone.number}
                        </a>
                        {phone.extension && <span className="ml-1 text-xs text-muted-foreground">ext. {phone.extension}</span>}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        {phone.number}
                        {phone.extension && <span className="ml-1 text-xs text-muted-foreground">ext. {phone.extension}</span>}
                      </p>
                    )}
                    {phone.description && (
                      <p className="text-xs text-muted-foreground">{phone.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : resource.phone || resource.phoneNumbers ? (
              // Fallback to basic phone numbers if comprehensive data not available
              <>
                {/* Main Phone Number */}
                {(resource.phoneNumbers?.main || resource.phone) && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a 
                        href={`tel:${(resource.phoneNumbers?.main || resource.phone).replace(/[^\d]/g, '')}`}
                        className="text-primary hover:underline"
                      >
                        {resource.phoneNumbers?.main || resource.phone}
                      </a>
                      <p className="text-xs text-muted-foreground">Main Phone Number</p>
                    </div>
                  </div>
                )}
                
                {/* Additional Phone Numbers */}
                {resource.phoneNumbers?.fax && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Fax</p>
                      <p className="text-muted-foreground">{resource.phoneNumbers.fax}</p>
                    </div>
                  </div>
                )}
                
                {resource.phoneNumbers?.tty && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">TTY</p>
                      <a 
                        href={`tel:${resource.phoneNumbers.tty.replace(/[^\d]/g, '')}`}
                        className="text-primary hover:underline"
                      >
                        {resource.phoneNumbers.tty}
                      </a>
                    </div>
                  </div>
                )}
                
                {resource.phoneNumbers?.crisis && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Crisis Line</p>
                      <a 
                        href={`tel:${resource.phoneNumbers.crisis.replace(/[^\d]/g, '')}`}
                        className="text-primary hover:underline"
                      >
                        {resource.phoneNumbers.crisis}
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // No phone numbers available
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">Contact information not available</p>
                </div>
              </div>
            )}
            
            {/* Hours of Operation (serviceHoursText) */}
            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{hoursOfOperationText}</p>
                <div className="text-muted-foreground whitespace-pre-line">
                  {detailedInfo?.serviceHoursText ? (
                    detailedInfo.serviceHoursText.split('\n').map((line: string, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{line}</span>
                      </div>
                    ))
                  ) : resource.hoursOfOperation ? (
                    resource.hoursOfOperation.split('\n').map((line: string, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{line}</span>
                      </div>
                    ))
                  ) : (
                    <span>{contactForHoursText}</span>
                  )}
                </div>
              </div>
            </div>
            
            {resource.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{emailText}</p>
                  <p className="text-muted-foreground">{resource.email}</p>
                </div>
              </div>
            )}
            
            {(detailedInfo?.website || resource.url) && (
              <div className="flex items-start">
                <Globe className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{websiteText}</p>
                  <a 
                    href={detailedInfo?.website || resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {(detailedInfo?.website || resource.url)?.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
            
            {(detailedInfo?.address || resource.address) && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{addressText}</p>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {detailedInfo?.address ? (
                      // Format address from service-at-location-details and make it clickable
                      <a 
                        href={`https://maps.apple.com/?q=${encodeURIComponent([
                          detailedInfo.address.street,
                          detailedInfo.address.city,
                          detailedInfo.address.state,
                          detailedInfo.address.postalCode
                        ].filter(Boolean).join(', '))}`}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {[
                          detailedInfo.address.street,
                          detailedInfo.address.city,
                          detailedInfo.address.state,
                          detailedInfo.address.postalCode
                        ].filter(Boolean).join(', ')}
                      </a>
                    ) : (
                      // Make resource address clickable
                      <a 
                        href={`https://maps.apple.com/?q=${encodeURIComponent(resource.address)}`}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resource.address}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Languages (languagesOffered) */}
            <div className="flex items-start">
              <Languages className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{languagesText}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {detailedInfo?.languagesOffered && detailedInfo.languagesOffered.length > 0 ? (
                    detailedInfo.languagesOffered.map((language: string) => (
                      <Badge key={language} variant="secondary" className="text-xs">
                        {language}
                      </Badge>
                    ))
                  ) : resource.languages && resource.languages.length > 0 ? (
                    resource.languages.map((language: string) => (
                      <Badge key={language} variant="secondary" className="text-xs">
                        {language}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">{contactForLanguageText}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{serviceDetailsText}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Eligibility */}
            <div className="flex items-start">
              <Users className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{eligibilityText}</p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {detailedInfo?.eligibility ? (
                    <TranslatedResourceText text={detailedInfo.eligibility} />
                  ) : resource.eligibility ? (
                    <TranslatedResourceText text={resource.eligibility} />
                  ) : (
                    contactForEligibilityText
                  )}
                </p>
              </div>
            </div>
            
            {/* Accessibility (disabilitiesAccess) */}
            <div className="flex items-start">
              <Accessibility className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{accessibilityText}</p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {detailedInfo?.disabilitiesAccess ? (
                    <TranslatedResourceText text={detailedInfo.disabilitiesAccess} />
                  ) : resource.accessibility ? (
                    <TranslatedResourceText text={resource.accessibility} />
                  ) : (
                    contactForAccessibilityText
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {resource.phone && (
          <Button 
            variant="outline" 
            onClick={() => {
              navigator.clipboard.writeText(resource.phone || "");
              toast({
                title: "Phone number copied",
                description: `${resource.phone} has been copied to your clipboard.`
              });
            }}
          >
            <Phone className="mr-2 h-4 w-4" />
            Copy Phone Number
          </Button>
        )}
        
        {resource.url && (
          <Button asChild className="btn-highlight">
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" />
              Visit Website
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}