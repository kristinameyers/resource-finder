import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { resourceSchema } from "@shared/schema";

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

      // Get filtered resources
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

  const httpServer = createServer(app);

  return httpServer;
}
