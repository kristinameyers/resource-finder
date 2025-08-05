import { Category } from "@shared/schema";
import { getCategoryIcon, getCategoryColorClass, getCustomCategoryIcon } from "@/components/category-icons";

// Import PNG icons
import educationIcon from "../assets/icons/education.png";
import legalAssistanceIcon from "../assets/icons/legal-assistance.png";
import childrenFamilyIcon from "../assets/icons/children-family.png";
import foodIcon from "../assets/icons/food.png";
import financeEmploymentIcon from "../assets/icons/finance-employment.png";
import healthcareIcon from "../assets/icons/healthcare.png";
import housingIcon from "../assets/icons/housing.png";
import substanceUseIcon from "../assets/icons/substance-use.png";
import youngAdultsIcon from "../assets/icons/young-adults.png";
import transportationIcon from "../assets/icons/transportation.png";
import hygieneHouseholdIcon from "../assets/icons/hygiene-household.png";

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId: string | null;
}

export default function CategoryGrid({ categories, onCategorySelect, selectedCategoryId }: CategoryGridProps) {
  return (
    <div className="bg-[#005191] p-6 rounded-xl">
      <h2 className="text-white text-center mb-6 text-2xl font-normal">Browse all Categories</h2>
      <div className="grid grid-cols-3 gap-3 justify-items-center">
        {categories.map((category) => {
          const iconMap: Record<string, string> = {
            'education': educationIcon,
            'legal-assistance': legalAssistanceIcon,
            'children-family': childrenFamilyIcon,
            'food': foodIcon,
            'finance-employment': financeEmploymentIcon,
            'healthcare': healthcareIcon,
            'housing': housingIcon,
            'substance-use': substanceUseIcon,
            'young-adults': youngAdultsIcon,
            'transportation': transportationIcon,
            'hygiene-household': hygieneHouseholdIcon,
            // Add fallbacks for remaining missing icons
            'mental-wellness': healthcareIcon,
            'utilities': financeEmploymentIcon,
          };
          
          const categoryIcon = iconMap[category.id];
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <div 
              key={category.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-0 overflow-hidden rounded-[32px] min-h-[140px] w-[140px] h-[140px] flex flex-col bg-[#256BAE] border-2 border-white/25 shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-white shadow-xl transform scale-105' 
                  : 'hover:shadow-xl hover:transform hover:scale-102'
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  {categoryIcon ? (
                    <img src={categoryIcon} alt={category.name} className="h-[42px] w-[42px]" />
                  ) : (
                    <div className="h-[42px] w-[42px] bg-white/20 rounded-lg"></div>
                  )}
                </div>
                <h3 className="font-medium leading-tight category-text text-white">{category.name}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}