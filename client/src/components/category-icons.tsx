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
  "children-family": Users,      // Children & Family - group of people icon
  food: Utensils,               // Food - fork and spoon
  education: GraduationCap,     // Education - graduation cap
  housing: Home,
  "finance-employment": Briefcase,
  healthcare: Heart,
  "legal-assistance": Scale,
  transportation: Car,
  "mental-wellness": Brain,
  "substance-use": Pill,
  "hygiene-household": Droplets,
  "young-adults": User,
  utilities: Briefcase
};

export const getCategoryIcon = (categoryId: string): LucideIcon => {
  return CategoryIcons[categoryId] || Home;
};

export const getCategoryColorClass = (categoryId: string): string => {
  const colorMap: Record<string, string> = {
    housing: "category-housing",
    food: "category-food", 
    healthcare: "category-healthcare",
    education: "category-education",
    "finance-employment": "category-finance-employment",
    "legal-assistance": "category-legal-assistance",
    transportation: "category-transportation",
    "mental-wellness": "category-mental-wellness",
    "substance-use": "category-substance-use",
    "children-family": "category-children-family",
    "hygiene-household": "category-hygiene-household",
    "young-adults": "category-young-adults",
    utilities: "category-utilities"
  };
  
  return colorMap[categoryId] || "category-housing";
};