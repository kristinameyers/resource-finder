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
    this.subcategories = {};
    this.votes = [];
    this.seedData();
  }

  seedData() {
    this.categories = [
      {
        id: 'housing',
        name: 'Housing',
        description: 'Housing assistance and shelter services',
        icon: 'housing',
        isActive: true,
      },
      {
        id: 'food',
        name: 'Food',
        description: 'Food assistance and nutrition programs',
        icon: 'food',
        isActive: true,
      },
      {
        id: 'healthcare',
        name: 'Healthcare',
        description: 'Medical and health services',
        icon: 'healthcare',
        isActive: true,
      },
      {
        id: 'mental-wellness',
        name: 'Mental Wellness',
        description: 'Mental health and counseling services',
        icon: 'mental-wellness',
        isActive: true,
      },
      {
        id: 'substance-use',
        name: 'Substance Use',
        description: 'Substance abuse treatment and support',
        icon: 'substance-use',
        isActive: true,
      },
      {
        id: 'children-family',
        name: 'Children & Family',
        description: 'Services for children and families',
        icon: 'children-family',
        isActive: true,
      },
      {
        id: 'young-adults',
        name: 'Young Adults',
        description: 'Programs and resources for young adults',
        icon: 'young-adults',
        isActive: true,
      },
      {
        id: 'legal-assistance',
        name: 'Legal Assistance',
        description: 'Legal aid and court services',
        icon: 'legal-assistance',
        isActive: true,
      },
      {
        id: 'utilities',
        name: 'Utilities',
        description: 'Utility assistance programs',
        icon: 'utilities',
        isActive: true,
      },
      {
        id: 'transportation',
        name: 'Transportation',
        description: 'Transportation services and assistance',
        icon: 'transportation',
        isActive: true,
      },
      {
        id: 'hygiene-household',
        name: 'Hygiene Household',
        description: 'Hygiene and household items assistance',
        icon: 'hygiene-household',
        isActive: true,
      },
      {
        id: 'finance-employment',
        name: 'Finance & Employment',
        description: 'Financial assistance and job resources',
        icon: 'finance-employment',
        isActive: true,
      },
      {
        id: 'education',
        name: 'Education',
        description: 'Educational programs and resources',
        icon: 'education',
        isActive: true,
      }
    ];

    // Add subcategories for each main category
    this.subcategories = {
      'housing': [
        { id: 'housing', name: 'Housing', categoryId: 'housing' },
        { id: 'homeless-shelters', name: 'Homeless Shelters', categoryId: 'housing' },
        { id: 'low-income-rental', name: 'Low Income Rental Housing', categoryId: 'housing' },
        { id: 'section-8', name: 'Section 8 Voucher / Housing Authority', categoryId: 'housing' },
        { id: 'temporary-mailing', name: 'Temporary Mailing Address', categoryId: 'housing' },
        { id: 'bathing-facilities', name: 'Bathing Facilities', categoryId: 'housing' },
        { id: 'home-maintenance', name: 'Home Maintenance & Repair', categoryId: 'housing' },
        { id: 'furniture', name: 'Furniture', categoryId: 'housing' }
      ],
      'food': [
        { id: 'food', name: 'Food', categoryId: 'food' },
        { id: 'food-pantries', name: 'Food Pantries', categoryId: 'food' },
        { id: 'hot-meals', name: 'Hot Meals', categoryId: 'food' },
        { id: 'calfresh', name: 'CalFresh (Food Stamps)', categoryId: 'food' },
        { id: 'wic', name: 'Women, Infants, & Children (WIC)', categoryId: 'food' },
        { id: 'senior-nutrition', name: 'Senior Nutrition Programs', categoryId: 'food' },
        { id: 'school-meals', name: 'School Meal Programs', categoryId: 'food' },
        { id: 'emergency-food', name: 'Emergency Food Assistance', categoryId: 'food' }
      ],
      'healthcare': [
        { id: 'healthcare', name: 'Health Care', categoryId: 'healthcare' },
        { id: 'clinics', name: 'Clinics & Urgent Care', categoryId: 'healthcare' },
        { id: 'hospitals', name: 'Hospitals', categoryId: 'healthcare' },
        { id: 'medicaid', name: 'Medicaid', categoryId: 'healthcare' },
        { id: 'medicare', name: 'Medicare', categoryId: 'healthcare' },
        { id: 'prescription', name: 'Prescription Drug Assistance', categoryId: 'healthcare' },
        { id: 'immunizations', name: 'Immunizations', categoryId: 'healthcare' },
        { id: 'reproductive', name: 'Reproductive Health', categoryId: 'healthcare' }
      ],
      'mental-wellness': [
        { id: 'mental-wellness', name: 'Mental Wellness', categoryId: 'mental-wellness' },
        { id: 'general-counseling', name: 'General Counseling', categoryId: 'mental-wellness' },
        { id: 'crisis-hotlines', name: 'Crisis Intervention Hotlines', categoryId: 'mental-wellness' },
        { id: 'bereavement', name: 'Bereavement and Grief Counseling', categoryId: 'mental-wellness' },
        { id: 'marriage-counseling', name: 'Marriage Counseling', categoryId: 'mental-wellness' },
        { id: 'suicide-counseling', name: 'Suicide Counseling', categoryId: 'mental-wellness' },
        { id: 'youth-counseling', name: 'Adolescent/Youth Counseling', categoryId: 'mental-wellness' }
      ],
      'substance-use': [
        { id: 'substance-use', name: 'Substance Use', categoryId: 'substance-use' },
        { id: 'alcohol-detox', name: 'Alcohol Detoxification', categoryId: 'substance-use' },
        { id: 'drug-detox', name: 'Drug Detoxification', categoryId: 'substance-use' },
        { id: 'alcoholism-counseling', name: 'Alcoholism Counseling', categoryId: 'substance-use' },
        { id: 'drug-counseling', name: 'Drug Abuse Counseling', categoryId: 'substance-use' },
        { id: 'sober-living', name: 'Sober Living Homes', categoryId: 'substance-use' },
        { id: 'support-groups', name: 'Support Groups', categoryId: 'substance-use' }
      ],
      'children-family': [
        { id: 'children-family', name: 'Children & Family', categoryId: 'children-family' },
        { id: 'child-care', name: 'Child Care Provider Referrals', categoryId: 'children-family' },
        { id: 'head-start', name: 'Head Start', categoryId: 'children-family' },
        { id: 'child-abuse-prevention', name: 'Child Abuse Prevention', categoryId: 'children-family' },
        { id: 'child-custody', name: 'Child Custody', categoryId: 'children-family' },
        { id: 'child-support', name: 'Child Support', categoryId: 'children-family' },
        { id: 'parent-programs', name: 'Expecting & New Parent Programs', categoryId: 'children-family' },
        { id: 'recreation', name: 'Recreation', categoryId: 'children-family' }
      ],
      'young-adults': [
        { id: 'young-adults', name: 'Young Adults', categoryId: 'young-adults' },
        { id: 'dropout-prevention', name: 'Drop Out Prevention', categoryId: 'young-adults' },
        { id: 'gang-prevention', name: 'Gang Prevention', categoryId: 'young-adults' },
        { id: 'violence-prevention', name: 'Youth Violence Prevention', categoryId: 'young-adults' },
        { id: 'mentoring', name: 'Child & Youth Mentoring Programs', categoryId: 'young-adults' },
        { id: 'youth-development', name: 'Youth Development', categoryId: 'young-adults' },
        { id: 'recreational-clubs', name: 'Recreational Clubs', categoryId: 'young-adults' }
      ],
      'legal-assistance': [
        { id: 'legal-assistance', name: 'Legal Assistance', categoryId: 'legal-assistance' },
        { id: 'general-legal', name: 'General Legal Aid', categoryId: 'legal-assistance' },
        { id: 'immigration-legal', name: 'Immigration Legal Services', categoryId: 'legal-assistance' },
        { id: 'birth-certificates', name: 'Birth Certificates', categoryId: 'legal-assistance' },
        { id: 'identification', name: 'Identification Cards', categoryId: 'legal-assistance' },
        { id: 'voter-registration', name: 'Voter Registration', categoryId: 'legal-assistance' },
        { id: 'crime-victim', name: 'Crime Victim Assistance', categoryId: 'legal-assistance' },
        { id: 'restraining-orders', name: 'Restraining Orders', categoryId: 'legal-assistance' }
      ],
      'utilities': [
        { id: 'utilities', name: 'Utilities', categoryId: 'utilities' },
        { id: 'electric-payment', name: 'Electric Service Payment Assistance', categoryId: 'utilities' },
        { id: 'gas-payment', name: 'Gas Service Payment Assistance', categoryId: 'utilities' },
        { id: 'utility-payment', name: 'Utility Payment Assistance', categoryId: 'utilities' },
        { id: 'internet-provider', name: 'Internet Provider', categoryId: 'utilities' },
        { id: 'energy-efficient', name: 'Energy Efficient Home Improvement', categoryId: 'utilities' }
      ],
      'transportation': [
        { id: 'transportation', name: 'Transportation', categoryId: 'transportation' },
        { id: 'bus-services', name: 'Bus Services', categoryId: 'transportation' },
        { id: 'rail-transportation', name: 'Rail Transportation', categoryId: 'transportation' },
        { id: 'disability-transport', name: 'Disability Related Transportation', categoryId: 'transportation' },
        { id: 'medical-transport', name: 'Medical Transportation', categoryId: 'transportation' },
        { id: 'senior-ride', name: 'Senior Ride Programs', categoryId: 'transportation' },
        { id: 'paratransit', name: 'Paratransit/Community Ride Programs', categoryId: 'transportation' }
      ],
      'hygiene-household': [
        { id: 'hygiene-household', name: 'Hygiene & Household', categoryId: 'hygiene-household' },
        { id: 'disaster-supplies', name: 'Disaster Related Supplies', categoryId: 'hygiene-household' },
        { id: 'grooming-supplies', name: 'Grooming Supplies', categoryId: 'hygiene-household' },
        { id: 'hazardous-materials', name: 'Household Hazardous Materials Info', categoryId: 'hygiene-household' },
        { id: 'animal-control', name: 'Animal Control', categoryId: 'hygiene-household' }
      ],
      'finance-employment': [
        { id: 'finance-employment', name: 'Finance & Employment', categoryId: 'finance-employment' },
        { id: 'job-assistance', name: 'Job Assistance Centers', categoryId: 'finance-employment' },
        { id: 'vocational-rehab', name: 'Vocational Rehabilitation', categoryId: 'finance-employment' },
        { id: 'calworks', name: 'CalWorks', categoryId: 'finance-employment' },
        { id: 'general-relief', name: 'General Relief', categoryId: 'finance-employment' },
        { id: 'veteran-benefits', name: 'Veteran Benefits Assistance', categoryId: 'finance-employment' },
        { id: 'credit-counseling', name: 'Credit Counseling', categoryId: 'finance-employment' },
        { id: 'vita-programs', name: 'VITA Tax Programs', categoryId: 'finance-employment' }
      ],
      'education': [
        { id: 'education', name: 'Education', categoryId: 'education' },
        { id: 'computer-literacy', name: 'Computer Literacy Training', categoryId: 'education' },
        { id: 'financial-literacy', name: 'Financial Literacy', categoryId: 'education' },
        { id: 'esl', name: 'English as a Second Language', categoryId: 'education' },
        { id: 'technical-schools', name: 'Technical/Trade Schools', categoryId: 'education' },
        { id: 'school-readiness', name: 'School Readiness Programs', categoryId: 'education' },
        { id: 'financial-aid', name: 'Student Financial Aid', categoryId: 'education' },
        { id: 'tutoring', name: 'Tutoring', categoryId: 'education' }
      ]
    };

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

  async getSubcategories(categoryId) {
    return this.subcategories[categoryId] || [];
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

    // Subcategories endpoint
    if (pathname === '/api/subcategories' && req.method === 'GET') {
      const { categoryId } = query;
      if (!categoryId) {
        return sendError(res, 'categoryId parameter required', 400);
      }
      const subcategories = await storage.getSubcategories(categoryId);
      return sendJSON(res, subcategories);
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