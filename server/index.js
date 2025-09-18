import http from 'http';
import https from 'https';
import url from 'url';
import querystring from 'querystring';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// National 211 API Configuration
const NATIONAL_211_API_KEY = process.env.NATIONAL_211_API_KEY;
const NATIONAL_211_API_URL = 'https://api.211.org/resources/v2/search';

// Helper function to call National 211 API
async function callNational211API(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    if (!NATIONAL_211_API_KEY) {
      console.error('National 211 API key not configured');
      return resolve({ resources: [] });
    }

    // Build query string WITHOUT locationMode (it goes in headers!)
    // ALWAYS use Santa Barbara County, CA as location with locationMode: Serving
    const queryParams = new URLSearchParams({
      keywords: params.keywords || '',
      location: 'Santa Barbara County, CA', // ALWAYS use county, never zip
      size: params.size || '50' // Increase size to 50 (API max)
    });
    
    // Only add optional parameters if provided
    if (params.keywordIsTaxonomyCode) {
      queryParams.append('keywordIsTaxonomyCode', params.keywordIsTaxonomyCode);
    }
    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const apiUrl = `${NATIONAL_211_API_URL}/${endpoint}?${queryParams}`;
    console.log('Calling 211 API:', apiUrl);

    // ALWAYS use locationMode: Serving to get all resources that serve Santa Barbara County
    const locationMode = 'Serving';

    https.get(apiUrl, {
      headers: {
        'Api-Key': NATIONAL_211_API_KEY,
        'Accept': 'application/json',
        'locationMode': 'Serving' // ALWAYS use Serving for Santa Barbara County
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('211 API Response Status:', res.statusCode);
          if (res.statusCode !== 200) {
            console.log('API Error Response:', data.substring(0, 500));
            console.log('Note: The National 211 API requires specific authentication. Using fallback data.');
            resolve({ results: [] });
          } else {
            console.log(`211 API returned ${parsed.results?.length || 0} results`);
            // Log first result structure for debugging
            if (parsed.results && parsed.results.length > 0) {
              const firstResult = parsed.results[0];
              console.log('First result address structure:', {
                hasAddress: !!firstResult.address,
                addressType: typeof firstResult.address,
                postalCode: firstResult.address?.postalCode || 'not found in address',
                addressCity: firstResult.address?.city || 'not found in address',
                addressStreet: firstResult.address?.streetAddress || 'not found in address'
              });
            }
            resolve(parsed);
          }
        } catch (error) {
          console.error('Error parsing 211 API response:', error);
          console.error('Raw response:', data.substring(0, 500));
          resolve({ results: [] });
        }
      });
    }).on('error', (error) => {
      console.error('Error calling 211 API:', error);
      resolve({ resources: [] });
    });
  });
}

