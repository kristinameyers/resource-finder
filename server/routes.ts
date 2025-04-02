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
      const categories = req.query.categories
        ? String(req.query.categories).split(",")
        : undefined;
      const location = req.query.location
        ? String(req.query.location)
        : undefined;

      // Get filtered resources
      const resources = await storage.getResources(categories, location);

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

  const httpServer = createServer(app);

  return httpServer;
}
