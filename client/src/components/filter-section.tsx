import { useState, useEffect } from "react";
import { Category, Subcategory, Location } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LocationState } from "@/hooks/use-location";
import { Check, Loader2, MapPin } from "lucide-react";
import * as icons from "lucide-react";
import { useTranslatedText } from "@/components/TranslatedText";

// Category translation helper component
function CategoryName({ category }: { category: Category }) {
  const { text } = useTranslatedText(category.name);
  return <>{text}</>;
}

interface FilterSectionProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  
  subcategories: Subcategory[];
  selectedSubcategoryId: string | null;
  onSubcategoryChange: (subcategoryId: string | null) => void;
  
  locationState: LocationState;
  onUseMyLocation: () => void;
  onZipCodeChange: (zipCode: string) => void;
  onClearLocation: () => void;
  
  isLoadingSubcategories: boolean;
  isLoadingLocation: boolean;
}

export default function FilterSection({
  categories,
  selectedCategoryId,
  onCategoryChange,
  subcategories,
  selectedSubcategoryId,
  onSubcategoryChange,
  locationState,
  onUseMyLocation,
  onZipCodeChange,
  onClearLocation,
  isLoadingSubcategories,
  isLoadingLocation
}: FilterSectionProps) {
  // Translation hooks
  const { text: resourceFiltersText } = useTranslatedText("Resource Filters");
  const { text: findResourcesText } = useTranslatedText("Find resources by category and location");
  const { text: categoryText } = useTranslatedText("Category");
  const { text: allCategoriesText } = useTranslatedText("All Categories");
  const { text: locationText } = useTranslatedText("Location");
  const { text: useMyLocationText } = useTranslatedText("Use My Location");
  const { text: enterZipCodeText } = useTranslatedText("Enter zip code");
  const { text: subcategoryText } = useTranslatedText("Subcategory");
  const { text: allSubcategoriesText } = useTranslatedText("All Subcategories");
  const { text: loadingSubcategoriesText } = useTranslatedText("Loading subcategories...");
  const { text: noSubcategoriesText } = useTranslatedText("No subcategories available");
  const { text: selectSubcategoryText } = useTranslatedText("Select a subcategory");
  const { text: clearText } = useTranslatedText("Clear");
  const { text: usingCurrentLocationText } = useTranslatedText("Using your current location");
  const { text: coordinatesDetectedText } = useTranslatedText("Coordinates detected");
  const { text: zipCodeText } = useTranslatedText("Zip code");
  const { text: locationNotFoundText } = useTranslatedText("Location not found for this zip code");
  const [zipCode, setZipCode] = useState("");
  
  // Keep local zip code state in sync with location state
  useEffect(() => {
    if (locationState.type === 'zipCode') {
      setZipCode(locationState.zipCode);
    } else {
      // Clear zip code for any non-zipCode state (none, coordinates, error, loading)
      setZipCode("");
    }
  }, [locationState]);
  
  // Handle category selection
  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === "all" ? null : value);
    onSubcategoryChange(null); // Reset subcategory when category changes
  };
  
  // Handle subcategory selection
  const handleSubcategoryChange = (value: string) => {
    onSubcategoryChange(value === "all" ? null : value);
  };
  
  // Handle zip code submission
  const handleZipCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.trim()) {
      onZipCodeChange(zipCode);
    }
  };

  // Handle clearing location - also clear the zip code input
  const handleClearLocation = () => {
    onClearLocation(); // Call the parent's clear function first
    // The useEffect will handle clearing the local zip code state
  };

  // Get icon component for a category
  const getCategoryIcon = (category: Category) => {
    if (category.icon && typeof category.icon === 'string') {
      // Create a dynamic lookup for common icon names
      const iconMap: Record<string, React.ReactNode> = {
        'home': <icons.Home className="h-4 w-4 mr-2" />,
        'briefcase': <icons.Briefcase className="h-4 w-4 mr-2" />,
        'utensils': <icons.UtensilsCrossed className="h-4 w-4 mr-2" />,
        'bus': <icons.Bus className="h-4 w-4 mr-2" />,
        'stethoscope': <icons.Stethoscope className="h-4 w-4 mr-2" />,
        'shower': <icons.Droplets className="h-4 w-4 mr-2" />,
        'brain': <icons.Brain className="h-4 w-4 mr-2" />,
        'pills': <icons.Pill className="h-4 w-4 mr-2" />,
        'users': <icons.Users className="h-4 w-4 mr-2" />,
        'graduation-cap': <icons.GraduationCap className="h-4 w-4 mr-2" />,
        'book': <icons.BookOpen className="h-4 w-4 mr-2" />,
        'user-nurse': <icons.UserCog className="h-4 w-4 mr-2" />,
        'gavel': <icons.Hammer className="h-4 w-4 mr-2" />,
        'bolt': <icons.Zap className="h-4 w-4 mr-2" />,
        'door-open': <icons.DoorOpen className="h-4 w-4 mr-2" />
      };
      
      return iconMap[category.icon] || <icons.Bookmark className="h-4 w-4 mr-2" />;
    }
    return <icons.Bookmark className="h-4 w-4 mr-2" />;
  };

  return (
    <Card className="mb-6" style={{ backgroundColor: '#FFB351' }}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger className="mx-4 my-4 px-6 py-4 bg-white rounded-xl hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <h3 className="text-lg font-semibold text-[#005191]">{resourceFiltersText}</h3>
              <p className="text-sm text-gray-600 font-normal">{findResourcesText}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="bg-white rounded-xl p-4 space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-[#005191]">{categoryText}</Label>
                <Select 
                  value={selectedCategoryId || "all"} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category" className="h-12 border-2 border-[#256BAE]/20 hover:border-[#256BAE]/40 focus:border-[#256BAE] focus:ring-[#256BAE]/20">
                    <SelectValue placeholder="Select a category" className="text-gray-700" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectGroup>
                      <SelectItem value="all" className="font-medium">{allCategoriesText}</SelectItem>
                      {categories
                        .filter((category) => category.id && category.id.trim() !== '')
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id} className="py-3">
                            <div className="flex items-center">
                              {getCategoryIcon(category)}
                              <span className="font-medium">
                                <CategoryName category={category} />
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Subcategory Filter - only show when a category is selected */}
              {selectedCategoryId && (
                <div className="bg-white rounded-xl p-4 space-y-2">
                  <Label htmlFor="subcategory" className="text-sm font-medium text-[#005191]">
                    {subcategoryText}
                    {isLoadingSubcategories && (
                      <Loader2 className="h-3 w-3 ml-2 inline animate-spin text-[#256BAE]" />
                    )}
                  </Label>
                  <Select 
                    value={selectedSubcategoryId || "all"} 
                    onValueChange={handleSubcategoryChange}
                    disabled={isLoadingSubcategories || subcategories.length === 0}
                  >
                    <SelectTrigger id="subcategory" className="h-12 border-2 border-[#256BAE]/20 hover:border-[#256BAE]/40 focus:border-[#256BAE] focus:ring-[#256BAE]/20 disabled:opacity-50">
                      <SelectValue placeholder={
                        isLoadingSubcategories 
                          ? loadingSubcategoriesText 
                          : subcategories.length === 0 
                            ? noSubcategoriesText 
                            : selectSubcategoryText
                      } className="text-gray-700" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectGroup>
                        <SelectItem value="all" className="font-medium">{allSubcategoriesText}</SelectItem>
                        {subcategories
                          .filter((subcategory) => subcategory.id && subcategory.id.trim() !== '')
                          .map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id} className="py-2">
                              <span className="font-medium">{subcategory.name}</span>
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Location Filter */}
              <div className="bg-white rounded-xl p-4">
                <Label className="mb-3 block text-sm font-medium text-[#005191]">{locationText}</Label>
                
                {/* Current location status */}
                {locationState.type === 'coordinates' && (
                  <div className="mb-3 p-3 bg-[#256BAE]/10 border border-[#256BAE]/20 rounded-lg flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-[#005191]" />
                    <div className="text-sm">
                      <div className="font-medium text-[#005191]">{usingCurrentLocationText}</div>
                      <div className="text-xs text-gray-600">
                        {locationState.location ? locationState.location.name : coordinatesDetectedText}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-auto text-[#005191] hover:bg-[#256BAE]/20 font-medium" 
                      onClick={handleClearLocation}
                    >
                      {clearText}
                    </Button>
                  </div>
                )}
                
                {/* Zip code status */}
                {locationState.type === 'zipCode' && (
                  <div className="mb-3 p-3 bg-[#256BAE]/10 border border-[#256BAE]/20 rounded-lg flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-[#005191]" />
                    <div className="text-sm">
                      <div className="font-medium text-[#005191]">{zipCodeText}: {locationState.zipCode}</div>
                      <div className="text-xs text-gray-600">
                        {locationState.location 
                          ? locationState.location.name 
                          : locationNotFoundText}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-auto text-[#005191] hover:bg-[#256BAE]/20 font-medium" 
                      onClick={handleClearLocation}
                    >
                      {clearText}
                    </Button>
                  </div>
                )}
                
                {/* Error status */}
                {locationState.type === 'error' && (
                  <div className="mb-3 p-2 bg-destructive/10 rounded">
                    <div className="text-sm text-destructive">
                      {locationState.message}
                    </div>
                  </div>
                )}
                
                {/* Location controls - always show */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-12 border-2 border-[#256BAE]/20 hover:border-[#256BAE] hover:bg-[#256BAE]/10 text-[#005191] font-medium"
                      onClick={onUseMyLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4 mr-2" />
                      )}
                      {useMyLocationText}
                    </Button>
                    
                    <div className="relative w-full flex items-center">
                      <form onSubmit={handleZipCodeSubmit} className="w-full flex">
                        <Input
                          type="text"
                          placeholder={enterZipCodeText}
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          disabled={isLoadingLocation}
                          className="w-full h-12 border-2 border-[#256BAE]/20 hover:border-[#256BAE]/40 focus:border-[#256BAE] focus:ring-[#256BAE]/20 text-base px-4 font-medium disabled:opacity-50"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="ml-2 h-12 px-4 border-2 border-[#256BAE]/20 hover:border-[#256BAE] hover:bg-[#256BAE]/10 text-[#005191] font-medium"
                          disabled={!zipCode.trim() || isLoadingLocation}
                          onClick={(e) => {
                            e.preventDefault();
                            if (zipCode.trim()) {
                              onZipCodeChange(zipCode);
                            }
                          }}
                        >
                          {isLoadingLocation ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}