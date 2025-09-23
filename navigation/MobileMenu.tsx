import { type Category, type Location } from "../types/shared-schema";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategories: string[];
  locations: Location[];
  selectedLocation: string | null;
  onCategoryChange: (categoryId: string) => void;
  onLocationChange: (locationId: string | null) => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  locations,
  selectedLocation,
  onCategoryChange,
  onLocationChange
}: MobileMenuProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
      <div className="bg-white h-full w-4/5 max-w-sm overflow-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={onClose} className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Categories</h3>
          <div className="flex flex-col space-y-2">
            {categories.map((category) => (
              <button 
                key={category.id}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors text-left ${
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
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Location</h3>
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
  );
}
