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
  ChevronLeft 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ResourceDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  
  // Fetch all resources and filter locally to find the one we need
  const resourcesQuery = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const response = await fetch('/api/resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      return data.resources;
    }
  });

  // Find the specific resource
  const resource = resourcesQuery.data?.find((r: any) => r.id === id);
  
  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories;
    }
  });

  // Find the category for this resource
  const category = categoriesQuery.data?.find((c: any) => c.id === resource?.categoryId);
  
  // Fetch subcategories if we have a category
  const subcategoriesQuery = useQuery({
    queryKey: ['/api/subcategories', resource?.categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/subcategories?categoryId=${resource?.categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      return data.subcategories;
    },
    enabled: !!resource?.categoryId
  });

  // Find the subcategory for this resource
  const subcategory = subcategoriesQuery.data?.find((s: any) => s.id === resource?.subcategoryId);

  const isLoading = resourcesQuery.isLoading || categoriesQuery.isLoading || 
                   (!!resource?.categoryId && subcategoriesQuery.isLoading);
  
  const error = resourcesQuery.error || categoriesQuery.error || subcategoriesQuery.error;

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
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to resources
        </Link>
      </Button>
      
      {/* Resource title and badges */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{resource.name}</h1>
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge variant="outline" className="bg-primary/10">
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
      
      {/* Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About this resource</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{resource.description}</p>
        </CardContent>
      </Card>
      
      {/* Contact information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resource.phone && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{resource.phone}</p>
                </div>
              </div>
            )}
            
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resource.schedules && (
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Hours of Operation</p>
                  <p className="text-muted-foreground whitespace-pre-line">{resource.schedules}</p>
                </div>
              </div>
            )}
            
            {resource.accessibility && (
              <div className="flex items-start">
                <Accessibility className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Accessibility</p>
                  <p className="text-muted-foreground">{resource.accessibility}</p>
                </div>
              </div>
            )}
            
            {resource.languages && resource.languages.length > 0 && (
              <div className="flex items-start">
                <Languages className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Languages</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resource.languages.map((language: string) => (
                      <Badge key={language} variant="secondary" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
          <Button asChild>
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