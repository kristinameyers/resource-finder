#!/usr/bin/env node

/**
 * Taxonomy Sanity Test Script
 * Tests all main categories and subcategories to ensure taxonomy codes are correct
 */

import { execSync } from 'child_process';
import path from 'path';

// Import the taxonomy functions directly
async function loadTaxonomy() {
  // Use tsx to run TypeScript directly
  const result = execSync(`npx tsx -e "
    const { MAIN_CATEGORIES, SUBCATEGORIES, getOfficialCategoryTaxonomyCode, getOfficialSubcategoryTaxonomyCode } = require('./server/data/officialTaxonomy.ts');
    console.log(JSON.stringify({
      mainCategories: MAIN_CATEGORIES,
      subcategories: SUBCATEGORIES,
      functions: {
        getCategoryCode: 'getOfficialCategoryTaxonomyCode',
        getSubcategoryCode: 'getOfficialSubcategoryTaxonomyCode'
      }
    }, null, 2));
  "`, { encoding: 'utf8', cwd: process.cwd() });
  
  return JSON.parse(result);
}

async function testCategoryCode(categoryId) {
  try {
    const result = execSync(`npx tsx -e "
      const { getOfficialCategoryTaxonomyCode } = require('./server/data/officialTaxonomy.ts');
      const code = getOfficialCategoryTaxonomyCode('${categoryId}');
      console.log(JSON.stringify({ categoryId: '${categoryId}', taxonomyCode: code, success: !!code }));
    "`, { encoding: 'utf8', cwd: process.cwd() });
    
    return JSON.parse(result.trim());
  } catch (error) {
    return { categoryId, taxonomyCode: null, success: false, error: error.message };
  }
}

async function testSubcategoryCode(categoryId, subcategoryId) {
  try {
    const result = execSync(`npx tsx -e "
      const { getOfficialSubcategoryTaxonomyCode } = require('./server/data/officialTaxonomy.ts');
      const code = getOfficialSubcategoryTaxonomyCode('${categoryId}', '${subcategoryId}');
      console.log(JSON.stringify({ categoryId: '${categoryId}', subcategoryId: '${subcategoryId}', taxonomyCode: code, success: !!code }));
    "`, { encoding: 'utf8', cwd: process.cwd() });
    
    return JSON.parse(result.trim());
  } catch (error) {
    return { categoryId, subcategoryId, taxonomyCode: null, success: false, error: error.message };
  }
}

async function runSanityTest() {
  console.log('\n🧪 TAXONOMY SANITY TEST STARTING...');
  console.log('=' .repeat(60));
  
  try {
    // Load taxonomy data
    const taxonomy = await loadTaxonomy();
    
    console.log('\n📊 MAIN CATEGORIES TEST');
    console.log('-'.repeat(40));
    
    let mainCategoryResults = [];
    
    // Test all main categories
    for (const [categoryId, categoryData] of Object.entries(taxonomy.mainCategories)) {
      console.log(`Testing: ${categoryId.padEnd(20)} → Expected: ${categoryData.taxonomyCode}`);
      
      const result = await testCategoryCode(categoryId);
      mainCategoryResults.push(result);
      
      if (result.success) {
        const match = result.taxonomyCode === categoryData.taxonomyCode;
        console.log(`  ✅ ${match ? 'PASS' : 'MISMATCH'}: Got "${result.taxonomyCode}" ${match ? '' : `(expected "${categoryData.taxonomyCode}")`}`);
      } else {
        console.log(`  ❌ FAIL: ${result.error || 'No taxonomy code returned'}`);
      }
    }
    
    console.log('\n📋 SUBCATEGORIES TEST');
    console.log('-'.repeat(40));
    
    let subcategoryResults = [];
    let subcategoryCount = 0;
    
    // Test subcategories for categories that have them
    for (const [categoryId, subcategoriesArray] of Object.entries(taxonomy.subcategories)) {
      if (subcategoriesArray && subcategoriesArray.length > 0) {
        console.log(`\n🔍 Testing ${categoryId} subcategories (${subcategoriesArray.length} items):`);
        
        for (const subcategory of subcategoriesArray.slice(0, 5)) { // Test first 5 to avoid spam
          const result = await testSubcategoryCode(categoryId, subcategory.id);
          subcategoryResults.push(result);
          subcategoryCount++;
          
          if (result.success) {
            const match = result.taxonomyCode === subcategory.taxonomyCode;
            console.log(`  ✅ ${subcategory.id}: ${match ? 'PASS' : 'MISMATCH'} (${result.taxonomyCode})`);
          } else {
            console.log(`  ❌ ${subcategory.id}: FAIL`);
          }
        }
        
        if (subcategoriesArray.length > 5) {
          console.log(`  ... (${subcategoriesArray.length - 5} more subcategories exist)`);
        }
      }
    }
    
    // Test case sensitivity
    console.log('\n🔤 CASE SENSITIVITY TEST');
    console.log('-'.repeat(40));
    
    const caseTests = [
      ['food', 'food'],
      ['Food', 'food'], 
      ['FOOD', 'food'],
      ['Housing', 'housing']
    ];
    
    for (const [testInput, expectedNormalized] of caseTests) {
      const result = await testCategoryCode(testInput);
      const expectedCode = taxonomy.mainCategories[expectedNormalized]?.taxonomyCode;
      const match = result.taxonomyCode === expectedCode;
      
      console.log(`  ${testInput.padEnd(10)} → ${match ? '✅ PASS' : '❌ FAIL'}: ${result.taxonomyCode}`);
    }
    
    // Summary
    console.log('\n📈 TEST SUMMARY');
    console.log('=' .repeat(60));
    
    const mainPassed = mainCategoryResults.filter(r => r.success).length;
    const subPassed = subcategoryResults.filter(r => r.success).length;
    
    console.log(`Main Categories: ${mainPassed}/${mainCategoryResults.length} passed`);
    console.log(`Subcategories:   ${subPassed}/${subcategoryResults.length} passed (sample)`);
    console.log(`Total Categories: ${Object.keys(taxonomy.mainCategories).length}`);
    console.log(`Total Subcategories: ${Object.values(taxonomy.subcategories).reduce((sum, arr) => sum + (arr?.length || 0), 0)}`);
    
    // Current taxonomy codes
    console.log('\n📋 CURRENT TAXONOMY MAPPING');
    console.log('-'.repeat(40));
    for (const [categoryId, categoryData] of Object.entries(taxonomy.mainCategories)) {
      console.log(`${categoryId.padEnd(20)} → ${categoryData.taxonomyCode}`);
    }
    
    const allPassed = mainPassed === mainCategoryResults.length && subPassed === subcategoryResults.length;
    console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
    
    if (!allPassed) {
      console.log('\n❌ Failed Tests:');
      [...mainCategoryResults, ...subcategoryResults]
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.categoryId}${r.subcategoryId ? `/${r.subcategoryId}` : ''}: ${r.error || 'No code returned'}`);
        });
    }
    
  } catch (error) {
    console.error('\n💥 TEST SCRIPT ERROR:', error.message);
    process.exit(1);
  }
}

// Run the test
runSanityTest().catch(console.error);