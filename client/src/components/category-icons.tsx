import { 
  Home, 
  Utensils, 
  BookOpen, 
  Briefcase, 
  Heart,
  Scale,
  Bus,
  Brain,
  Pill,
  Users2,
  Droplets,
  User
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export const CategoryIcons: Record<string, LucideIcon> = {
  "children-family": Users2,     // Children & Family - family/group icon
  food: Utensils,               // Food - fork and spoon
  education: BookOpen,          // Education - open book icon
  housing: Home,
  "finance-employment": Briefcase,
  healthcare: Heart,
  "legal-assistance": Scale,
  transportation: Bus,
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