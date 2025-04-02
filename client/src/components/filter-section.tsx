import { type Category, type Location } from "@shared/schema";

interface FilterSectionProps {
  categories: Category[];
  selectedCategories: string[];
  locations: Location[];
  selectedLocation: string | null;
  onCategoryChange: (categoryId: string) => void;
  onLocationChange: (locationId: string | null) => void;
}

export default function FilterSection({
  categories,
  selectedCategories,
  locations,
  selectedLocation,
  onCategoryChange,
  onLocationChange
}: FilterSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <div className="md:flex md:justify-between md:items-end">
        <div className="mb-4 md:mb-0 md:flex-grow">
          <h2 className="text-lg font-semibold mb-2">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button 
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(category.id)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="md:ml-6 md:w-64">
          <h2 className="text-lg font-semibold mb-2">Location</h2>
          <div className="relative">
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              onChange={(e) => onLocationChange(e.target.value || null)}
              value={selectedLocation || ""}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
