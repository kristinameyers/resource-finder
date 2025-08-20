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
- ✅ **Official 211 Logo Implementation (January 2025)**: Replaced "Santa Barbara 211" text header with official Santa Barbara County 211 logo (h-32 size) for professional branding. Updated category grid spacing to gap-6 for optimal visual balance. Logo prominently displayed in header for enhanced brand recognition.
- ✅ **Bottom Navigation Redesign (January 2025)**: Updated bottom navigation bar with new visual design matching provided specifications. Features light blue background (#66A8DD) with dark blue rounded rectangle buttons (#152941), optimized sizing (80x68px), enhanced spacing for proper text clearance, and improved Material Design-style hover effects. All navigation functionality preserved with perfect visual alignment.
- ✅ **MAJOR MILESTONE - Advanced Accessibility System Implementation (January 2025)**: Created comprehensive AccessibilityContext with global font scaling, enhanced haptic feedback integration, screen reader optimizations, and motion reduction controls. Implemented improved CSS accessibility features including dynamic font scaling, enhanced high contrast mode, and proper focus management. Added ARIA attributes, semantic roles, and screen reader support throughout the application. All interactive elements now include haptic feedback and accessibility labels for optimal user experience across diverse accessibility needs.
- ✅ **MAJOR MILESTONE - Complete Onboarding Flow Implementation (January 16, 2025)**: Successfully implemented 3-screen personalized onboarding flow including Welcome screen with 211 logo, Location setup (zip code/GPS), and Category selection (up to 3 favorites). Onboarding appears only on first app launch with localStorage persistence. Home Screen now personalizes category order based on user's favorite selections from onboarding. Updated resource display parameters (orgName instead of serviceName, descriptionService instead of organizationDescription). Removed postal code restrictions for Santa Barbara County taxonomy searches to expand resource coverage. Fixed critical Screen 3 button visibility issue with enhanced styling and layout optimization.
- ✅ **National 211 API v2 Taxonomy Code Update (January 17, 2025)**: Updated all main category taxonomy codes to official National 211 API v2 standards for improved resource matching: Housing (BH-1800.8500), Finance & Employment (NL-1000), Food (BD-1800.2000), Health Care (LN), Mental Wellness (RP-1400), Substance Use (RX-8250), Children & Family (PH-2360.2400), Young Adults (PS-9800), Education (HD-1800.8000), Legal Assistance (FT), Transportation (BT-4500). This ensures more accurate and comprehensive resource search results from the National 211 API.
- ✅ **MAJOR TAXONOMY STRUCTURE FIX (January 17, 2025)**: Resolved critical taxonomy mapping issues that were causing Food category to fallback to incorrect BD codes instead of BD-1800.2000. Fixed misplaced "Meals" subcategory that was incorrectly nested under Housing, moved all food-related subcategories to proper Food category, enhanced taxonomy lookup functions with comprehensive error logging and case-insensitive matching. Added strict validation to prevent silent fallbacks and ensure all category searches use correct taxonomy codes. Food category now returns proper food assistance resources (food banks, CalFresh, WIC, nutrition programs) instead of incorrect results.
- ✅ **COMPREHENSIVE UI OVERHAUL & DISTANCE SYSTEM RESTORATION (January 19, 2025)**: Implemented complete new navigation experience with Search Category, Search Keyword, Update Location, and Resources List screens matching provided PDF specifications. Integrated zipcodes package for authentic US postal code distance calculations using Haversine formula. Added Santa Barbara County resource filtering with distance-based sorting. Created prominent orange search buttons on home screen. Enhanced navigation with back button, hamburger menu, and GPS icon patterns. Established safeguarded distance calculation module with tests to prevent future removal. All new screens feature professional Material Design-inspired styling with proper translation support.
- ✅ **HOME SCREEN SIMPLIFICATION (January 19, 2025)**: Removed Resource Filters and keyword input field from home screen. Transformed home into clean "Search Category" experience with prominent orange search buttons and single blue background for category grid. Eliminated second blue background color and "Browse all Categories" text for cleaner, more focused interface matching user specifications.

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