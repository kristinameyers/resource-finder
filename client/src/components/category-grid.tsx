import { Category } from "@shared/schema";
import { getCategoryIcon, getCategoryColorClass, getCustomCategoryIcon } from "@/components/category-icons";
import { useTranslatedText } from "@/components/TranslatedText";
import { useAccessibility } from "@/contexts/AccessibilityContext";

// Category translation helper component
function CategoryLabel({ category }: { category: Category }) {
  const { text } = useTranslatedText(category.name);
  return <>{text}</>;
}

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
  const { text: browseCategoriesText } = useTranslatedText("Browse all Categories");
  const { triggerHaptic, reduceMotion } = useAccessibility();
  return (
    <div className="p-6 pb-8">
      <div className="grid grid-cols-3 gap-6 justify-items-center">
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
            <button 
              key={category.id} 
              className={`cursor-pointer ${
                reduceMotion ? 'transition-none' : 'transition-all duration-200 hover:shadow-lg'
              } border-0 overflow-hidden rounded-[32px] min-h-[140px] w-[140px] h-[140px] flex flex-col bg-[#256BAE] border-2 border-white/25 shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-white shadow-xl transform scale-105' 
                  : `${reduceMotion ? '' : 'hover:shadow-xl hover:transform hover:scale-102'}`
              }`}
              onClick={() => {
                triggerHaptic('light');
                onCategorySelect(category.id);
              }}
              aria-label={`Select ${category.name} category`}
              aria-pressed={isSelected}
              role="button"
            >
              <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  {categoryIcon ? (
                    <img src={categoryIcon} alt={category.name} className="h-[42px] w-[42px]" />
                  ) : (
                    <div className="h-[42px] w-[42px] bg-white/20 rounded-lg"></div>
                  )}
                </div>
                <h3 className="font-medium leading-tight category-text text-white">
                  <CategoryLabel category={category} />
                  {isSelected && <span className="sr-only">Selected</span>}
                </h3>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}