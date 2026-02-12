#!/usr/bin/env node

/**
 * Test HeadyBuddy Automation Engine
 */

const HeadyBuddyAutomation = require('./automation-engine');

async function testAutomation() {
  console.log('🧪 Testing HeadyBuddy Automation Engine...\n');
  
  const automation = new HeadyBuddyAutomation();
  
  try {
    // Test 1: Initialize
    console.log('1️⃣ Testing initialization...');
    const initSuccess = await automation.init();
    console.log(`   ✅ Initialization: ${initSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    // Test 2: Get available notebooks
    console.log('\n2️⃣ Testing notebook detection...');
    const notebooks = automation.getAvailableNotebooks();
    console.log(`   📓 Found ${notebooks.length} notebooks:`);
    notebooks.forEach(nb => {
      console.log(`      - ${nb.name}: ${nb.file} (${nb.exists ? '✅' : '❌'})`);
    });
    
    // Test 3: Create page
    console.log('\n3️⃣ Testing page creation...');
    const page = await automation.createPage('test');
    console.log(`   📄 Page created: ${page ? 'SUCCESS' : 'FAILED'}`);
    
    // Test 4: Navigate to test site
    console.log('\n4️⃣ Testing navigation...');
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    const title = await page.title();
    console.log(`   🌐 Navigated to: ${title}`);
    
    // Test 5: Take screenshot
    console.log('\n5️⃣ Testing screenshot...');
    const screenshotPath = await automation.screenshot('test', 'test-screenshot.png');
    console.log(`   📸 Screenshot: ${screenshotPath}`);
    
    // Test 6: Close page
    console.log('\n6️⃣ Testing page cleanup...');
    await automation.closePage('test');
    console.log('   🔒 Page closed: SUCCESS');
    
    console.log('\n✨ All tests passed! Automation engine is ready.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Cleanup
    await automation.close();
    console.log('\n🔒 Automation engine closed');
  }
}

if (require.main === module) {
  testAutomation();
}

module.exports = testAutomation;
