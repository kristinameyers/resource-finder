import http from 'http';
import url from 'url';
import querystring from 'querystring';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple storage implementation
class MemStorage {
  constructor() {
    this.resources = [];
    this.categories = [];
    this.votes = [];
    this.seedData();
  }

  seedData() {
    this.categories = [
      {
        id: 'cat-1',
        name: 'Housing',
        description: 'Housing assistance and shelter services',
        icon: 'housing',
        isActive: true,
      },
      {
        id: 'cat-2',
        name: 'Food',
        description: 'Food assistance and nutrition programs',
        icon: 'food',
        isActive: true,
      },
      {
        id: 'cat-3',
        name: 'Healthcare',
        description: 'Medical and health services',
        icon: 'healthcare',
        isActive: true,
      },
    ];

    this.resources = [
      {
        id: 'res-1',
        name: 'Community Food Bank',
        description: 'Provides free groceries and meals to families in need',
        category: 'Food',
        location: '123 Main St, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-0123',
        website: 'https://example.com',
        hours: 'Monday-Friday 9AM-5PM',
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'res-2',
        name: 'Homeless Shelter Services',
        description: 'Emergency shelter and transitional housing support',
        category: 'Housing',
        location: '456 Oak Ave, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-0456',
        website: 'https://example.org',
        hours: '24/7',
        isActive: true,
        createdAt: new Date(),
      },
    ];
  }

  async getResources() {
    return this.resources.filter(r => r.isActive);
  }

  async getResource(id) {
    return this.resources.find(r => r.id === id && r.isActive) || null;
  }

  async createResource(resource) {
    const newResource = {
      id: `res-${Date.now()}`,
      ...resource,
      createdAt: new Date(),
    };
    this.resources.push(newResource);
    return newResource;
  }

  async searchResources(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.resources.filter(r => 
      r.isActive && (
        r.name.toLowerCase().includes(lowercaseQuery) ||
        (r.description && r.description.toLowerCase().includes(lowercaseQuery)) ||
        r.category.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  async getResourcesByCategory(category) {
    return this.resources.filter(r => r.isActive && r.category === category);
  }

  async getCategories() {
    return this.categories.filter(c => c.isActive);
  }

  async getVotesForResource(resourceId) {
    return this.votes.filter(v => v.resourceId === resourceId);
  }

  async createVote(vote) {
    const newVote = {
      id: `vote-${Date.now()}`,
      ...vote,
      createdAt: new Date(),
    };
    this.votes.push(newVote);
    return newVote;
  }
}

// Simple CORS middleware
function simpleCors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
}

// Initialize storage
const storage = new MemStorage();
const PORT = process.env.PORT || 5000;

// Helper functions
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function sendError(res, message, statusCode = 500) {
  sendJSON(res, { error: message }, statusCode);
}

// Parse request body for POST requests
function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        resolve({});
      }
    });
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  try {
    // Root endpoint - serve HTML
    if (pathname === '/' && req.method === 'GET') {
      const htmlPath = path.join(__dirname, '..', 'client', 'index.html');
      try {
        const html = fs.readFileSync(htmlPath, 'utf-8');
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
        });
        return res.end(html);
      } catch (error) {
        // Fallback to API info if HTML not found
        return sendJSON(res, {
          message: 'Resource Finder API',
          version: '1.0.0',
          environment: 'development',
          endpoints: {
            resources: '/api/resources',
            categories: '/api/categories',
            votes: '/api/votes',
            health: '/api/health',
          },
        });
      }
    }

    // Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
    }

    // Resources endpoints
    if (pathname === '/api/resources' && req.method === 'GET') {
      const { search, category } = query;
      let resources;

      if (search) {
        resources = await storage.searchResources(search);
      } else if (category) {
        resources = await storage.getResourcesByCategory(category);
      } else {
        resources = await storage.getResources();
      }

      return sendJSON(res, resources);
    }

    if (pathname.startsWith('/api/resources/') && req.method === 'GET') {
      const id = pathname.split('/')[3];
      if (pathname.endsWith('/votes')) {
        const resourceId = pathname.split('/')[3];
        const votes = await storage.getVotesForResource(resourceId);
        const summary = {
          helpful: votes.filter(v => v.vote > 0).length,
          notHelpful: votes.filter(v => v.vote < 0).length,
          total: votes.length,
        };
        return sendJSON(res, summary);
      } else {
        const resource = await storage.getResource(id);
        if (!resource) {
          return sendError(res, 'Resource not found', 404);
        }
        return sendJSON(res, resource);
      }
    }

    if (pathname === '/api/resources' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const resource = await storage.createResource(body);
      return sendJSON(res, resource, 201);
    }

    // Categories endpoints
    if (pathname === '/api/categories' && req.method === 'GET') {
      const categories = await storage.getCategories();
      return sendJSON(res, categories);
    }

    // Voting endpoints
    if (pathname === '/api/votes' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const { resourceId, vote } = body;
      const sessionId = req.connection.remoteAddress || 'anonymous';

      const voteRecord = await storage.createVote({
        resourceId,
        sessionId,
        vote,
      });

      return sendJSON(res, voteRecord, 201);
    }

    // 404 for unknown routes
    sendError(res, 'Not found', 404);

  } catch (error) {
    console.error('Server error:', error);
    sendError(res, 'Internal server error', 500);
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});