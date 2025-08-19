import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Menu, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TranslatedText } from "@/components/TranslatedText";

export default function SearchKeywordPage() {
  const [, setLocation] = useLocation();
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (keyword.trim()) {
      setLocation(`/resources?keyword=${encodeURIComponent(keyword.trim())}&useApi=true`);
    }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
            variant="outline" 
            className="flex-1"
            onClick={() => setLocation("/search-category")}
          >
            <TranslatedText text="Search Category" />
          </Button>
          <Button 
            className="flex-1 bg-orange-500 text-black font-medium"
            onClick={() => {}}
          >
            <TranslatedText text="Search Keyword" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-center mb-8">
          <TranslatedText text="Search with Keyword" />
        </h2>

        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-12 text-lg py-3"
          />
          <Button
            onClick={handleSearch}
            className="absolute right-1 top-1 bottom-1 bg-orange-500 text-black hover:bg-orange-600 px-3"
            disabled={!keyword.trim()}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}