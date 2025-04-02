import { type Resource } from "@shared/schema";
import { MapPin } from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
}

// Mapping of categories to background and text colors
const categoryColorMap: Record<string, { bg: string; text: string }> = {
  health: { bg: "bg-blue-100", text: "text-blue-800" },
  education: { bg: "bg-indigo-100", text: "text-indigo-800" },
  housing: { bg: "bg-green-100", text: "text-green-800" },
  employment: { bg: "bg-purple-100", text: "text-purple-800" },
  food: { bg: "bg-yellow-100", text: "text-yellow-800" },
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  // Get color for this category, default to blue if not found
  const categoryColor = categoryColorMap[resource.category.toLowerCase()] || 
    { bg: "bg-blue-100", text: "text-blue-800" };
  
  // Default image if not provided
  const defaultImage = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-gray-200 overflow-hidden">
        <img 
          src={resource.imageUrl || defaultImage} 
          alt={resource.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // On error, revert to default image
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-2">{resource.name}</h3>
          <span className={`inline-block ${categoryColor.bg} ${categoryColor.text} text-xs px-2 py-1 rounded-full`}>
            {resource.category}
          </span>
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          {resource.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{resource.location}</span>
          </div>
          {resource.url && (
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-blue-700 font-medium text-sm"
            >
              View Details
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
