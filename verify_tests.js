#!/usr/bin/env node

/**
 * Test Verification Script
 * Verifies all test files exist and are valid
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

console.log(`\n${colors.blue}🔍 Verifying test setup...${colors.reset}\n`);

const requiredFiles = [
  // Service files (must exist for tests to run)
  {
    path: 'server/utils/ragService.js',
    name: 'RAG Service',
    required: true
  },
  {
    path: 'server/utils/advancedConversationService.js',
    name: 'Conversation Service',
    required: true
  },
  {
    path: 'server/config/openSourceModelsConfig.js',
    name: 'Open-Source Models Config',
    required: true
  },

  // Test files
  {
    path: 'server/tests/test_rag_service.js',
    name: 'RAG Service Tests',
    required: true
  },
  {
    path: 'server/tests/test_conversation_service.js',
    name: 'Conversation Service Tests',
    required: true
  },
  {
    path: 'server/tests/test_integration.js',
    name: 'Integration Tests',
    required: true
  },
  {
    path: 'server/tests/test_fixtures.js',
    name: 'Test Fixtures',
    required: false
  },

  // Documentation
  {
    path: 'TESTING_GUIDE.md',
    name: 'Testing Guide Documentation',
    required: false
  },
  {
    path: 'run_tests.js',
    name: 'Test Runner Script',
    required: false
  },
];

let allOk = true;
let requiredMissing = [];

console.log(`${colors.yellow}Checking files...${colors.reset}\n`);

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`${colors.green}✓${colors.reset} ${file.name}`);
    console.log(`  Location: ${file.path}`);
    console.log(`  Size: ${sizeKB} KB\n`);
  } else {
    if (file.required) {
      console.log(`${colors.red}✗${colors.reset} ${file.name} ${colors.red}(REQUIRED)${colors.reset}`);
      requiredMissing.push(file.path);
      allOk = false;
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} ${file.name} ${colors.yellow}(optional)${colors.reset}`);
    }
    console.log(`  Location: ${file.path}\n`);
  }
});

console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);

if (allOk) {
  console.log(`\n${colors.green}✓ All required files present!${colors.reset}\n`);
  console.log(`${colors.yellow}Ready to run tests:${colors.reset}\n`);
  console.log(`  Option 1: node run_tests.js`);
  console.log(`  Option 2: node server/tests/test_rag_service.js`);
  console.log(`  Option 3: node server/tests/test_conversation_service.js`);
  console.log(`  Option 4: node server/tests/test_integration.js\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}✗ Some required files are missing!${colors.reset}\n`);
  console.log(`${colors.red}Missing files:${colors.reset}`);
  requiredMissing.forEach(f => console.log(`  - ${f}`));
  console.log(`\n${colors.yellow}Please ensure all service files are in place before running tests.${colors.reset}\n`);
  process.exit(1);
}
