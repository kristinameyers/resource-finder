/**
 * Unit tests for distance calculation utilities
 * These tests ensure distance calculations and sorting work correctly
 */

// Basic tests for distance calculation functionality
import { haversineDistance, addDistanceAndSort } from './distance';

/**
 * Basic validation that distance functions exist and work
 * This ensures distance calculation features are not accidentally removed
 */

// Test that distance calculation functions exist
export function validateDistanceFunctions() {
  const { haversineDistance, addDistanceAndSort } = require('./distance');
  
  // Ensure functions exist
  if (typeof haversineDistance !== 'function') {
    throw new Error('haversineDistance function is missing');
  }
  
  if (typeof addDistanceAndSort !== 'function') {
    throw new Error('addDistanceAndSort function is missing');
  }
  
  // Basic functionality test
  const distance = haversineDistance(34.4194, -119.6982, 34.4194, -119.6982);
  if (distance !== 0) {
    throw new Error('Distance calculation failed: same coordinates should return 0');
  }
  
  // Test sorting functionality
  const mockResources = [
    { id: 'far', name: 'Far Resource', zipCode: '90210' },
    { id: 'near', name: 'Near Resource', zipCode: '93101' }
  ];
  
  const result = addDistanceAndSort('93101', mockResources);
  if (result.length !== 2 || result[0].id !== 'near') {
    throw new Error('Distance sorting failed: nearest resource should be first');
  }
  
  return true;
}

// Auto-run validation
try {
  validateDistanceFunctions();
  console.log('✅ Distance calculation functions validated successfully');
} catch (error) {
  console.error('❌ Distance calculation validation failed:', error);
}