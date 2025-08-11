# Resource Finder Application

## Overview
This project is a full-stack web and native mobile application designed to connect users with community resources. It integrates data from a local database and the National 211 API to provide comprehensive search capabilities by category, subcategory, and location. The application aims to offer an accessible, user-friendly platform with custom iconography, ADA compliance, and a consistent visual design, ultimately serving as a vital tool for community resource discovery with potential for broad market adoption.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application employs a modern full-stack architecture with a clear separation of concerns.

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack Query
- **Build Tool**: Vite
- **UI/UX Decisions**: Emphasizes fast loading, anonymous access, and a clean, accessible interface. It uses a consistent color palette (#005191 primary), Roboto typography (Regular, Medium, Bold), and custom PNG category icons. Skeleton loading provides visual feedback. A professional splash screen with the 211 logo and animated loading dots enhances the initial user experience. Resource detail pages are polished for usability, making phone numbers and addresses interactive.

### Backend
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless PostgreSQL)
- **Session Management**: Anonymous voting uses client-side session IDs with IP address tracking for deduplication.
- **Data Handling**: Transforms National 211 API responses for consistent application display.
- **Deployment**: Vite for frontend static assets and esbuild for the Express server, bundled for single server deployment.

### Key Features & Design Patterns
- **Anonymous Access**: No user authentication is required for core functionality.
- **Session-based Voting**: An anonymous voting system with session tracking and Firebase Firestore for storage.
- **Dual Data Sourcing**: Combines real-time data from the National 211 API with local data for categories, subcategories, and location mappings.
- **Location Services**: Supports browser geolocation, manual zip code entry, and distance-based filtering with accurate Haversine formula for distance calculation.
- **Data Flow**: Resources are discovered via categories or location, enriched with local data and voting information.
- **Favorites System**: Uses local device storage (localStorage) for user favorites.
- **Taxonomy Integration**: Utilizes official 211 taxonomy data for precise API queries, including detailed subcategory codes from Santa Barbara 211. Implements a smart fallback strategy from taxonomy code search to text search.
- **Comprehensive Resource Details**: Displays detailed information including application process, required documents, fees, service areas, contact information, and hours, sourced from the National 211 Service At Location Details endpoint. Includes HTML content cleaning for descriptions.
- **Navigation & User Experience**: Preserves search context when navigating to and from resource details, supporting URL parameters for direct links to filtered results.

## External Dependencies
- **National 211 API**: Primary data source for community resources (Search V2 and Service At Location Details endpoints).
- **Neon Database**: Serverless PostgreSQL hosting.
- **Firebase Firestore**: Used for storing voting data.
- **Radix UI**: Provides accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Pre-built component library.
- **TanStack Query**: Manages server state and caching.
- **Browser Geolocation API**: For current location detection.