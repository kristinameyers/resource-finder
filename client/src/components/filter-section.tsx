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
import { LocationState } from "@/hooks/use-location";
import { Check, Loader2, MapPin } from "lucide-react";
import * as icons from "lucide-react";

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
  const [zipCode, setZipCode] = useState("");
  
  // Keep local zip code state in sync with location state
  useEffect(() => {
    if (locationState.type === 'zipCode') {
      setZipCode(locationState.zipCode);
    } else if (locationState.type === 'none' || locationState.type === 'coordinates') {
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
    setZipCode(""); // Clear the local zip code state
    onClearLocation(); // Call the parent's clear function
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resource Filters</CardTitle>
        <CardDescription>
          Find resources by category and location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={selectedCategoryId || "all"} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      {getCategoryIcon(category)}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* Subcategory Filter - only show when a category is selected */}
        {selectedCategoryId && (
          <div className="space-y-2">
            <Label htmlFor="subcategory">
              Subcategory
              {isLoadingSubcategories && (
                <Loader2 className="h-3 w-3 ml-2 inline animate-spin" />
              )}
            </Label>
            <Select 
              value={selectedSubcategoryId || "all"} 
              onValueChange={handleSubcategoryChange}
              disabled={isLoadingSubcategories || subcategories.length === 0}
            >
              <SelectTrigger id="subcategory">
                <SelectValue placeholder={
                  isLoadingSubcategories 
                    ? "Loading subcategories..." 
                    : subcategories.length === 0 
                      ? "No subcategories available" 
                      : "Select a subcategory"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Location Filter */}
        <div className="pt-2 border-t">
          <Label className="mb-2 block">Location</Label>
          
          {/* Current location status */}
          {locationState.type === 'coordinates' && (
            <div className="mb-3 p-2 bg-primary/10 rounded flex items-center">
              <MapPin className="h-4 w-4 mr-2 highlight" />
              <div className="text-sm">
                <div className="font-medium">Using your current location</div>
                <div className="text-xs text-muted-foreground">
                  {locationState.location ? locationState.location.name : 'Coordinates detected'}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="ml-auto" 
                onClick={handleClearLocation}
              >
                Clear
              </Button>
            </div>
          )}
          
          {/* Zip code status */}
          {locationState.type === 'zipCode' && (
            <div className="mb-3 p-2 bg-primary/10 rounded flex items-center">
              <MapPin className="h-4 w-4 mr-2 highlight" />
              <div className="text-sm">
                <div className="font-medium">Zip code: {locationState.zipCode}</div>
                <div className="text-xs text-muted-foreground">
                  {locationState.location 
                    ? locationState.location.name 
                    : 'Location not found for this zip code'}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="ml-auto" 
                onClick={handleClearLocation}
              >
                Clear
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
                className="w-full btn-highlight"
                onClick={onUseMyLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                Use My Location
              </Button>
              
              <div className="relative w-full flex items-center">
                <form onSubmit={handleZipCodeSubmit} className="w-full flex">
                  <Input
                    type="text"
                    placeholder="Enter zip code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    disabled={isLoadingLocation}
                    className="w-full"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="ml-2 btn-highlight"
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
      </CardContent>
    </Card>
  );
}