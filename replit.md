# Resource Finder Application

## Overview

This is a full-stack web application designed to help users find community resources by category, subcategory, and location. It integrates data from a local database and the National 211 API, providing a comprehensive search platform. The project includes both a web application and a native mobile app for Google Play and iTunes distribution, featuring custom PNG category icons, ADA-compliant accessibility, and an exact 3-column grid layout with specific color palette matching provided design specifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## Critical API Integration Knowledge (January 6, 2025)

**WORKING CONFIGURATION FOR NATIONAL 211 API:**
- **Base URL**: `https://api.211.org/resources/v2/search/keyword`
- **Authentication**: Header `Api-Key: 0b49fd58c6ba4f17836bd9a350c72fb4`
- **Location Mode**: Header `locationMode: Serving` (critical for local service discovery)
- **Search Strategy**: Primary taxonomy code search with text fallback
- **Location**: Use specific zip codes (93101) for targeted results
- **Response Format**: API returns `results` array with `count` field

**PROVEN SEARCH PROCESS:**
1. Try taxonomy code search: `keywordIsTaxonomyCode: true`, `keywords: BD` (for food)
2. If 404 response, fallback to text search: `keywordIsTaxonomyCode: false`, `keywords: food`
3. Parse `data.results` array for resource objects
4. Transform API response to application format

**TAXONOMY CODE MAPPINGS:**
- BD = Food
- BH = Housing  
- N = Employment
- L = Healthcare
- F = Legal
- H = Education
- BT = Transportation
- P = Family/Children
- RX = Substance Use
- YB-9000 = Youth Services

**VERIFIED RESULTS:** Successfully retrieving 10+ real Santa Barbara resources per category including Adam's Angels Food Program, Salvation Army Food Pantry, Food From The Heart Harvest Program, and housing services.

## System Architecture

The application adopts a modern full-stack architecture, separating frontend and backend concerns.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack Query
- **Build Tool**: Vite
- **UI/UX Decisions**: Prioritizes user experience with fast loading, anonymous access, and a clean, accessible interface. It utilizes a consistent color palette (#005191 primary) and typography (Roboto font family throughout - Regular, Medium, Bold weights). Custom PNG category icons provide brand consistency. Skeleton loading provides visual feedback during data fetching.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless PostgreSQL)
- **Session Management**: Anonymous voting using client-side session IDs with IP address tracking for deduplication.
- **Data Handling**: Transforms National 211 API responses for consistent application display.
- **Deployment**: Uses Vite for frontend static assets and esbuild for the Express server, bundled for single server deployment.

### Key Features & Design Patterns
- **Anonymous Access**: Core functionality does not require user authentication.
- **Session-based Voting**: Anonymous voting system with session-based tracking and Firebase Firestore for storage.
- **Dual Data Sourcing**: Combines real-time data from the National 211 API with local storage for categories, subcategories, and location mappings.
- **Location Services**: Supports browser geolocation, manual zip code entry, and distance-based filtering.
- **Data Flow**: Resources are discovered via categories or location, enriched with local data and voting information, then rendered for user interaction.
- **Favorites System**: Local device storage (localStorage) for user favorites without cloud dependencies.
- **Taxonomy Integration**: Utilizes official 211 taxonomy data for categories and subcategories, enabling precise API queries.
- **Comprehensive Resource Details**: Displays detailed information including application process, required documents, fees, service areas, enhanced contact information, and hours of operation.
- **API Configuration Mastery**: Proven methodology for National 211 API integration using taxonomy codes with smart text fallback, locationMode='Serving', and zip code targeting for optimal local resource discovery.

## Recent Changes (January 2025)

### National 211 API Integration Breakthrough (January 6, 2025)
- **RESOLVED**: Major API authentication and endpoint discovery completed successfully 
- **Working Endpoint**: `/keyword` endpoint at https://api.211.org/resources/v2/search/keyword confirmed functional
- **Authentication Method**: `Api-Key` header format verified working with production key 0b49fd58c6ba4f17836bd9a350c72fb4
- **Critical Configuration**: 
  - Headers: `locationMode: 'Serving'`, `keywordIsTaxonomyCode: 'true'` for taxonomy searches
  - Query params: `keywords={taxonomyCode}`, `location={zipCode}`, `distance=25`, `size=20`
  - Fallback: When taxonomy fails (404), retry with `keywordIsTaxonomyCode: 'false'` and category name
- **Response Handling**: API returns 404 for "no results found" (not endpoint errors), 200 for successful data retrieval
- **Taxonomy Code Strategy**: Use official 211 taxonomy codes (BD=food, BH=housing, etc.) with text fallback
- **Location Precision**: Zip code 93101 with locationMode='Serving' delivers 10+ targeted local resources
- **Response Format**: API returns 'results' array with 'count' field containing full resource objects
- **Data Success**: Confirmed retrieval of real Santa Barbara resources (Adam's Angels, Salvation Army, etc.)
- **Smart Fallback**: Implemented taxonomy code → text search fallback ensuring maximum result coverage

## Recent Changes (January 2025)

- **Typography Overhaul**: Completely replaced League Gothic with Roboto font family across both web and mobile applications. All text now uses Roboto Regular (400), Medium (500), and Bold (700) weights for consistency.
- **Category Card Design Fix**: Resolved background color extension issue for Food and Education category cards by replacing shadcn Card components with direct div structure, ensuring colors extend fully to card edges.
- **Custom PNG Icon System**: Replaced all SVG icons with custom PNG designs featuring category-specific symbols (education A-Z book, legal justice scales, children graduation cap, food fork/knife circle, finance dollar bill, healthcare heart pulse, housing house, substance use pill, young adults people group, transportation bus, hygiene clean hands with sparkles).
- **CardFrame Component**: Created sophisticated card styling with #256BAE background, semi-transparent white borders, platform-specific shadows, and 140x140px dimensions with 32px border radius for professional visual depth.
- **Mobile App Fonts**: Integrated custom Roboto font files into React Native app with proper font family declarations for cross-platform consistency.
- **Design Consistency**: Both web and mobile apps now maintain identical visual styling with proper color coverage, typography, and modern card frame design.
- **Enhanced Filter Section UI (January 6, 2025)**: Upgraded Category and Subcategory select components with professional blue-themed styling, enhanced borders, hover states, and improved typography. Implemented Tamagui-inspired zip code input with size="$4" equivalent styling and borderWidth={2}. Wrapped entire Resource Filters section in collapsible accordion with professional blue header design, providing better space management while maintaining all enhanced functionality.

## External Dependencies

- **National 211 API**: Primary data source for community resources (Search V2 endpoint).
- **Neon Database**: Serverless PostgreSQL hosting for the main database.
- **Firebase Firestore**: Used for storing voting data.
- **Radix UI**: Provides accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **shadcn/ui**: Pre-built component library for UI elements.
- **TanStack Query**: Manages server state and caching.
- **Browser Geolocation API**: For current location detection.