import { useState } from "react";
import { Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import * as icons from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId: string | null;
}

export default function CategoryGrid({ categories, onCategorySelect, selectedCategoryId }: CategoryGridProps) {
  // Get icon component for a category
  const getCategoryIcon = (category: Category) => {
    if (category.icon && typeof category.icon === 'string') {
      // Create a dynamic lookup for common icon names
      const iconMap: Record<string, React.ReactNode> = {
        'home': <icons.Home className="h-6 w-6 mb-2" />,
        'briefcase': <icons.Briefcase className="h-6 w-6 mb-2" />,
        'utensils': <icons.UtensilsCrossed className="h-6 w-6 mb-2" />,
        'bus': <icons.Bus className="h-6 w-6 mb-2" />,
        'stethoscope': <icons.Stethoscope className="h-6 w-6 mb-2" />,
        'shower': <icons.Droplets className="h-6 w-6 mb-2" />,
        'brain': <icons.Brain className="h-6 w-6 mb-2" />,
        'pills': <icons.Pill className="h-6 w-6 mb-2" />,
        'users': <icons.Users className="h-6 w-6 mb-2" />,
        'graduation-cap': <icons.GraduationCap className="h-6 w-6 mb-2" />,
        'book': <icons.BookOpen className="h-6 w-6 mb-2" />,
        'user-nurse': <icons.UserCog className="h-6 w-6 mb-2" />,
        'gavel': <icons.Hammer className="h-6 w-6 mb-2" />,
        'bolt': <icons.Zap className="h-6 w-6 mb-2" />,
        'door-open': <icons.DoorOpen className="h-6 w-6 mb-2" />
      };
      
      return iconMap[category.icon] || <icons.Bookmark className="h-6 w-6 mb-2" />;
    }
    return <icons.Bookmark className="h-6 w-6 mb-2" />;
  };

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={cn(
              "cursor-pointer transition-all hover:scale-105 hover:shadow-md",
              selectedCategoryId === category.id ? "bg-primary/10 border-primary" : "bg-white"
            )}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <div className={cn(
                "p-3 rounded-full mb-2",
                selectedCategoryId === category.id ? "text-primary" : "text-muted-foreground"
              )}>
                {getCategoryIcon(category)}
              </div>
              <span className="font-medium text-sm">{category.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}