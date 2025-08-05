import { Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryIcon, getCategoryColorClass } from "@/components/category-icons";

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId: string | null;
}

export default function CategoryGrid({ categories, onCategorySelect, selectedCategoryId }: CategoryGridProps) {
  return (
    <div className="bg-[#005191] p-6 rounded-xl">
      <h2 className="text-white text-center mb-6 text-2xl font-normal">Browse all Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category.id);
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
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="font-medium text-sm leading-tight">{category.name}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}