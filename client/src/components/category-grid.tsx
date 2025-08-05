import { Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryIcon, getCategoryColorClass, getCustomCategoryIcon } from "@/components/category-icons";

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId: string | null;
}

export default function CategoryGrid({ categories, onCategorySelect, selectedCategoryId }: CategoryGridProps) {
  return (
    <div className="bg-[#005191] p-6 rounded-xl">
      <h2 className="text-white text-center mb-6 text-2xl font-normal">Browse all Categories</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category.id);
          const customIcon = getCustomCategoryIcon(category.id);
          const colorClass = getCategoryColorClass(category.id);
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <Card 
              key={category.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-0 ${
                isSelected 
                  ? 'ring-2 ring-white shadow-xl transform scale-105' 
                  : 'hover:shadow-xl hover:transform hover:scale-102'
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className={`p-6 text-center ${colorClass} rounded-xl min-h-[130px] flex flex-col items-center justify-center`}>
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  {customIcon ? (
                    <img src={customIcon} alt={category.name} className="h-[42px] w-[42px]" />
                  ) : (
                    <IconComponent className="h-[42px] w-[42px]" />
                  )}
                </div>
                <h3 className="font-medium leading-tight category-text">{category.name}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}