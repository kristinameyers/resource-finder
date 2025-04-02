import { type Resource } from "@shared/schema";
import ResourceCard from "./resource-card";

interface ResultsSectionProps {
  resources: Resource[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onClearFilters: () => void;
}

export default function ResultsSection({
  resources,
  isLoading,
  error,
  onRetry,
  onClearFilters
}: ResultsSectionProps) {
  const filteredResources = resources || [];
  
  // Display loading state
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Loading Resources...</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="skeleton h-40"></div>
              <div className="p-4">
                <div className="skeleton h-6 w-3/4 rounded mb-3"></div>
                <div className="skeleton h-4 w-full rounded mb-2"></div>
                <div className="skeleton h-4 w-5/6 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="skeleton h-8 w-24 rounded"></div>
                  <div className="skeleton h-8 w-8 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-red-400 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error loading resources</h3>
            <p className="mt-1 text-red-700">{error.message || "Unable to connect to the API. Please try again later."}</p>
          </div>
        </div>
        <div className="mt-4">
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={onRetry}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Display empty state
  if (filteredResources.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No resources found</h3>
        <p className="mt-1 text-gray-500">Try changing your filters or search for something else</p>
        <div className="mt-6">
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  }
  
  // Display results
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Resources</h2>
        <p className="text-gray-600"><span>{filteredResources.length}</span> results found</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
      
      {/* Pagination - if needed later */}
      {filteredResources.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <a href="#" className="inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</a>
            <a href="#" className="inline-flex items-center px-3 py-2 border border-gray-300 bg-primary text-sm font-medium text-white">2</a>
            <a href="#" className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</a>
            <span className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
            <a href="#" className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">8</a>
            <a href="#" className="inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
