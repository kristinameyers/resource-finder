/**
 * Simple Taxonomy Test Script
 * Direct import and test of taxonomy functions
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import taxonomy directly
const taxonomy = await import('../server/data/officialTaxonomy.ts');

console.log('\n🧪 TAXONOMY SANITY TEST');
console.log('=' .repeat(50));

// Test all main categories
console.log('\n📊 MAIN CATEGORIES TEST:');
console.log('-'.repeat(30));

const expectedCodes = {
  'housing': 'BH-1800.8500',
  'finance-employment': 'NL-1000', 
  'food': 'BD-5000',
  'healthcare': 'LN',
  'mental-wellness': 'RP-1400',
  'substance-use': 'RX-8250',
  'children-family': 'PH-2360.2400',
  'young-adults': 'PS-9800',
  'education': 'HD-1800.8000',
  'legal-assistance': 'FT',
  'utilities': 'BV',
  'transportation': 'BT-4500'
};

let passed = 0;
let total = 0;

for (const [categoryId, expectedCode] of Object.entries(expectedCodes)) {
  total++;
  try {
    const actualCode = taxonomy.getOfficialCategoryTaxonomyCode(categoryId);
    const success = actualCode === expectedCode;
    
    console.log(`${categoryId.padEnd(20)} → ${success ? '✅' : '❌'} ${actualCode || 'NULL'} ${success ? '' : `(expected ${expectedCode})`}`);
    
    if (success) passed++;
  } catch (error) {
    console.log(`${categoryId.padEnd(20)} → ❌ ERROR: ${error.message}`);
  }
}

// Test case sensitivity
console.log('\n🔤 CASE SENSITIVITY TEST:');
console.log('-'.repeat(30));

const caseTests = ['food', 'Food', 'FOOD', 'housing', 'Housing'];
for (const testCase of caseTests) {
  try {
    const result = taxonomy.getOfficialCategoryTaxonomyCode(testCase);
    const expected = expectedCodes[testCase.toLowerCase()];
    const success = result === expected;
    console.log(`${testCase.padEnd(10)} → ${success ? '✅' : '❌'} ${result || 'NULL'}`);
  } catch (error) {
    console.log(`${testCase.padEnd(10)} → ❌ ERROR: ${error.message}`);
  }
}

// Test a few subcategories
console.log('\n📋 SUBCATEGORY SAMPLE TEST:');
console.log('-'.repeat(30));

const subcategoryTests = [
  ['food', 'meals', 'BD-5000'],
  ['housing', 'homeless-shelters', 'BH-1800.8500'],
  ['finance-employment', 'calfresh', 'NL-6000.2000']
];

for (const [categoryId, subcategoryId, expectedCode] of subcategoryTests) {
  try {
    const actualCode = taxonomy.getOfficialSubcategoryTaxonomyCode(categoryId, subcategoryId);
    const success = actualCode === expectedCode;
    console.log(`${categoryId}/${subcategoryId.padEnd(15)} → ${success ? '✅' : '❌'} ${actualCode || 'NULL'} ${success ? '' : `(expected ${expectedCode})`}`);
  } catch (error) {
    console.log(`${categoryId}/${subcategoryId.padEnd(15)} → ❌ ERROR: ${error.message}`);
  }
}

// Summary
console.log('\n📈 SUMMARY:');
console.log(`Main Categories: ${passed}/${total} passed (${Math.round(passed/total*100)}%)`);
console.log(`Overall Status: ${passed === total ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);

console.log('\n🗂️ CURRENT TAXONOMY CODES:');
console.log('-'.repeat(30));
for (const [categoryId, expectedCode] of Object.entries(expectedCodes)) {
  console.log(`${categoryId.padEnd(20)} → ${expectedCode}`);
}