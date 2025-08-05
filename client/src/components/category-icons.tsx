import { 
  Home, 
  Utensils, 
  GraduationCap, 
  Briefcase, 
  Heart,
  Scale,
  Car,
  Brain,
  Pill,
  Users,
  Droplets,
  User
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export const CategoryIcons: Record<string, LucideIcon> = {
  family: Users,              // Children & Family - group of people icon
  food: Utensils,            // Food - fork and spoon
  education: GraduationCap,  // Education - graduation cap
  housing: Home,
  employment: Briefcase,
  health: Heart,
  healthcare: Heart,
  legal: Scale,
  transportation: Car,
  "mental-health": Brain,
  substance: Pill,
  hygiene: Droplets,
  "young-adults": User
};

export const getCategoryIcon = (categoryId: string): LucideIcon => {
  return CategoryIcons[categoryId] || Home;
};

export const getCategoryColorClass = (categoryId: string): string => {
  const colorMap: Record<string, string> = {
    housing: "category-housing",
    food: "category-food", 
    health: "category-health",
    healthcare: "category-health",
    education: "category-education",
    employment: "category-employment",
    legal: "category-legal",
    transportation: "category-transportation",
    "mental-health": "category-mental-health",
    substance: "category-substance",
    family: "category-family",
    hygiene: "category-hygiene",
    "young-adults": "category-young-adults"
  };
  
  return colorMap[categoryId] || "category-housing";
};