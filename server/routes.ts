import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { resourceSchema } from "@shared/schema";
import { searchResourcesByTaxonomy, getResourceById } from "./services/national211Service";

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

      // If useApi flag is true and we have a categoryId, use the 211 API
      if (useApi && categoryId) {
        try {
          // Get the category to find its taxonomy code
          const categories = await storage.getCategories();
          const category = categories.find(c => c.id === categoryId);
          
          console.log(`Selected category: ${categoryId}, Taxonomy Code: ${category?.taxonomyCode}`);
          console.log(`Location params: ZipCode=${zipCode}, Lat=${latitude}, Lng=${longitude}`);
          console.log(`Using 211 API: ${useApi}`);
          
          if (category && category.taxonomyCode) {
            // Use the 211 API to search by taxonomy code
            const result = await searchResourcesByTaxonomy(
              category.taxonomyCode,
              zipCode,
              latitude,
              longitude
            );
            
            console.log(`API response received with ${result.resources.length} resources`);
            
            return res.status(200).json({
              resources: result.resources,
              total: result.total,
              source: '211 API'
            });
          } else {
            console.log(`Cannot use API: Missing taxonomy code for category ${categoryId}`);
          }
        } catch (apiError) {
          console.error("Error fetching from 211 API:", apiError);
          // Continue to fallback if API fails
        }
      }

      // Fallback to local storage if not using API or if the API failed
      const resources = await storage.getResources(
        categoryId,
        subcategoryId,
        zipCode,
        latitude,
        longitude
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
      
      // If useApi=true, attempt to get the resource from the 211 API
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
      const resources = await storage.getResources(undefined, undefined, undefined, undefined, undefined, sessionId);
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
      
      await storage.removeVote(id, sessionId);
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

  const httpServer = createServer(app);

  return httpServer;
}
