import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { ChevronLeft, Menu, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TranslatedText } from "@/components/TranslatedText";
import GlobalNavbar from "@/components/GlobalNavbar";
import { useQuery } from "@tanstack/react-query";
import { filterSantaBarbaraAndSort } from "@/lib/distanceUtils";

interface Resource {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  location: string;
  zipCode?: string;
  address: string;
  serviceAreas?: string;
  distanceMiles?: number;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface CategoriesResponse {
  categories: Category[];
}

interface SubcategoriesResponse {
  subcategories: Subcategory[];
}

export default function ResourcesListPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("");

  // Parse URL parameters
  const params = new URLSearchParams(search);
  const categoryId = params.get('categoryId');
  const keyword = params.get('keyword');
  const useApi = params.get('useApi') === 'true';

  useEffect(() => {
    // Get user location for distance calculations
    const zipCode = localStorage.getItem('userZipCode');
    if (zipCode) {
      setUserLocation(zipCode);
    }
  }, []);

  // Fetch category data
  const { data: categoriesResponse } = useQuery<CategoriesResponse>({
    queryKey: ["/api/categories"],
  });
  const categories = categoriesResponse?.categories || [];

  // Fetch subcategories for the selected category
  const { data: subcategoriesResponse } = useQuery<SubcategoriesResponse>({
    queryKey: ["/api/subcategories", categoryId],
    enabled: !!categoryId,
  });
  const subcategories = subcategoriesResponse?.subcategories || [];

  // Build query parameters for resources
  const resourceParams = new URLSearchParams();
  if (categoryId) resourceParams.set('categoryId', categoryId);
  if (selectedSubcategory) resourceParams.set('subcategoryId', selectedSubcategory);
  if (keyword) resourceParams.set('keyword', keyword);
  if (useApi) resourceParams.set('useApi', 'true');
  if (userLocation) resourceParams.set('zipCode', userLocation);

  // Fetch resources
  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ["/api/resources", resourceParams.toString()],
    enabled: !!(categoryId || keyword),
  });

  // Resources are now properly filtered by 211 API - no local filtering needed
  const processedResources = (resourcesData as any)?.resources || [];

  const currentCategory = categories.find((cat: Category) => cat.id === categoryId);
  const filteredSubcategories = subcategories.filter((sub: Subcategory) => sub.categoryId === categoryId);

  const handleBack = () => {
    setLocation("/");
  };

  const handleMenuClick = () => {
    // TODO: Implement hamburger menu slide-out
    console.log("Menu clicked");
  };

  const handleLocationClick = () => {
    setLocation("/update-location");
  };

  const handleResourceClick = (resourceId: string) => {
    setLocation(`/resources/${resourceId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBack}
            className="p-1"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleMenuClick}
            className="p-1"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLocationClick}
          className="p-1"
        >
          <MapPin className="h-5 w-5" />
        </Button>
      </div>

      {/* Header */}
      <div className="text-center py-6 bg-white">
        <h1 className="text-xl font-semibold text-gray-900">
          <TranslatedText text="Santa Barbara 211" />
        </h1>
      </div>

      {/* Filters and Controls */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex space-x-2 mb-4">
          {/* Subcategories Dropdown */}
          {filteredSubcategories.length > 0 && (
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Subcategories" />
                <ChevronDown className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <TranslatedText text="All Subcategories" />
                </SelectItem>
                {filteredSubcategories.map((subcategory: Subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    <TranslatedText text={subcategory.name} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Update Location Button */}
          <Button 
            variant="outline"
            onClick={handleLocationClick}
            className="whitespace-nowrap"
          >
            <TranslatedText text="Update Location" />
          </Button>
        </div>

        {/* Results Count */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            {isLoading ? (
              <TranslatedText text="Loading..." />
            ) : (
              <>
                {processedResources.length} <TranslatedText text="Resources in" />
                <br />
                <TranslatedText text={currentCategory?.name || keyword || "Search Results"} />
              </>
            )}
          </p>
        </div>
      </div>

      {/* Resources List */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="text-center py-8">
            <TranslatedText text="Loading resources..." />
          </div>
        ) : processedResources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              <TranslatedText text="No resources found in Santa Barbara County." />
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {processedResources.map((resource: Resource & { distanceMiles?: number }) => (
              <div
                key={resource.id}
                onClick={() => handleResourceClick(resource.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    <TranslatedText text={resource.name} />
                  </h3>
                  {resource.distanceMiles && (
                    <span className="text-sm text-blue-600 font-medium">
                      {resource.distanceMiles} mi
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  <TranslatedText text={resource.description} />
                </p>

                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span><TranslatedText text={resource.location} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
