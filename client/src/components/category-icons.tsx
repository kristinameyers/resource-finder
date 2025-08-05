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

// Import custom PNG icons
import childrenFamilyIcon from "@assets/Children and Family_1754356261782.png";
import foodIcon from "@assets/food_1754356284244.png";
import educationIcon from "@assets/education_1754356313451.png";

export const CategoryIcons: Record<string, LucideIcon> = {
  "children-family": Users2,     // Will be replaced with custom PNG
  food: Utensils,               // Will be replaced with custom PNG
  education: BookOpen,          // Will be replaced with custom PNG
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

// Custom PNG icons for specific categories
export const CustomCategoryIcons: Record<string, string> = {
  "children-family": childrenFamilyIcon,
  food: foodIcon,
  education: educationIcon
};

export const getCategoryIcon = (categoryId: string): LucideIcon => {
  return CategoryIcons[categoryId] || Home;
};

export const getCustomCategoryIcon = (categoryId: string): string | null => {
  return CustomCategoryIcons[categoryId] || null;
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