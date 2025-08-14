import { Resource, Category, Subcategory } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import FavoriteButton from "./favorite-button";
import { useTranslatedText } from "@/components/TranslatedText";

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
}

export default function ResourceCard({ resource, category, subcategory }: ResourceCardProps) {
  const { text: viewDetailsText } = useTranslatedText("View Details");
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg sm:text-xl">{resource.name}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {category && (
            <Badge 
              variant="outline" 
              className="bg-primary/10 highlight border-primary/20"
            >
              <CategoryName name={category.name} />
            </Badge>
          )}
          {subcategory && (
            <Badge 
              variant="outline" 
              className="bg-secondary/10 text-secondary border-secondary/20"
            >
              <CategoryName name={subcategory.name} />
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-3">
          <ResourceDescription text={resource.description} />
        </CardDescription>
        
        {resource.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-4">
            <MapPin className="h-4 w-4" />
            <span><LocationName text={resource.location} /></span>
            {/* Only show zip code when user has provided location (indicated by presence of distance calculation) */}
            {resource.zipCode && resource.distanceMiles !== undefined && <span className="text-xs">({resource.zipCode})</span>}
            {resource.distanceMiles !== undefined && (
              <Badge variant="secondary" className="text-xs ml-auto bg-blue-50 text-blue-700 border-blue-200">
                {resource.distanceMiles === 0 ? '0.0 mi' : `${resource.distanceMiles.toFixed(1)} mi`}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Favorite button outside the link to prevent navigation conflicts */}
      <div className="px-6 pb-2">
        <FavoriteButton 
          resourceId={resource.id}
          className="text-sm"
        />
      </div>
      
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full btn-highlight" 
          size="sm"
          asChild
        >
          <Link href={`/resources/${resource.id}`}>
            <Info className="h-4 w-4 mr-2" /> 
            {viewDetailsText}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}