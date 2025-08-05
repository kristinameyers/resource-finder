import { Category } from "@shared/schema";
import { getCategoryIcon, getCategoryColorClass, getCustomCategoryIcon } from "@/components/category-icons";
import { getCustomCategoryIconComponent } from "@/components/custom-category-icons";

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
          const IconComponent = getCategoryIcon(category.id);
          const customIcon = getCustomCategoryIcon(category.id);
          const CustomIconComponent = getCustomCategoryIconComponent(category.id);
          const colorClass = getCategoryColorClass(category.id);
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
                  <CustomIconComponent />
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