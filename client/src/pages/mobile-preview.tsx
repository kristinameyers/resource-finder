import React, { useState } from 'react';

export default function MobilePreview() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState('');

  const categories = [
    { id: 'children-family', name: 'Children & Family', color: '#539ed0', icon: '👨‍👩‍👧‍👦' },
    { id: 'food', name: 'Food', color: '#ffb351', icon: '🍎' },
    { id: 'education', name: 'Education', color: '#4eb99f', icon: '📚' },
    { id: 'housing', name: 'Housing', color: '#ff443b', icon: '🏠' },
    { id: 'healthcare', name: 'Healthcare', color: '#f2b131', icon: '⚕️' },
    { id: 'finance-employment', name: 'Finance & Employment', color: '#76ced9', icon: '💼' },
    { id: 'substance-use', name: 'Substance Use', color: '#ffb351', icon: '🚭' },
    { id: 'young-adults', name: 'Young Adults', color: '#539ed0', icon: '🎓' },
    { id: 'legal-assistance', name: 'Legal Assistance', color: '#ff443b', icon: '⚖️' },
    { id: 'hygiene-household', name: 'Hygiene & Household', color: '#76ced9', icon: '🧼' },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleZipCodeSubmit = () => {
    if (zipCode.length === 5) {
      alert(`Searching resources near ZIP code: ${zipCode}`);
    } else {
      alert('Please enter a valid 5-digit ZIP code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto">
        {/* Mobile Frame */}
        <div className="bg-white rounded-[25px] p-3 shadow-2xl min-h-[812px] relative">
          <div className="bg-gray-50 rounded-[20px] overflow-hidden h-full">
            
            {/* Header */}
            <div style={{ backgroundColor: '#005191' }} className="px-5 pt-16 pb-5 text-center text-white">
              <h1 className="text-2xl font-bold mb-1">Santa Barbara Community Resources</h1>
              <p className="text-base opacity-90">Find local help and support services</p>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Location Card */}
              <div className="bg-white rounded-lg p-4 mb-5 shadow-sm">
                <div className="text-base font-medium text-gray-800 mb-1">📍 Your Location</div>
                <div className="text-sm text-gray-600">34.4208, -119.6982</div>
              </div>

              {/* ZIP Code Input */}
              <div className="flex gap-3 mb-5">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base"
                  placeholder="Enter ZIP code"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleZipCodeSubmit()}
                />
                <button
                  onClick={handleZipCodeSubmit}
                  style={{ backgroundColor: '#005191' }}
                  className="text-white px-5 py-3 rounded-lg text-base font-medium"
                >
                  ✓
                </button>
              </div>

              {/* Categories Container */}
              <div style={{ backgroundColor: '#005191' }} className="rounded-xl p-5 mb-8">
                <h2 className="text-white text-xl font-bold text-center mb-5">Browse all Categories</h2>
                
                {/* Categories Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      style={{ backgroundColor: category.color }}
                      className={`
                        min-h-[120px] rounded-xl p-4 flex flex-col items-center justify-center
                        transition-transform duration-200 hover:scale-105
                        ${selectedCategory === category.id ? 'border-2 border-white scale-105' : ''}
                      `}
                    >
                      <div className="w-10 h-10 mb-2 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-lg">
                        {category.icon}
                      </div>
                      <div className="text-black text-sm font-medium text-center leading-tight">
                        {category.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tamagui Features Info */}
        <div className="mt-8 bg-white rounded-lg p-5 border-l-4" style={{ borderLeftColor: '#005191' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#005191' }}>🎨 Tamagui UI Features Preview</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong>Design Tokens:</strong> Consistent colors and spacing across all components</li>
            <li><strong>Typography System:</strong> Professional Inter font with proper hierarchy</li>
            <li><strong>Component Library:</strong> Pre-built, accessible UI components</li>
            <li><strong>Animation Support:</strong> Smooth interactions with React Native Reanimated</li>
            <li><strong>Performance:</strong> Compile-time optimizations for faster rendering</li>
            <li><strong>Responsive Design:</strong> Built-in media queries and responsive props</li>
            <li><strong>Theme Support:</strong> Light/dark mode and custom branding</li>
            <li><strong>Type Safety:</strong> Full TypeScript integration</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3 italic">
            This preview shows the visual design. The actual Tamagui components provide enhanced performance, accessibility, and developer experience.
          </p>
        </div>
      </div>
    </div>
  );
}