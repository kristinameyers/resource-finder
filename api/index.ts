// api/index.ts
export * from './resourceApi';

// Re‑export locationApi, but rename the conflicting symbol
export { getCurrentLocation as getCurrentLocationFromLocationApi } from './locationApi';