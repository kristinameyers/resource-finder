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
        keywords: ['housing', 'shelter', 'homeless', 'rent assistance', 'temporary housing'],
        taxonomyCode: 'BH',
        isActive: true,
      },
      {
        id: 'food',
        name: 'Food',
        description: 'Food assistance and nutrition programs',
        icon: 'food',
        keywords: ['food', 'meals', 'food pantry', 'food stamps', 'nutrition', 'calfresh', 'wic'],
        taxonomyCode: 'BD-5000',
        isActive: true,
      },
      {
        id: 'healthcare',
        name: 'Healthcare',
        description: 'Medical and health services',
        icon: 'healthcare',
        keywords: ['healthcare', 'medical', 'clinic', 'hospital', 'health insurance', 'medicaid', 'medicare'],
        taxonomyCode: 'LV',
        isActive: true,
      },
      {
        id: 'mental-wellness',
        name: 'Mental Wellness',
        description: 'Mental health and counseling services',
        icon: 'mental-wellness',
        keywords: ['mental health', 'counseling', 'therapy', 'crisis', 'depression', 'anxiety', 'psychiatric'],
        taxonomyCode: 'RF',
        isActive: true,
      },
      {
        id: 'substance-use',
        name: 'Substance Use',
        description: 'Substance abuse treatment and support',
        icon: 'substance-use',
        keywords: ['substance abuse', 'addiction', 'alcohol', 'drugs', 'detox', 'recovery', 'rehabilitation'],
        taxonomyCode: 'RX',
        isActive: true,
      },
      {
        id: 'children-family',
        name: 'Children & Family',
        description: 'Services for children and families',
        icon: 'children-family',
        keywords: ['children', 'family', 'childcare', 'parenting', 'child support', 'head start', 'family services'],
        taxonomyCode: 'PH',
        isActive: true,
      },
      {
        id: 'young-adults',
        name: 'Young Adults',
        description: 'Programs and resources for young adults',
        icon: 'young-adults',
        keywords: ['youth', 'young adults', 'teens', 'mentoring', 'youth development', 'gang prevention'],
        taxonomyCode: 'PS-9800',
        isActive: true,
      },
      {
        id: 'legal-assistance',
        name: 'Legal Assistance',
        description: 'Legal aid and court services',
        icon: 'legal-assistance',
        keywords: ['legal', 'lawyer', 'attorney', 'court', 'immigration', 'civil rights', 'legal aid'],
        taxonomyCode: 'FT',
        isActive: true,
      },
      {
        id: 'utilities',
        name: 'Utilities',
        description: 'Utility assistance programs',
        icon: 'utilities',
        keywords: ['utilities', 'electric', 'gas', 'water', 'utility assistance', 'energy', 'internet'],
        taxonomyCode: 'BV',
        isActive: true,
      },
      {
        id: 'transportation',
        name: 'Transportation',
        description: 'Transportation services and assistance',
        icon: 'transportation',
        keywords: ['transportation', 'bus', 'transit', 'medical transport', 'paratransit', 'senior ride'],
        taxonomyCode: 'BT',
        isActive: true,
      },
      {
        id: 'hygiene-household',
        name: 'Hygiene Household',
        description: 'Hygiene and household items assistance',
        icon: 'hygiene-household',
        keywords: ['hygiene', 'household', 'grooming', 'disaster supplies', 'cleaning supplies'],
        taxonomyCode: 'BM',
        isActive: true,
      },
      {
        id: 'finance-employment',
        name: 'Finance & Employment',
        description: 'Financial assistance and job resources',
        icon: 'finance-employment',
        keywords: ['employment', 'jobs', 'finance', 'vocational', 'career', 'credit counseling', 'benefits'],
        taxonomyCode: 'ND',
        isActive: true,
      },
      {
        id: 'education',
        name: 'Education',
        description: 'Educational programs and resources',
        icon: 'education',
        keywords: ['education', 'school', 'tutoring', 'ESL', 'literacy', 'GED', 'technical training'],
        taxonomyCode: 'HD-1800.8000',
        isActive: true,
      }
    ];

    // Add subcategories for each main category
    this.subcategories = {
      'housing': [
        { id: 'housing', name: 'Housing', categoryId: 'housing', taxonomyCode: 'BH' },
        { id: 'homeless-shelters', name: 'Homeless Shelters', categoryId: 'housing', taxonomyCode: 'BH-1800.8500' },
        { id: 'low-income-rental', name: 'Low Income Rental Housing', categoryId: 'housing', taxonomyCode: 'BH-1800.8500-450' },
        { id: 'section-8', name: 'Section 8 Voucher / Housing Authority', categoryId: 'housing', taxonomyCode: 'BH-8500.8000-780' },
        { id: 'temporary-mailing', name: 'Temporary Mailing Address', categoryId: 'housing', taxonomyCode: 'TI-3800.8500' },
        { id: 'bathing-facilities', name: 'Bathing Facilities', categoryId: 'housing', taxonomyCode: 'PH-1900.0500' },
        { id: 'home-maintenance', name: 'Home Maintenance & Repair', categoryId: 'housing', taxonomyCode: 'BH-3800' },
        { id: 'furniture', name: 'Furniture', categoryId: 'housing', taxonomyCode: 'BM-3000.2500' }
      ],
      'food': [
        { id: 'food', name: 'Food', categoryId: 'food', taxonomyCode: 'BD-5000' },
        { id: 'food-pantries', name: 'Food Pantries', categoryId: 'food', taxonomyCode: 'BD-1800.2000' },
        { id: 'hot-meals', name: 'Hot Meals', categoryId: 'food', taxonomyCode: 'BD-5000' },
        { id: 'calfresh', name: 'CalFresh (Food Stamps)', categoryId: 'food', taxonomyCode: 'NL-6000.2000' },
        { id: 'wic', name: 'Women, Infants, & Children (WIC)', categoryId: 'food', taxonomyCode: 'NL-6000.9500' },
        { id: 'senior-nutrition', name: 'Senior Nutrition Programs', categoryId: 'food', taxonomyCode: 'BD-5000.8000' },
        { id: 'school-meals', name: 'School Meal Programs', categoryId: 'food', taxonomyCode: 'BD-1800.7500' },
        { id: 'emergency-food', name: 'Emergency Food Assistance', categoryId: 'food', taxonomyCode: 'BD-1800.2000' }
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
        services: ['food pantry', 'emergency food', 'nutrition assistance'],
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
        services: ['emergency shelter', 'transitional housing', 'case management'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'res-3',
        name: 'Meals on Wheels',
        description: 'Home-delivered meals for seniors and disabled individuals',
        category: 'Food',
        location: '789 State St, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-0789',
        hours: 'Monday-Friday 8AM-4PM',
        services: ['meal delivery', 'senior nutrition', 'special diet meals'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'res-4',
        name: 'Section 8 Housing Authority',
        description: 'Housing vouchers and rental assistance programs',
        category: 'Housing',
        location: '321 Garden St, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-0321',
        hours: 'Monday-Friday 8:30AM-5PM',
        services: ['section 8 vouchers', 'rental assistance', 'housing placement'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'res-5',
        name: 'Legal Aid Foundation',
        description: 'Free legal services for low-income individuals',
        category: 'Legal',
        location: '567 Chapala St, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-0567',
        hours: 'Monday-Friday 9AM-5PM',
        services: ['legal advice', 'court representation', 'immigration services'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'res-6',
        name: 'Youth Employment Center',
        description: 'Job training and placement services for young adults',
        category: 'Young Adults',
        location: '890 Milpas St, Santa Barbara, CA',
        zipCode: '93103',
        phone: '(805) 555-0890',
        hours: 'Monday-Friday 9AM-6PM',
        services: ['job training', 'career counseling', 'youth mentoring'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'res-7',
        name: 'CalFresh Enrollment Center',
        description: 'Food stamps and CalFresh application assistance',
        category: 'Food',
        location: '234 Carrillo St, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-0234',
        hours: 'Monday-Friday 8AM-5PM',
        services: ['CalFresh enrollment', 'food stamps', 'WIC services'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'res-8',
        name: 'Mental Health Crisis Line',
        description: '24/7 crisis counseling and mental health support',
        category: 'Mental Wellness',
        location: '456 Anacapa St, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-HELP',
        hours: '24/7',
        services: ['crisis counseling', 'suicide prevention', 'mental health referrals'],
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
      const { search, category, keyword, taxonomyCode } = query;
      let resources = await storage.getResources();

      // Apply keyword search (from category click)
      if (keyword) {
        const keywords = keyword.toLowerCase().split(' ').filter(k => k.length > 0);
        resources = resources.filter(r => {
          const resourceText = `${r.name} ${r.description} ${r.category} ${r.services ? r.services.join(' ') : ''}`.toLowerCase();
          // Check if ANY keyword matches
          return keywords.some(kw => resourceText.includes(kw));
        });
      }

      // Apply taxonomy code filter (from subcategory)
      if (taxonomyCode) {
        const categories = await storage.getCategories();
        resources = resources.filter(r => {
          const categoryData = categories.find(c => c.name === r.category);
          return categoryData && categoryData.taxonomyCode && 
                 (categoryData.taxonomyCode === taxonomyCode || 
                  taxonomyCode.startsWith(categoryData.taxonomyCode));
        });
      }

      // Apply regular search
      if (search) {
        resources = await storage.searchResources(search);
      }

      // Apply category filter
      if (category) {
        resources = resources.filter(r => r.category === category);
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