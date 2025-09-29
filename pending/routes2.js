import { Router } from 'express';
import { IStorage } from './storage';

export function createApiRoutes(storage: IStorage) {
  const router = Router();

  // Resources endpoints
  router.get('/resources', async (req, res) => {
    try {
      const { search, category } = req.query;
      let resources;

      if (search) {
        resources = await storage.searchResources(search as string);
      } else if (category) {
        resources = await storage.getResourcesByCategory(category as string);
      } else {
        resources = await storage.getResources();
      }

      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/resources/:id', async (req, res) => {
    try {
      const resource = await storage.getResource(req.params.id);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/resources', async (req, res) => {
    try {
      const resource = await storage.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Categories endpoints
  router.get('/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/categories/:id', async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/categories', async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Voting endpoints
  router.post('/votes', async (req, res) => {
    try {
      const { resourceId, vote } = req.body;
      const sessionId = req.session?.id || req.ip || 'anonymous';

      const voteRecord = await storage.createVote({
        resourceId,
        sessionId,
        vote,
      });

      res.status(201).json(voteRecord);
    } catch (error) {
      console.error('Error creating vote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/resources/:id/votes', async (req, res) => {
    try {
      const votes = await storage.getVotesForResource(req.params.id);
      const summary = {
        helpful: votes.filter(v => v.vote > 0).length,
        notHelpful: votes.filter(v => v.vote < 0).length,
        total: votes.length,
      };
      res.json(summary);
    } catch (error) {
      console.error('Error fetching votes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}