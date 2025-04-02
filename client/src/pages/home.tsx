import { useState } from "react";
import FilterSection from "@/components/filter-section";
import ResultsSection from "@/components/results-section";
import Footer from "@/components/footer";
import { useResources } from "@/hooks/use-resources";
import { useQuery } from "@tanstack/react-query";
import { type Category, type Location } from "@shared/schema";

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fetch categories and locations
  const { data: categoriesData } = useQuery<{ categories: Category[] }>({ 
    queryKey: ['/api/categories']
  });
  
  const { data: locationsData } = useQuery<{ locations: Location[] }>({ 
    queryKey: ['/api/locations']
  });
  
  // Fetch resources based on current filters
  const {
    resources,
    isLoading,
    error,
    refetch
  } = useResources(selectedCategories, selectedLocation);
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prevCategories => {
      if (prevCategories.includes(categoryId)) {
        return prevCategories.filter(id => id !== categoryId);
      } else {
        return [...prevCategories, categoryId];
      }
    });
  };
  
  const handleLocationChange = (locationId: string | null) => {
    setSelectedLocation(locationId);
  };
  
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedLocation(null);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Resource Finder</h1>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex items-center" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <FilterSection 
          categories={categoriesData?.categories || []}
          selectedCategories={selectedCategories}
          locations={locationsData?.locations || []}
          selectedLocation={selectedLocation}
          onCategoryChange={handleCategoryChange}
          onLocationChange={handleLocationChange}
        />
        
        <ResultsSection 
          resources={resources}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onClearFilters={handleClearFilters}
        />
      </main>
      
      <Footer />
    </div>
  );
}
