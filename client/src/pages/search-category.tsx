import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Menu, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TranslatedText } from "@/components/TranslatedText";
import { useQuery } from "@tanstack/react-query";

interface Category {
  id: string;
  name: string;
  icon: string;
  taxonomyCode: string;
}

interface CategoriesResponse {
  categories: Category[];
}

export default function SearchCategoryPage() {
  const [, setLocation] = useLocation();
  
  const { data: categoriesResponse } = useQuery<CategoriesResponse>({
    queryKey: ["/api/categories"],
  });

  const categories = categoriesResponse?.categories || [];

  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/resources?categoryId=${categoryId}&useApi=true`);
  };

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

      {/* Search Type Toggle */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-orange-500 text-black font-medium"
            onClick={() => {}}
          >
            <TranslatedText text="Search Category" />
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setLocation("/search-keyword")}
          >
            <TranslatedText text="Search Keyword" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-center mb-8">
          <TranslatedText text="Search by Category" />
        </h2>

        {/* Category Grid */}
        <div className="grid grid-cols-3 gap-6">
          {categories.length > 0 ? categories.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                {/* Icon placeholder - would use actual icons */}
                <div className="w-6 h-6 bg-blue-500 rounded" />
              </div>
              <span className="text-sm font-medium text-center text-gray-700">
                <TranslatedText text={category.name} />
              </span>
            </button>
          )) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">
                <TranslatedText text="Loading categories..." />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}