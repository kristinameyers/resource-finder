/**
 * API utility functions for mobile.
 * Use these for fetching data from your backend/service.
 */

export interface Resource {
  id: string;
  name: string;
  // Add more fields as needed...
}

/**
 * An example function to get a resource by ID from your API.
 * @param id
 * @returns Promise<Resource>
 */
export async function fetchResourceById(id: string): Promise<Resource> {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/resources/${id}`);
  if (!response.ok) throw new Error("Failed to fetch resource");
  return await response.json();
}

/**
 * Example function to fetch all resources.
 */
export async function fetchAllResources(): Promise<Resource[]> {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/resources`);
  if (!response.ok) throw new Error("Failed to fetch resources");
  return await response.json();
}
