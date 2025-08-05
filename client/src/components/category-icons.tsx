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
  ShowerHead,
  UserCheck
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export const CategoryIcons: Record<string, LucideIcon> = {
  housing: Home,
  food: Utensils,
  education: GraduationCap,
  employment: Briefcase,
  health: Heart,
  legal: Scale,
  transportation: Car,
  "mental-health": Brain,
  substance: Pill,
  family: Users,
  hygiene: ShowerHead,
  "young-adults": UserCheck
};

export const getCategoryIcon = (categoryId: string): LucideIcon => {
  return CategoryIcons[categoryId] || Home;
};

export const getCategoryColorClass = (categoryId: string): string => {
  const colorMap: Record<string, string> = {
    housing: "category-housing",
    food: "category-food", 
    health: "category-health",
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