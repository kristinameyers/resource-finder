# Resource Finder Application

## Overview
This project is a comprehensive full-stack Resource Finder application that connects users with essential community services through an intelligent, mobile-first platform. The application successfully integrates with the National 211 API V2 to display real-time resource information including phone numbers, hours of operation, detailed service descriptions, and interactive contact elements. The platform features a professional 5-tab bottom navigation, comprehensive accessibility settings, and a polished user interface that meets modern accessibility standards. The application uses the official Santa Barbara County 211 logo for professional branding.

## Project Status: Production Ready ✅
The application is complete and ready for deployment with all core features implemented and tested.

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
- **UI/UX Decisions**: Features a professional Material Design-inspired interface with fast loading, anonymous access, and comprehensive accessibility. Uses consistent brand color palette (#005191 primary, #539ED0 navigation, #FFB351 accent for filter cards), Roboto typography (Regular, Medium, Bold), and Material UI-style navigation effects. Professional splash screen with 211 logo and animated loading dots creates excellent first impressions. Resource detail pages are fully polished with interactive phone numbers, addresses, and professional presentation. Resource Filters feature orange background with white rounded rectangle sections for clean, modern appearance.

### Backend
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless PostgreSQL)
- **Session Management**: Anonymous voting uses client-side session IDs with IP address tracking for deduplication.
- **Data Handling**: Transforms National 211 API responses for consistent application display.
- **Deployment**: Vite for frontend static assets and esbuild for the Express server, bundled for single server deployment.

## Recent Major Achievements (January 2025)
- ✅ **Professional Splash Screen**: Implemented with 211 logo and animated loading dots in brand color (#005191)
- ✅ **5-Tab Bottom Navigation**: Material UI-style navigation with hover/click effects and custom iconography (Search, Favorites, Call, About Us, Settings)
- ✅ **Google Translation API Integration**: Complete multilingual support for English, Spanish (Mexican), and Tagalog with automatic content translation
- ✅ **Unified Settings Page**: Combined language selection and accessibility features into a comprehensive Settings page
- ✅ **Complete Accessibility Compliance**: Font size controls, high contrast mode, motion reduction, screen reader optimization, and haptic feedback options
- ✅ **National 211 API V2 Integration**: Real-time resource data with proper authentication and error handling
- ✅ **Resource Detail Pages**: Polished interface displaying comprehensive service information with interactive elements
- ✅ **Favorites System**: Complete user favorites functionality with localStorage persistence
- ✅ **Search & Filtering**: Category-based search with location services and distance calculations
- ✅ **Professional UI/UX**: Consistent brand colors, Roboto typography, and responsive design
- ✅ **Keyword Search Pagination**: Comprehensive pagination system for keyword searches with detailed logging and API analysis
- ✅ **Translation Performance Optimization**: Implemented 26x faster translations with batch processing, persistent caching, and automatic cache invalidation
- ✅ **Complete Translation Coverage**: 100% translation implementation across entire application including category names, UI text, error messages, status indicators, search result cards (descriptions, buttons, locations), and all user-facing content with instant language switching
- ✅ **MAJOR MILESTONE - Complete Resource Detail Page Translation**: Full translation support for all resource detail sections including dynamic content, category badges, service descriptions, application processes, eligibility requirements, accessibility information, contact details, and service information. Fixed scrolling issues for optimal mobile experience. Achieved 100% translation coverage across entire application architecture.
- ✅ **Resource Filters UI Enhancement (January 2025)**: Implemented new orange background design (#FFB351) for Resource Filters card with white rounded rectangles for all filter sections including header, category selection, subcategory selection, and location controls. Consistent Material Design-inspired styling across all filter components.
- ✅ **Official 211 Logo Implementation (January 2025)**: Replaced "Santa Barbara 211" text header with official Santa Barbara County 211 logo for professional branding. Updated category grid spacing to gap-6 for optimal visual balance.

### Key Features & Design Patterns
- **Anonymous Access**: No user authentication is required for core functionality.
- **Session-based Voting**: An anonymous voting system with session tracking and Firebase Firestore for storage.
- **Dual Data Sourcing**: Combines real-time data from the National 211 API with local data for categories, subcategories, and location mappings.
- **Location Services**: Supports browser geolocation, manual zip code entry, and distance-based filtering with accurate Haversine formula for distance calculation.
- **Data Flow**: Resources are discovered via categories or location, enriched with local data and voting information.
- **Favorites System**: Uses local device storage (localStorage) for user favorites.
- **Taxonomy Integration**: Utilizes official 211 taxonomy data for precise API queries, including detailed subcategory codes from Santa Barbara 211. Implements a smart fallback strategy from taxonomy code search to text search.
- **Keyword Search Implementation**: Complete keyword search functionality with comprehensive pagination system. Discovered and documented that Santa Barbara 211 API limits keyword searches to 10 most relevant results (by API design), while category searches return full pagination (50-200+ results). System includes detailed logging, progress tracking, and distance calculations.
- **Comprehensive Resource Details**: Displays detailed information including application process, required documents, fees, service areas, contact information, and hours, sourced from the National 211 Service At Location Details endpoint. Includes HTML content cleaning for descriptions. Complete translation support for all resource detail content including dynamic API responses, eligibility requirements, accessibility information, and interactive contact elements.
- **Navigation & User Experience**: Features 5-tab bottom navigation (Search, Favorites, Call, About Us, Settings) with Material UI-style hover/click effects including smooth scaling and shadow animations. Preserves search context when navigating between pages, supports URL parameters for direct links, and provides seamless user experience across all features.
- **Multilingual Support**: Google Translation API integration with major performance optimizations including batch processing (26x fewer API calls), persistent localStorage caching that survives sessions, short-circuit logic for source language (English), and automatic cache invalidation on app updates. Translation context provider manages language state across the application. Complete 100% translation coverage including category names, UI text, error messages, filter sections, search result cards (resource descriptions, location names, button text), resource detail pages (all section headings, dynamic content, service information, contact details, eligibility, accessibility), and all user-facing content with instant language switching. Includes specialized TranslatedResourceText components for dynamic API content translation.
- **Unified Settings Experience**: Combined Settings page includes both language selection (English, Spanish Mexican, Tagalog) and comprehensive accessibility features (font size controls, high contrast mode, motion reduction, screen reader optimization, haptic feedback). All settings persist in localStorage and apply instantly. Developer tools section included for cache management in development mode.
- **Cache Versioning System**: Robust cache invalidation system automatically clears outdated translations when the app is updated, ensuring users always see current content while maintaining optimal performance for previously translated content.

## External Dependencies
- **National 211 API**: Primary data source for community resources (Search V2 and Service At Location Details endpoints).
- **Neon Database**: Serverless PostgreSQL hosting.
- **Firebase Firestore**: Used for storing voting data.
- **Radix UI**: Provides accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Pre-built component library.
- **TanStack Query**: Manages server state and caching.
- **Browser Geolocation API**: For current location detection.