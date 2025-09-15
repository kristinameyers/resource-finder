import { Resource, Category, Subcategory } from "@sb211/shared-schema/src";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ExternalLink, MapPin, Heart, Eye, Info } from "lucide-react";
import { cn } from "../utils";
import { Link } from "wouter";
import FavoriteButton from "./favorite-button";
import { useTranslatedText } from "./TranslatedText";

// Helper components for translations
function ResourceDescription({ text }: { text: string }) {
  const { text: translatedText } = useTranslatedText(text);
  return <>{translatedText}</>;
}

function LocationName({ text }: { text: string }) {
  const { text: translatedText } = useTranslatedText(text);
  return <>{translatedText}</>;
}

function CategoryName({ name }: { name: string }) {
  const { text } = useTranslatedText(name);
  return <>{text}</>;
}

interface ResourceCardProps {
  resource: Resource;
  category?: Category;
  subcategory?: Subcategory;
  onFavoriteToggle?: () => void; // If supporting in parent
  isFavorited?: boolean;
}

// Helper for text truncation with ellipsis
function Clamp({ children, lines = 2 }: { children: React.ReactNode; lines?: number }) {
  return <span className={`block truncate line-clamp-${lines}`}>{children}</span>;
}

export default function ResourceCard({ resource, category, subcategory }: ResourceCardProps) {
  const { text: viewDetailsText } = useTranslatedText("View Details");
  const { text: addToFavoritesText } = useTranslatedText("Add to Favorites");

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-5 mb-6 flex flex-col">
      {/* Category/Subcategory badges row */}
      <div className="flex flex-wrap gap-2 mb-2">
        {category &&
          <Badge className="bg-blue-50 text-blue-800 border-blue-200 font-medium text-xs px-3 py-1 rounded-full">
            {category.name}
          </Badge>
        }
        {subcategory &&
          <Badge className="bg-sky-50 text-sky-700 border-sky-200 font-medium text-xs px-3 py-1 rounded-full">
            {subcategory.name}
          </Badge>
        }
      </div>
      {/* Main row: Title and distance that floats right */}
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-lg leading-snug text-gray-900 max-w-[70%]">
          <Clamp>{resource.name}</Clamp>
        </h3>
        {/* Distance as pill */}
        {resource.distanceMiles !== undefined && (
          <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-3 py-1 font-semibold">{resource.distanceMiles.toFixed(2)} mi</span>
        )}
      </div>
      {/* Description */}
      <p className="text-gray-700 text-sm mb-2 line-clamp-2">
        {resource.description}
      </p>
      {/* Location */}
      {resource.location && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1 opacity-70" />
          <span>{resource.location}</span>
        </div>
      )}
      {/* Footer with actions */}
      <div className="flex gap-2 mt-auto">
        <FavoriteButton 
    resourceId={resource.id}
    className="flex-1 flex items-center justify-center rounded-full" 
    // Add any props for styling!
  />
  <Button
    variant="default"
    size="sm"
    className="flex-1 flex items-center justify-center rounded-full"
    asChild
  >
    <Link href={`/resources/${resource.id}`}>
      <Eye className="h-4 w-4 mr-2" />
      {viewDetailsText}
    </Link>
  </Button>
</div>
    </div>
  );
}