// Transform 211 API response to our format
function transformNational211Resource(apiResource) {
  if (!apiResource) return null;

  // Use the actual field names from the 211 API response
  const name = apiResource.nameService || 
               apiResource.nameOrganization || 
               apiResource.nameServiceAtLocation ||
               'Unknown Service';
  
  const description = apiResource.descriptionService || 
                     apiResource.descriptionOrganization || 
                     apiResource.descriptionServiceAtLocation ||
                     '';
  
  // Location information
  const locationName = apiResource.nameLocation || '';
  
  // Address fields - check both top-level and nested address object
  const address1 = apiResource.address1Physical || 
                  apiResource.address1 || 
                  apiResource.address?.streetAddress || 
                  '';
  const city = apiResource.cityPhysical || 
              apiResource.city || 
              apiResource.address?.city || 
              'Santa Barbara';
  const state = apiResource.stateProvincePhysical || 
               apiResource.stateProvince || 
               apiResource.address?.stateProvince || 
               'CA';
  // Normalize ZIP code to 5 digits (remove ZIP+4 and non-digits) - NO DEFAULT
  const rawZip = apiResource.postalCodePhysical || 
                 apiResource.postalCode || 
                 apiResource.address?.postalCode || 
                 '';
  const zipCode = rawZip ? rawZip.replace(/\D/g, '').slice(0, 5) : null;
  
  const fullAddress = [address1, city, state, zipCode].filter(Boolean).join(', ') || locationName;
  
  // Phone information
  const phone = apiResource.phoneNumbers?.[0] || 
               apiResource.phone || 
               '';
  
  // Website
  const website = apiResource.urlOrganization || 
                 apiResource.urlService || 
                 apiResource.website || 
                 '';
  
  // Hours - typically in schedule field
  const hours = apiResource.scheduleText || 
               apiResource.hours || 
               'Call for hours';
  
  // Service categories from taxonomies
  const taxonomies = apiResource.taxonomies || [];
  const category = taxonomies[0]?.name || 
                  apiResource.serviceArea || 
                  'Community Services';
  
  const services = taxonomies.map(t => t.name || '').filter(Boolean);

  return {
    id: apiResource.idServiceAtLocation || 
        apiResource.idService || 
        apiResource.id || 
        `res-${Date.now()}`,
    name: name,
    description: description.substring(0, 500), // Limit description length
    category: category,
    location: fullAddress,
    zipCode: zipCode,
    phone: phone,
    website: website,
    hours: hours,
    services: services,
    isActive: true,
    createdAt: new Date()
  };
}

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

    // Serve zipCodeData.js file
    if (pathname === '/zipCodeData.js' && req.method === 'GET') {
      const jsPath = path.join(__dirname, '..', 'client', 'zipCodeData.js');
      try {
        const jsContent = fs.readFileSync(jsPath, 'utf-8');
        res.writeHead(200, {
          'Content-Type': 'application/javascript',
          'Access-Control-Allow-Origin': '*',
        });
        return res.end(jsContent);
      } catch (error) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'File not found' }));
      }
    }

    // Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
    }

    // Resources endpoints
    if (pathname === '/api/resources' && req.method === 'GET') {
      const { search, category, keyword, taxonomyCode, offset, limit } = query;
      
      // Try to use real 211 API if available
      if (NATIONAL_211_API_KEY && (keyword || taxonomyCode || search)) {
        try {
          let apiParams = {
            offset: offset || '0',
            size: limit || '50' // Max 50 per request from API
          };
          
          // Handle different search types
          if (taxonomyCode) {
            // Taxonomy code search
            apiParams.keywords = taxonomyCode;
            apiParams.keywordIsTaxonomyCode = 'true';
          } else if (keyword) {
            // Keyword search - limit to first 3 keywords to avoid 404 errors
            const keywords = keyword.split(' ').slice(0, 3).join(' ');
            apiParams.keywords = keywords;
            apiParams.keywordIsTaxonomyCode = 'false';
          } else if (search) {
            // Regular search
            apiParams.keywords = search;
            apiParams.keywordIsTaxonomyCode = 'false';
          }
          
          // Call the real 211 API
          const apiResponse = await callNational211API('keyword', apiParams);
          
          if (apiResponse.results && apiResponse.results.length > 0) {
            const transformedResources = apiResponse.results
              .map(transformNational211Resource)
              .filter(Boolean);
            
            // Return with pagination info for infinite scroll
            return sendJSON(res, {
              resources: transformedResources,
              total: apiResponse.totalResults || transformedResources.length,
              offset: parseInt(offset || '0'),
              hasMore: apiResponse.totalResults > (parseInt(offset || '0') + transformedResources.length)
            });
          }
        } catch (error) {
          console.error('Error calling 211 API, falling back to mock data:', error);
        }
      }
      
      // Fallback to mock data with same pagination format
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

      // Apply pagination
      const startIndex = parseInt(offset || '0');
      const pageSize = parseInt(limit || '50');
      const paginatedResources = resources.slice(startIndex, startIndex + pageSize);

      // Return with pagination info for consistency
      return sendJSON(res, {
        resources: paginatedResources,
        total: resources.length,
        offset: startIndex,
        hasMore: resources.length > (startIndex + paginatedResources.length)
      });
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
      } else if (pathname.endsWith('/details')) {
        // Fetch detailed information from National 211 API
        const resourceId = pathname.split('/')[3];
        
        try {
          // Make request to National 211 API for detailed information
          const API_KEY = process.env.NATIONAL_211_API_KEY;
          if (!API_KEY) {
            console.error('National 211 API key not configured');
            // Fallback to local resource if API key not available
            const resource = await storage.getResource(resourceId);
            if (!resource) {
              return sendError(res, 'Resource not found', 404);
            }
            return sendJSON(res, resource);
          }
          
          const detailUrl = `https://api.211.org/resources/v2/query/service-at-location-details/${resourceId}`;
          console.log('Fetching detailed resource info from:', detailUrl);
          
          const response = await fetch(detailUrl, {
            headers: {
              'Api-Key': API_KEY,
              'Accept': 'application/json',
              'locationMode': 'manual'  // Required header for the API
            }
          });
          
          if (!response.ok) {
            console.error('211 API detail error:', response.status, response.statusText);
            // Try fallback to local resource
            const resource = await storage.getResource(resourceId);
            if (!resource) {
              return sendError(res, 'Resource not found', 404);
            }
            return sendJSON(res, resource);
          }
          
          const detailData = await response.json();
          console.log('Full Detail API Response - fields:', Object.keys(detailData));
          
          // Transform the detailed API response into our format
          const transformedDetail = {
            id: resourceId,
            // Names and descriptions
            name: detailData.serviceName || detailData.serviceAtLocationName || 'Unknown Service',
            organization: detailData.organizationName || '',
            siteName: detailData.locationName || '',
            description: detailData.serviceDescription || detailData.organizationDescription || '',
            
            // Full address information
            address: {
              street: detailData.address?.street || '',
              street2: '',
              city: detailData.address?.city || '',
              state: detailData.address?.county || '',
              postalCode: detailData.address?.postalCode || '',
              full: [
                detailData.address?.street,
                detailData.address?.city,
                detailData.address?.county,
                detailData.address?.postalCode
              ].filter(Boolean).join(', ')
            },
            
            // Contact information
            contact: {
              phone: detailData.servicePhones?.[0]?.number || detailData.locationPhones?.[0]?.number || '',
              tty: detailData.servicePhones?.find(p => p.type === 'TTY')?.number || '',
              crisis: detailData.servicePhones?.find(p => p.type === 'Crisis')?.number || '',
              fax: detailData.servicePhones?.find(p => p.type === 'Fax')?.number || '',
              website: detailData.website || '',
              email: detailData.serviceContacts?.[0]?.email || detailData.locationContacts?.[0]?.email || ''
            },
            
            // Service details
            category: detailData.taxonomy?.[0]?.taxonomyTermLevel1 || '',
            subcategory: detailData.taxonomy?.[0]?.taxonomyTermLevel2 || '',
            taxonomyCode: detailData.taxonomy?.[0]?.taxonomyCode || '',
            
            // Hours of operation
            hours: detailData.serviceHoursText || detailData.locationHoursText || '',
            
            // Languages and accessibility
            languages: detailData.languagesOffered || [],
            accessibility: detailData.disabilitiesAccess || '',
            
            // Eligibility and requirements
            eligibility: detailData.eligibility || '',
            documentsRequired: detailData.documentsRequired || '',
            applicationProcess: detailData.applicationProcess || '',
            
            // Fees and service area
            fees: detailData.fees || '',
            serviceArea: detailData.serviceAreas?.map(area => `${area.value} ${area.type}`).join(', ') || '',
            
            // Additional details
            lastUpdated: detailData.lastUpdated || '',
            notes: detailData.notes || ''
          };
          
          return sendJSON(res, transformedDetail);
        } catch (error) {
          console.error('Error fetching detailed resource:', error);
          // Fallback to local resource
          const resource = await storage.getResource(resourceId);
          if (!resource) {
            return sendError(res, 'Resource not found', 404);
          }
          return sendJSON(res, resource);
        }
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