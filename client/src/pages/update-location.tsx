import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Menu, MapPin, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TranslatedText } from "@/components/TranslatedText";
import GlobalNavbar from "@/components/GlobalNavbar";
import { useToast } from "@/hooks/use-toast";
import { getCoordinatesFromZipCode } from "@/lib/distanceUtils";

export default function UpdateLocationPage() {
  const [, setLocation] = useLocation();
  const [zipCode, setZipCode] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved zip code from localStorage
    const savedZipCode = localStorage.getItem('userZipCode');
    if (savedZipCode) {
      setZipCode(savedZipCode);
    }
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Store coordinates in localStorage
      localStorage.setItem('userLatitude', latitude.toString());
      localStorage.setItem('userLongitude', longitude.toString());
      localStorage.removeItem('userZipCode'); // Clear zip code when using GPS
      
      toast({
        title: "Location Updated",
        description: "Using your current GPS location for distance calculations.",
      });
      
      setLocation("/");
      
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: "Location Error",
        description: "Could not get your current location. Please enter your zip code.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleZipCodeSave = async () => {
    if (zipCode.trim()) {
      // Basic zip code validation (5 digits)
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(zipCode.trim())) {
        toast({
          title: "Invalid Zip Code",
          description: "Please enter a valid 5-digit zip code.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Convert zip code to coordinates before saving
        const coords = await getCoordinatesFromZipCode(zipCode.trim());
        
        if (coords) {
          // Store coordinates instead of just zip code for more precise 211 API queries
          localStorage.setItem('userLatitude', coords.lat.toString());
          localStorage.setItem('userLongitude', coords.lng.toString());
          localStorage.setItem('userZipCode', zipCode.trim()); // Keep zip for display purposes
          
          toast({
            title: "Location Updated",
            description: `Zip code ${zipCode.trim()} converted to coordinates for precise distance calculations.`,
          });
          
          setLocation("/");
        } else {
          // Fallback to just storing zip code if coordinate conversion fails
          localStorage.setItem('userZipCode', zipCode.trim());
          localStorage.removeItem('userLatitude');
          localStorage.removeItem('userLongitude');
          
          toast({
            title: "Location Updated",
            description: `Zip code ${zipCode.trim()} saved (coordinate lookup unavailable).`,
          });
          
          setLocation("/");
        }
      } catch (error) {
        console.error('Error converting zip code to coordinates:', error);
        // Fallback to just storing zip code
        localStorage.setItem('userZipCode', zipCode.trim());
        localStorage.removeItem('userLatitude');
        localStorage.removeItem('userLongitude');
        
        toast({
          title: "Location Updated",
          description: `Zip code ${zipCode.trim()} saved (coordinate lookup failed).`,
        });
        
        setLocation("/");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleZipCodeSave();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Navigation */}
      <GlobalNavbar showBackButton={true} onBackClick={handleBack} />
      
      {/* Content with top padding for fixed navbar */}
      <div style={{ paddingTop: '66px' }}>
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
            variant="outline" 
            className="flex-1"
            onClick={() => setLocation("/search-category")}
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
          <TranslatedText text="Update Your Location" />
        </h2>

        <div className="space-y-6">
          {/* Use Current Location */}
          <div>
            <Button
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg"
            >
              <Locate className="mr-2 h-5 w-5" />
              {isGettingLocation ? (
                <TranslatedText text="Getting Location..." />
              ) : (
                <TranslatedText text="Use My Current Location" />
              )}
            </Button>
          </div>

          {/* Zip Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TranslatedText text="Enter Zip Code" />
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="93101"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={5}
                className="flex-1 text-lg py-3"
              />
              <Button
                onClick={handleZipCodeSave}
                disabled={!zipCode.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-black px-6"
              >
                <TranslatedText text="Save" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
}