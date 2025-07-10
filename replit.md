# Resource Finder Application

## Overview

This is a full-stack web application that helps users find community resources in their area. The application allows users to search for resources by category, subcategory, and location, with data sourced from both a local database and the National 211 API. It features a modern React frontend with a Node.js/Express backend and uses PostgreSQL for data storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend responsibilities:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Anonymous voting using client-side session IDs
- **External Services**: Firebase Firestore for voting data, National 211 API integration

## Key Components

### Database Schema
- **Users Table**: Basic user authentication (currently minimal usage)
- **Ratings Table**: Anonymous voting system with session-based tracking
- **Resource Data**: Primarily sourced from National 211 API with local categorization

### Authentication & Authorization
- **Anonymous Access**: No user authentication required for core functionality
- **Session-based Voting**: Anonymous voting using client-generated session IDs
- **IP Address Tracking**: Additional layer for vote deduplication

### Data Sources
- **Primary**: National 211 API (Search V2) for real-time resource data
- **Secondary**: Local storage for categories, subcategories, and location mappings
- **Voting Data**: Firebase Firestore for distributed vote storage

### Location Services
- **Browser Geolocation**: HTML5 Geolocation API for current location
- **Zip Code Search**: Manual location entry with coordinate lookup
- **Distance Filtering**: Location-based resource filtering

## Data Flow

1. **Resource Discovery**: Users browse categories or enter location data
2. **API Integration**: System queries National 211 API with taxonomy codes and location parameters
3. **Data Enrichment**: Resources are enhanced with local category mappings and voting data
4. **Client Rendering**: React components display filtered and sorted results
5. **User Interaction**: Anonymous voting and favorites are stored locally/in Firestore

## External Dependencies

### Core Services
- **National 211 API**: Primary data source for community resources
- **Neon Database**: Serverless PostgreSQL hosting
- **Firebase Firestore**: Voting and analytics data storage

### Development & UI
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **TanStack Query**: Server state management and caching

### Location & Mapping
- **Browser Geolocation API**: Current location detection
- **Coordinate-based Search**: Geographic filtering of resources

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express API
- **Hot Reload**: Real-time updates during development
- **Environment Variables**: Database and API credentials management

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Deployment**: Single server deployment with static file serving

### Database Management
- **Schema**: Drizzle migrations in `./migrations` directory
- **Deployment**: `drizzle-kit push` for schema updates
- **Connection**: Serverless connection pooling with Neon

The application prioritizes user experience with fast loading times, anonymous access, and real-time data from authoritative sources while maintaining a clean, accessible interface.

## Recent Changes (January 2025)

### Favorites System Implementation
- **Removed**: Cloud-based voting system (Firebase Firestore)
- **Added**: Local device storage for favorites using localStorage
- **Components**: FavoriteButton with heart icon, useFavorites hook
- **Storage**: All favorite data stored on user's device, no external database required

### 211 API V2 Integration Updates
- **Updated**: API endpoint to https://api.211.org/resources/v2/search/keyword
- **Changed**: Parameter format from taxonomy codes to keyword searches
- **Mapping**: BD→food, BH→housing, N→employment, etc.
- **Status**: Endpoint structure corrected, authentication needs user's API key verification

### Data Architecture Changes
- **Voting Data**: Removed from cloud storage
- **Favorites**: Local localStorage only
- **Resources**: Real-time from 211 National API
- **Categories/Subcategories**: Defined in application code

The app now uses a hybrid approach: favorites stored locally on device, resource data from 211 API, no external database dependencies for core functionality.

## API Integration Status

### Authentication Progress ✓
- API key authentication is working correctly
- Getting 400 validation errors instead of 401 authentication errors
- Successfully connecting to https://api.211.org/resources/v2/search/keyword endpoint

### Parameter Configuration Challenge ❌
The locationMode parameter validation is blocking successful API calls despite testing multiple combinations:
- Tried: "Near", "zipcode", "postal", "coordinates", "geo"
- Tested both POST form data and GET URL parameters
- Added distanceUnit parameter for completeness
- API consistently reports "locationMode field is required" even when parameter is present

### Next Steps
1. Consult official API documentation at apiportal.211.org for exact parameter specifications
2. May need to contact 211 support for parameter format clarification
3. Consider using API testing tools within the developer portal for validation

The integration foundation is solid - authentication works and the data transformation layer is ready for when the correct parameter format is identified.