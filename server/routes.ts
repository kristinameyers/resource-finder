import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { resourceSchema } from "@shared/schema";
import { searchResourcesByTaxonomyCode, searchResourcesByKeyword, getResourceById, getServiceAtLocationDetails, searchResources } from "./services/national211Service";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // API endpoint to get resources with optional filtering
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      // Parse query parameters
      const categoryId = req.query.categoryId 
        ? String(req.query.categoryId) 
        : undefined;
      
      const subcategoryId = req.query.subcategoryId 
        ? String(req.query.subcategoryId) 
        : undefined;
        
      const zipCode = req.query.zipCode
        ? String(req.query.zipCode)
        : undefined;
        
      const latitude = req.query.latitude
        ? parseFloat(String(req.query.latitude))
        : undefined;
        
      const longitude = req.query.longitude
        ? parseFloat(String(req.query.longitude))
        : undefined;
        
      const useApi = req.query.useApi === 'true';
      const sortBy = req.query.sortBy as 'relevance' | 'distance' | 'name' || 'relevance';

      // If useApi flag is true and we have a categoryId, use the 211 API
      if (useApi && categoryId) {
        try {
          console.log(`Selected category: ${categoryId}, Subcategory: ${subcategoryId}`);
          console.log(`Location params: ZipCode=${zipCode}, Lat=${latitude}, Lng=${longitude}`);
          console.log(`Using 211 API: ${useApi}`);
          
          // Use the proper taxonomy-based search with the detailed codes
          console.log(`Searching with category: ${categoryId}, subcategory: ${subcategoryId}`);
          
          // Use the searchResources function which handles taxonomy codes properly
          const apiResult = await searchResources(
            categoryId,
            subcategoryId || null,
            zipCode,
            latitude,
            longitude,
            true
          );
          
          let resources = apiResult.resources;
            
            // Only calculate distances when user has provided a location
            if (zipCode && resources.length > 0) {
              const { calculateDistanceFromZipCodes } = await import('./data/zipCodes');
              
              // Add distance to each resource
              resources = resources.map(resource => {
                let distanceMiles: number | undefined = undefined;
                
                // Calculate distance if resource has a zip code
                if (resource.zipCode) {
                  const distance = calculateDistanceFromZipCodes(zipCode, resource.zipCode);
                  if (distance !== null) {
                    distanceMiles = distance;
                    // console.log(`Distance calculated: ${zipCode} to ${resource.zipCode} = ${distance} miles`);
                  } else {
                    console.log(`Failed to calculate distance: ${zipCode} to ${resource.zipCode} (coordinates not found)`);
                  }
                }
                
                return { ...resource, distanceMiles };
              });
              
              // Sort by distance by default when user provides location, otherwise by relevance
              if (zipCode && resources.some(r => r.distanceMiles !== undefined)) {
                // Auto-sort by distance when location is provided
                resources.sort((a, b) => {
                  if (a.distanceMiles === undefined && b.distanceMiles === undefined) return 0;
                  if (a.distanceMiles === undefined) return 1;
                  if (b.distanceMiles === undefined) return -1;
                  return a.distanceMiles - b.distanceMiles;
                });
                console.log(`Auto-sorted ${resources.length} resources by distance (closest first)`);
              } else if (sortBy === 'distance') {
                resources.sort((a, b) => {
                  if (a.distanceMiles === undefined && b.distanceMiles === undefined) return 0;
                  if (a.distanceMiles === undefined) return 1;
                  if (b.distanceMiles === undefined) return -1;
                  return a.distanceMiles - b.distanceMiles;
                });
              } else if (sortBy === 'name') {
                resources.sort((a, b) => a.name.localeCompare(b.name));
              }
              

          }
          
          console.log(`211 API returned ${resources.length} total resources for category: ${categoryId}, subcategory: ${subcategoryId}`);
          
          return res.status(200).json({
            resources: resources,
            total: resources.length,
            source: '211_API'
          });
        } catch (apiError) {
          console.error("Error fetching from 211 API:", apiError);
          // Continue to fallback if API fails
        }
      }

      // Fallback to local storage if not using API or if the API failed
      const sessionId = req.headers['x-session-id'] as string || 'anonymous';
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
      
      const resources = await storage.getResources(
        categoryId,
        subcategoryId,
        zipCode,
        latitude,
        longitude,
        sessionId,
        ipAddress,
        sortBy
      );

      return res.status(200).json({
        resources,
        total: resources.length,
        source: 'local'
      });
    } catch (error) {
      console.error("Error fetching resources:", error);
      return res.status(500).json({
        message: "Error fetching resources",
        error: (error as Error).message,
      });
    }
  });

  // API endpoint to get available categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      return res.status(200).json({
        categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({
        message: "Error fetching categories",
        error: (error as Error).message,
      });
    }
  });
  
  // API endpoint to get subcategories for a specific category
  app.get("/api/subcategories", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId;
      
      if (!categoryId) {
        return res.status(400).json({
          message: "Category ID is required",
        });
      }
      
      const subcategories = await storage.getSubcategories(String(categoryId));
      
      return res.status(200).json({
        subcategories,
      });
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return res.status(500).json({
        message: "Error fetching subcategories",
        error: (error as Error).message,
      });
    }
  });

  // API endpoint to get available locations
  app.get("/api/locations", async (_req: Request, res: Response) => {
    try {
      const locations = await storage.getLocations();
      return res.status(200).json({
        locations,
      });
    } catch (error) {
      console.error("Error fetching locations:", error);
      return res.status(500).json({
        message: "Error fetching locations",
        error: (error as Error).message,
      });
    }
  });
  
  // API endpoint to get location by zip code
  app.get("/api/location/zipcode/:zipCode", async (req: Request, res: Response) => {
    try {
      const { zipCode } = req.params;
      
      if (!zipCode) {
        return res.status(400).json({
          message: "Zip code is required",
        });
      }
      
      const location = await storage.getLocationByZipCode(zipCode);
      
      if (!location) {
        return res.status(404).json({
          message: "Location not found",
        });
      }
      
      return res.status(200).json(location);
    } catch (error) {
      console.error("Error fetching location by zip code:", error);
      return res.status(500).json({
        message: "Error fetching location by zip code",
        error: (error as Error).message,
      });
    }
  });
  
  // API endpoint to get location by coordinates
  app.get("/api/location/coordinates", async (req: Request, res: Response) => {
    try {
      const latitude = req.query.latitude;
      const longitude = req.query.longitude;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          message: "Latitude and longitude are required",
        });
      }
      
      const location = await storage.getLocationByCoordinates(
        parseFloat(String(latitude)),
        parseFloat(String(longitude))
      );
      
      if (!location) {
        return res.status(404).json({
          message: "Location not found",
        });
      }
      
      return res.status(200).json(location);
    } catch (error) {
      console.error("Error fetching location by coordinates:", error);
      return res.status(500).json({
        message: "Error fetching location by coordinates",
        error: (error as Error).message,
      });
    }
  });
  
  // API endpoint to get detailed resource information using Service At Location Details
  app.get("/api/resources/:id/details", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          message: "Resource ID is required"
        });
      }
      
      // Extract serviceAtLocation ID from composite ID
      const serviceAtLocationId = id.replace('211santaba-', '');
      console.log(`Fetching detailed info for serviceAtLocation ID: ${serviceAtLocationId}`);
      
      try {
        const detailedInfo = await getServiceAtLocationDetails(serviceAtLocationId);
        
        if (detailedInfo) {
          return res.status(200).json({
            details: detailedInfo,
            source: '211_API_Details'
          });
        } else {
          return res.status(404).json({
            message: "Detailed resource information not found"
          });
        }
      } catch (apiError) {
        console.error("Error fetching detailed resource info:", apiError);
        return res.status(500).json({
          message: "Error fetching detailed resource information",
          error: (apiError as Error).message
        });
      }
    } catch (error) {
      console.error("Error processing detailed resource request:", error);
      return res.status(500).json({
        message: "Error processing request",
        error: (error as Error).message
      });
    }
  });

  // API endpoint to get a specific resource by ID
  app.get("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const useApi = req.query.useApi === 'true';
      
      if (!id) {
        return res.status(400).json({
          message: "Resource ID is required"
        });
      }
      
      // For 211 API resources, try to get detailed information
      if (useApi && id.includes('211santaba')) {
        console.log(`211 API resource ${id} requested - fetching detailed info`);
        try {
          const resource = await getResourceById(id);
          if (resource) {
            return res.status(200).json(resource);
          }
        } catch (apiError) {
          console.error("Error fetching detailed 211 resource:", apiError);
          // Fall back to local storage message
        }
        
        // Fallback: Return a message indicating this should be handled client-side
        return res.status(200).json({
          message: "Resource should be available from recent search results",
          useLocalStorage: true,
          id
        });
      }
      
      // For other resources, try the 211 API if enabled
      if (useApi) {
        try {
          const resource = await getResourceById(id);
          if (resource) {
            return res.status(200).json({
              resource,
              source: '211 API'
            });
          }
          // If not found in API, continue to fallback
        } catch (apiError) {
          console.error("Error fetching resource from 211 API:", apiError);
          // Continue to fallback if API fails
        }
      }
      
      // Fallback to local storage
      const sessionId = req.headers['x-session-id'] as string || 'anonymous';
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
      const resources = await storage.getResources(undefined, undefined, undefined, undefined, undefined, sessionId, ipAddress);
      const resource = resources.find(r => r.id === id);
      
      if (!resource) {
        return res.status(404).json({
          message: "Resource not found"
        });
      }
      
      return res.status(200).json({
        resource,
        source: 'local'
      });
    } catch (error) {
      console.error("Error fetching resource by ID:", error);
      return res.status(500).json({
        message: "Error fetching resource",
        error: (error as Error).message,
      });
    }
  });

  // Rating routes
  app.post("/api/resources/:id/vote", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { vote } = req.body; // 'up' or 'down'
      const sessionId = req.headers['x-session-id'] as string || 'anonymous';
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
      
      if (!vote || (vote !== 'up' && vote !== 'down')) {
        return res.status(400).json({ error: 'Vote must be "up" or "down"' });
      }
      
      await storage.submitVote(id, sessionId, ipAddress, vote);
      const ratings = await storage.getRatings(id);
      
      res.json({ 
        thumbsUp: ratings.thumbsUp, 
        thumbsDown: ratings.thumbsDown,
        userVote: vote
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
      res.status(500).json({ error: "Failed to submit vote" });
    }
  });

  app.delete("/api/resources/:id/vote", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const sessionId = req.headers['x-session-id'] as string || 'anonymous';
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
      
      await storage.removeVote(id, sessionId, ipAddress);
      const ratings = await storage.getRatings(id);
      
      res.json({ 
        thumbsUp: ratings.thumbsUp, 
        thumbsDown: ratings.thumbsDown,
        userVote: null
      });
    } catch (error) {
      console.error("Error removing vote:", error);
      res.status(500).json({ error: "Failed to remove vote" });
    }
  });

  // Admin endpoint to view vote data (for debugging/monitoring)
  app.get("/api/admin/votes", async (req: Request, res: Response) => {
    try {
      const { resourceId } = req.query;
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      
      const votesRef = collection(db, 'votes');
      let votesQuery;
      
      if (resourceId && typeof resourceId === 'string') {
        votesQuery = query(votesRef, where('resourceId', '==', resourceId));
      } else {
        votesQuery = votesRef;
      }
      
      const snapshot = await getDocs(votesQuery);
      const votes: any[] = [];
      
      snapshot.forEach((doc) => {
        votes.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
        });
      });
      
      res.json({
        totalVotes: votes.length,
        votes: votes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      });
    } catch (error) {
      console.error("Error fetching votes:", error);
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
