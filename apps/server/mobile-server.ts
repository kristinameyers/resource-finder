import express from 'express';
import cors from 'cors';
import { MAIN_CATEGORIES } from '../../packages/taxonomy/src/index';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', type: 'mobile-api' });
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = Object.entries(MAIN_CATEGORIES).map(([id, category]) => ({
    id,
    ...category
  }));
  res.json({ categories });
});

// Get subcategories - placeholder for now
app.get('/api/subcategories', (req, res) => {
  const { categoryId } = req.query;
  if (!categoryId || typeof categoryId !== 'string') {
    return res.status(400).json({ error: 'Category ID required' });
  }
  // Return empty array for now as subcategories will be loaded from 211 API
  res.json({ subcategories: [] });
});

// Search resources - placeholder for now
app.get('/api/resources', async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      keyword,
      zipCode,
      latitude,
      longitude,
      use211Api,
      offset = 0,
      limit = 20
    } = req.query;

    // For now, return mock data for testing
    const mockResources = [
      {
        id: '1',
        name: 'Food Bank of Santa Barbara County',
        organization: 'Food Bank',
        description: 'Provides food assistance to families in need',
        address: '4554 Hollister Ave, Santa Barbara, CA 93110',
        phone: '(805) 967-5741',
        distance: 2.3
      },
      {
        id: '2',
        name: 'PATH Santa Barbara',
        organization: 'PATH',
        description: 'Emergency shelter and housing assistance',
        address: '816 Cacique St, Santa Barbara, CA 93103',
        phone: '(805) 884-8481',
        distance: 1.5
      },
      {
        id: '3',
        name: 'Family Service Agency',
        organization: 'FSA',
        description: 'Mental health and family support services',
        address: '123 W Gutierrez St, Santa Barbara, CA 93101',
        phone: '(805) 965-1001',
        distance: 0.8
      }
    ];

    // Filter by category if provided
    let resources = mockResources;
    if (keyword) {
      resources = mockResources.filter(r => 
        r.name.toLowerCase().includes(keyword.toString().toLowerCase()) ||
        r.description.toLowerCase().includes(keyword.toString().toLowerCase())
      );
    }

    res.json({
      resources,
      total: resources.length,
      source: 'mock'
    });
  } catch (error) {
    console.error('Error searching resources:', error);
    res.status(500).json({ error: 'Failed to search resources' });
  }
});

// Get resource details
app.get('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ 
      id,
      name: 'Sample Resource',
      organization: 'Sample Org',
      description: 'This is a sample resource for testing',
      address: '123 Main St, Santa Barbara, CA 93101',
      phone: '(805) 555-1234',
      hours: 'Mon-Fri 9am-5pm',
      eligibility: 'Open to all residents',
      applicationProcess: 'Walk-in or call for appointment',
      website: 'https://example.org'
    });
  } catch (error) {
    console.error('Error fetching resource details:', error);
    res.status(500).json({ error: 'Failed to fetch resource details' });
  }
});

app.listen(PORT, () => {
  console.log(`Mobile API Server running on port ${PORT}`);
});