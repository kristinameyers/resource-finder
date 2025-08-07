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
import FavoriteButton from '@/components/favorite-button';

export default function ResourceDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  
  // For 211 API resources, we need to get all resources since individual lookups don't work
  // Store the current category and resources in localStorage for navigation
  const resourceQuery = useQuery({
    queryKey: ['/api/resources', id],
    queryFn: async () => {
      if (!id) throw new Error('Resource ID is required');
      
      // Try to get resource from localStorage first (from recent search results)
      const storedResources = localStorage.getItem('recentResources');
      if (storedResources) {
        const resources = JSON.parse(storedResources);
        const foundResource = resources.find((r: any) => r.id === id);
        if (foundResource) {
          return foundResource;
        }
      }
      
      // Fallback to API call
      return await fetchResourceById(id, true);
    },
    enabled: !!id
  });

  // Fetch detailed resource information if this is a 211 API resource
  const detailsQuery = useQuery({
    queryKey: ['/api/resource-details', id],
    queryFn: async () => {
      if (!id || !id.includes('211santaba')) return null;
      return await fetchResourceDetails(id);
    },
    enabled: !!id && id.includes('211santaba')
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
    <div className="container max-w-4xl mx-auto p-4 md:p-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href={getBackNavigationUrl()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to resources
        </Link>
      </Button>
      
      {/* Resource title and badges */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{resource.name}</h1>
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge variant="outline" className="bg-primary/10 highlight">
              {category.name}
            </Badge>
          )}
          {subcategory && (
            <Badge variant="outline" className="bg-secondary/10">
              {subcategory.name}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Favorites Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Save to Favorites</CardTitle>
        </CardHeader>
        <CardContent>
          <FavoriteButton 
            resourceId={resource.id}
            showText={true}
          />
        </CardContent>
      </Card>
      
      {/* Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About this resource</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {/* Use detailed description if available, otherwise use basic description */}
            {(detailedInfo?.description || resource.description)?.split('\n').map((line: string, index: number) => {
              if (line.trim().startsWith('•')) {
                return (
                  <div key={index} className="flex items-start mb-1">
                    <span className="text-primary mr-2 mt-1">•</span>
                    <span>{line.replace('•', '').trim()}</span>
                  </div>
                );
              }
              return <p key={index} className="mb-2">{line}</p>;
            })}
          </div>
          
          {/* Show enhanced information if available from Service At Location Details */}
          {detailedInfo && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Enhanced Information Available</h4>
              <p className="text-sm text-blue-700">
                This resource has comprehensive details including eligibility requirements, 
                fees, application process, and required documents.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Application Process, Documents, and Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-primary" />
              Application Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">
              {detailedInfo?.applicationProcess || resource.applicationProcess || "Contact the organization directly for application information"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">
              {detailedInfo?.documents || detailedInfo?.requiredDocuments || resource.documents || "Contact the organization for required documentation"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">
              {detailedInfo?.fees || resource.fees || "Contact the organization for fee information"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Service Areas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Service Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">
            {resource.serviceAreas || "Contact the organization for service area information"}
          </p>
        </CardContent>
      </Card>
      
      {/* Contact information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Phone Number */}
            {(resource.phoneNumbers?.main || resource.phone) && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{resource.phoneNumbers?.main || resource.phone}</p>
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
                  <p className="text-muted-foreground">{resource.phoneNumbers.tty}</p>
                </div>
              </div>
            )}
            
            {resource.phoneNumbers?.crisis && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Crisis Line</p>
                  <p className="text-muted-foreground">{resource.phoneNumbers.crisis}</p>
                </div>
              </div>
            )}
            
            {/* Hours of Operation */}
            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Hours of Operation</p>
                <div className="text-muted-foreground whitespace-pre-line">
                  {(detailedInfo?.hours || detailedInfo?.schedule || resource.hoursOfOperation) ? (
                    (detailedInfo?.hours || detailedInfo?.schedule || resource.hoursOfOperation).split('\n').map((line: string, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{line}</span>
                      </div>
                    ))
                  ) : (
                    <span>Contact the organization for hours of operation</span>
                  )}
                </div>
              </div>
            </div>
            
            {resource.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{resource.email}</p>
                </div>
              </div>
            )}
            
            {resource.url && (
              <div className="flex items-start">
                <Globe className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Website</p>
                  <a 
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {resource.url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
            
            {resource.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground whitespace-pre-line">{resource.address}</p>
                </div>
              </div>
            )}
            
            {/* Languages */}
            <div className="flex items-start">
              <Languages className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Languages</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resource.languages && resource.languages.length > 0 ? (
                    resource.languages.map((language: string) => (
                      <Badge key={language} variant="secondary" className="text-xs">
                        {language}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">English</Badge>
                  )}
                  {resource.additionalLanguages?.map((language: string) => (
                    <Badge key={language} variant="outline" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Eligibility */}
            <div className="flex items-start">
              <Users className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Eligibility</p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {detailedInfo?.eligibility || resource.eligibility || "Contact the organization for eligibility information"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Schedule</p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {resource.schedules || "Contact for hours"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Accessibility className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Accessibility</p>
                <p className="text-muted-foreground">
                  {resource.accessibility || "Contact for accessibility information"}
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