import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function ResourceFinder() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [zipCode, setZipCode] = useState('93101');
  
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const { data: resourcesData, isLoading: resourcesLoading, error: resourcesError } = useQuery({
    queryKey: ['/api/resources', selectedCategory, zipCode],
    queryFn: async () => {
      if (!selectedCategory) return { resources: [] };
      const response = await fetch(`/api/resources?category=${selectedCategory}&zipCode=${zipCode}&distance=10`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      return response.json();
    },
    enabled: !!selectedCategory,
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#005191', marginBottom: '20px' }}>
        Santa Barbara 211 Resource Finder
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Select a Category</h2>
        {categoriesLoading && <p data-testid="categories-loading">Loading categories...</p>}
        {categoriesError && <p data-testid="categories-error">Error loading categories</p>}
        {categoriesData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {categoriesData.categories?.map((category: any) => (
              <button
                key={category.id}
                data-testid={`category-button-${category.id}`}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '10px',
                  border: selectedCategory === category.id ? '2px solid #005191' : '1px solid #ccc',
                  borderRadius: '8px',
                  background: selectedCategory === category.id ? '#e6f2ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <strong>{category.name}</strong>
                {category.icon && <span style={{ marginLeft: '8px' }}>🔍</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="zipcode" style={{ marginRight: '10px' }}>Zip Code:</label>
        <input
          id="zipcode"
          data-testid="input-zipcode"
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {selectedCategory && (
        <div>
          <h2>Resources</h2>
          {resourcesLoading && <p data-testid="resources-loading">Loading resources...</p>}
          {resourcesError && <p data-testid="resources-error">Error loading resources</p>}
          {resourcesData && (
            <div>
              <p data-testid="resources-count">
                Found {resourcesData.total || resourcesData.resources?.length || 0} resources
              </p>
              {resourcesData.resources?.length === 0 ? (
                <p data-testid="resources-empty">No resources found in this category</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {resourcesData.resources?.map((resource: any) => (
                    <div
                      key={resource.id}
                      data-testid={`resource-card-${resource.id}`}
                      style={{
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        background: '#f9f9f9',
                      }}
                    >
                      <h3 style={{ color: '#005191', marginBottom: '10px' }}>
                        {resource.name}
                      </h3>
                      {resource.description && (
                        <p data-testid={`resource-description-${resource.id}`}>
                          {resource.description}
                        </p>
                      )}
                      {resource.phone && (
                        <p data-testid={`resource-phone-${resource.id}`}>
                          📞 {resource.phone}
                        </p>
                      )}
                      {resource.address && (
                        <p data-testid={`resource-address-${resource.id}`}>
                          📍 {resource.address}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ResourceFinder />
    </QueryClientProvider>
  );
}

export default App;