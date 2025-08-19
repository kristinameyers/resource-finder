import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { resourceSchema } from "@shared/schema";
import { 
  searchResourcesByTaxonomyCode, 
  searchResourcesByKeyword, 
  searchAllResourcesByKeyword,
  getResourceById, 
  getServiceAtLocationDetails, 
  searchResources 
} from "./services/national211Service";
import { translateText, getSupportedLanguages } from "./services/translationService";

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
      const keyword = req.query.keyword ? String(req.query.keyword) : undefined;

      // Handle keyword search using 211 API
      if (useApi && keyword) {
        try {
          console.log(`Keyword search: "${keyword}"`);
          console.log(`Location params: ZipCode=${zipCode}, Lat=${latitude}, Lng=${longitude}`);
          
          const apiResult = await searchAllResourcesByKeyword(
            keyword,
            zipCode || undefined,
            latitude,
            longitude
          );

          console.log(`211 API returned ${apiResult.resources.length} total resources for keyword: ${keyword}`);
          
          // Filter for Santa Barbara County resources only
          const santaBarbaraResources = apiResult.resources.filter(resource => {
            const serviceAreas = resource.serviceAreas?.toLowerCase() || '';
            const address = resource.address?.toLowerCase() || '';
            return serviceAreas.includes('santa barbara') || address.includes('santa barbara');
          });

          console.log(`Filtered to ${santaBarbaraResources.length} Santa Barbara County resources`);
          
          return res.json({
            resources: santaBarbaraResources,
            total: santaBarbaraResources.length,
            source: '211 API'
          });
        } catch (searchError) {
          if (searchError instanceof Error && searchError.message.startsWith('RATE_LIMITED:')) {
            console.log('Rate limit detected, returning rate limit response');
            return res.status(429).json({
              error: 'rate_limited',
              message: 'API rate limit exceeded. Please wait a moment and try again.',
              retryAfter: 30,
              resources: [],
              total: 0,
              source: '211_API'
            });
          }
          console.error('Error in keyword search:', searchError);
          throw searchError;
        }
      }
      
      // If useApi flag is true and we have a categoryId, use the 211 API
      else if (useApi && categoryId) {
        try {
          console.log(`Selected category: ${categoryId}, Subcategory: ${subcategoryId}`);
          console.log(`Location params: ZipCode=${zipCode}, Lat=${latitude}, Lng=${longitude}`);
          console.log(`Using 211 API: ${useApi}`);
          
          // Use the proper taxonomy-based search with the detailed codes
          console.log(`Searching with category: ${categoryId}, subcategory: ${subcategoryId}`);
          
          // Use the searchResources function which handles taxonomy codes properly
          let apiResult;
          try {
            apiResult = await searchResources(
              categoryId,
              subcategoryId || null,
              zipCode,
              latitude,
              longitude,
              true
            );
          } catch (searchError) {
            if (searchError instanceof Error && searchError.message.startsWith('RATE_LIMITED:')) {
              console.log('Rate limit detected, returning rate limit response');
              return res.status(429).json({
                error: 'rate_limited',
                message: 'API rate limit exceeded. Please wait a moment and try again.',
                retryAfter: 30,
                resources: [],
                total: 0,
                source: '211_API'
              });
            }
            throw searchError;
          }
          
          let resources = apiResult.resources;
          
          // Filter for Santa Barbara County resources only
          resources = resources.filter(resource => {
            const serviceAreas = resource.serviceAreas?.toLowerCase() || '';
            const address = resource.address?.toLowerCase() || '';
            return serviceAreas.includes('santa barbara') || address.includes('santa barbara');
          });

          console.log(`Filtered to ${resources.length} Santa Barbara County resources`);
            
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
      const { serviceId } = req.query; // Get service ID from query params
      
      if (!id) {
        return res.status(400).json({
          message: "Resource ID is required"
        });
      }
      
      // Keep the full serviceAtLocation ID with proper format
      const serviceAtLocationId = id; // Keep the full ID as-is
      console.log(`Fetching detailed info for serviceAtLocation ID: ${serviceAtLocationId}`);
      if (serviceId) {
        console.log(`Service ID provided: ${serviceId}`);
      }
      
      // Try to get Service At Location Details first
      let detailedInfo: any = null;
      try {
        detailedInfo = await getServiceAtLocationDetails(serviceAtLocationId);
        console.log(`Service At Location Details ${detailedInfo ? 'retrieved successfully' : 'not found'}`);
      } catch (apiError) {
        console.error("Service At Location Details failed:", apiError);
        // Continue with service details fallback below
      }
      
      // Try to get detailed service information with servicePhones and serviceHoursText
      const { getServiceDetails, getPhoneNumbers } = await import('./services/national211Service');
      let serviceDetails: any = null;
      let comprehensivePhones: any[] = [];
      
      // If we have a service ID, fetch detailed service information
      if (serviceId && typeof serviceId === 'string') {
        try {
          console.log(`Fetching detailed service info with service ID: ${serviceId}`);
          serviceDetails = await getServiceDetails(serviceId);
          if (serviceDetails) {
            console.log(`Successfully retrieved service details with servicePhones and serviceHoursText`);
          }
        } catch (serviceError) {
          console.error("Error fetching service details:", serviceError);
        }
      }
      
      // Always try to get comprehensive phone numbers as fallback
      try {
        console.log(`Fetching comprehensive phone numbers for serviceAtLocationId: ${serviceAtLocationId}`);
        comprehensivePhones = await getPhoneNumbers(serviceAtLocationId);
        console.log(`Retrieved ${comprehensivePhones.length} comprehensive phone numbers`);
      } catch (phoneError) {
        console.error("Error fetching comprehensive phone numbers:", phoneError);
      }
      
      // Combine all available information
      if (detailedInfo || comprehensivePhones.length > 0 || serviceDetails) {
        const combinedDetails = {
          ...detailedInfo,
          ...serviceDetails,
          comprehensivePhones: serviceDetails?.servicePhones || comprehensivePhones.length > 0 ? (serviceDetails?.servicePhones || comprehensivePhones) : undefined
        };
        
        return res.status(200).json({
          details: combinedDetails,
          source: '211_API_Details_Enhanced'
        });
      } else {
        return res.status(404).json({
          message: "Detailed resource information not found"
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

  // Translation API endpoint
  app.post("/api/translate", async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({
          message: "Text and target language are required"
        });
      }
      
      if (!['es', 'tl'].includes(targetLanguage)) {
        return res.status(400).json({
          message: "Supported languages are: es (Spanish), tl (Tagalog)"
        });
      }
      
      const result = await translateText({
        text,
        targetLanguage: targetLanguage as 'es' | 'tl'
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Translation error:", error);
      return res.status(500).json({
        message: "Translation failed",
        error: (error as Error).message
      });
    }
  });

  // Batch translation endpoint for better performance
  app.post("/api/translate-batch", async (req: Request, res: Response) => {
    try {
      const { texts, targetLanguage } = req.body;
      
      if (!texts || !Array.isArray(texts) || !targetLanguage) {
        return res.status(400).json({
          message: "Texts array and target language are required"
        });
      }
      
      if (!['es', 'tl'].includes(targetLanguage)) {
        return res.status(400).json({
          message: "Supported languages are: es (Spanish), tl (Tagalog)"
        });
      }

      // Filter out empty texts
      const validTexts = texts.filter(text => text && text.trim() !== '');
      
      if (validTexts.length === 0) {
        return res.status(200).json({ translations: texts });
      }

      // Use the existing translateText function for each text
      // In a production app, you'd use Google Translate's batch API for better efficiency
      const translationPromises = validTexts.map(text => 
        translateText({
          text,
          targetLanguage: targetLanguage as 'es' | 'tl'
        })
      );
      
      const translationResults = await Promise.allSettled(translationPromises);
      const translations = translationResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value.translatedText || validTexts[index];
        } else {
          console.error(`Translation failed for text "${validTexts[index]}":`, result.reason);
          return validTexts[index]; // Fallback to original text
        }
      });
      
      // Map back to original array structure
      let translationIndex = 0;
      const finalResults = texts.map(text => {
        if (text && text.trim() !== '') {
          return translations[translationIndex++];
        }
        return text;
      });

      return res.status(200).json({ translations: finalResults });
    } catch (error) {
      console.error("Batch translation error:", error);
      return res.status(500).json({
        message: "Batch translation failed",
        error: (error as Error).message
      });
    }
  });

  // Get supported languages endpoint
  app.get("/api/languages", async (req: Request, res: Response) => {
    try {
      const languages = getSupportedLanguages();
      return res.status(200).json({ languages });
    } catch (error) {
      console.error("Error getting languages:", error);
      return res.status(500).json({
        message: "Error retrieving supported languages"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
