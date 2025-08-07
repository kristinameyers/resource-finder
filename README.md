# Resource Finder Application

A comprehensive community resource discovery platform that helps users find essential local services through intelligent search capabilities and location-based filtering.

## Features

- **Comprehensive Resource Search**: Integrates with National 211 API for real-time community resource data
- **Official Taxonomy Integration**: Uses official Santa Barbara 211 taxonomy codes for precise resource categorization
- **Location-Based Filtering**: Distance calculations with zip code support and browser geolocation
- **Smart Navigation**: Context-preserving back navigation and URL parameter support
- **Anonymous Access**: No user registration required for core functionality
- **Favorites System**: Local device storage for user favorites
- **Responsive Design**: Mobile-first design with desktop support
- **Accessibility**: ADA-compliant design with proper contrast and keyboard navigation

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **Tailwind CSS** with shadcn/ui components
- **TanStack Query** for state management
- **Vite** for build tooling

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL (Neon serverless)
- **National 211 API V2** integration
- **Firebase Firestore** for voting data

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- National 211 API key
- Firebase project for voting data

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# National 211 API
NATIONAL_211_API_KEY=your_api_key
NATIONAL_211_API_URL=https://api.211.org/resources/v2/search

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/resource-finder.git
cd resource-finder
```

> **Note**: Replace `yourusername` with your actual GitHub username

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## API Integration

### National 211 API Configuration

The application uses the National 211 API V2 with the following proven configuration:

- **Endpoint**: `/keyword` at `https://api.211.org/resources/v2/search/keyword`
- **Authentication**: `Api-Key` header
- **Location Mode**: `locationMode: 'Serving'` for local service discovery
- **Search Strategy**: Primary taxonomy code search with text fallback
- **Official Taxonomy Codes**: 
  - BH = Housing
  - BD = Food  
  - L = Health Care
  - P = Children & Family
  - And more...

## Deployment

### Replit Deployment

This application is optimized for Replit deployment with automatic workflows and environment management.

### Manual Deployment

For other platforms:

1. Build the application:
```bash
npm run build
```

2. Set up environment variables on your hosting platform
3. Deploy both frontend and backend (single server deployment)

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Route components
│   │   └── lib/         # Utilities and API clients
├── server/          # Express backend
│   ├── data/        # Official taxonomy data
│   ├── services/    # API integrations
│   └── routes.ts    # API endpoints
├── shared/          # Shared TypeScript schemas
└── attached_assets/ # Static assets and data files
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- National 211 for providing comprehensive community resource data
- Santa Barbara 211 for official taxonomy specifications
- Replit for hosting and development platform