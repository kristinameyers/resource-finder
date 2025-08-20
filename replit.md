# Resource Finder Application

## Overview
This project is a comprehensive full-stack Resource Finder application designed to connect users with essential community services. It integrates with the National 211 API V2 to display real-time resource information, including contact details, hours, and service descriptions. The platform features a mobile-first design with a 5-tab bottom navigation, comprehensive accessibility settings, and a polished user interface. The application aims to provide a professional, user-friendly experience for accessing vital community resources.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application employs a modern full-stack architecture with a clear separation of concerns, focusing on performance, accessibility, and a professional user experience.

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack Query
- **Build Tool**: Vite
- **UI/UX Decisions**: Features a professional Material Design-inspired interface with fast loading and comprehensive accessibility. Uses a consistent brand color palette (#005191 primary, #539ED0 navigation, #FFB351 accent), Roboto typography, and Material UI-style navigation effects. Includes a professional splash screen with 211 logo and animated loading dots. Resource detail pages are polished with interactive elements. Resource filters feature an orange background with white rounded rectangle sections for a clean appearance.

### Backend
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless PostgreSQL)
- **Session Management**: Anonymous voting uses client-side session IDs with IP address tracking.
- **Data Handling**: Transforms National 211 API responses for consistent application display.
- **Deployment**: Vite for frontend static assets and esbuild for the Express server, bundled for single server deployment.

### Key Features & Design Patterns
- **Anonymous Access**: No user authentication required.
- **Session-based Voting**: An anonymous voting system with session tracking.
- **Dual Data Sourcing**: Combines real-time National 211 API data with local data for categories and locations.
- **Location Services**: Supports browser geolocation, manual zip code entry, and distance-based filtering using the Haversine formula.
- **Favorites System**: Uses local device storage for user favorites.
- **Taxonomy Integration**: Utilizes official 211 taxonomy data for precise API queries, with a fallback strategy to text search.
- **Keyword Search**: Complete keyword search functionality with pagination.
- **Comprehensive Resource Details**: Displays detailed service information including application process, required documents, fees, service areas, contact information, and hours, sourced from the National 211 API. Includes HTML content cleaning.
- **Navigation & User Experience**: Features a 5-tab bottom navigation (Search, Favorites, Call, About Us, Settings) with Material UI-style hover/click effects. Preserves search context and supports URL parameters.
- **Multilingual Support**: Google Translation API integration with performance optimizations (batch processing, persistent localStorage caching, automatic cache invalidation). Provides 100% translation coverage for all user-facing content, including dynamic API responses, with instant language switching.
- **Unified Settings Experience**: Combines language selection (English, Spanish Mexican, Tagalog) and comprehensive accessibility features (font size controls, high contrast mode, motion reduction, screen reader optimization, haptic feedback). Settings persist in localStorage.
- **Cache Versioning System**: Automatically clears outdated translations upon app updates.

## External Dependencies
- **National 211 API**: Primary data source for community resources (Search V2 and Service At Location Details endpoints).
- **Neon Database**: Serverless PostgreSQL hosting.
- **Firebase Firestore**: Used for storing voting data.
- **Radix UI**: Provides accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Pre-built component library.
- **TanStack Query**: Manages server state and caching.
- **Browser Geolocation API**: For current location detection.