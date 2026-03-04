#!/usr/bin/env node

/**
 * Run All Integration Tests
 * Executes RAG, Conversation, and Integration test suites
 * 
 * Usage:
 *   node run_tests.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

const TESTS = [
  {
    name: 'RAG Service Tests',
    file: 'server/tests/test_rag_service.js',
    description: 'Testing document indexing, search, and knowledge enrichment'
  },
  {
    name: 'Conversation Service Tests',
    file: 'server/tests/test_conversation_service.js',
    description: 'Testing emotion detection, entity extraction, and user profiles'
  },
  {
    name: 'Integration Tests',
    file: 'server/tests/test_integration.js',
    description: 'Testing how all services work together'
  }
];

let currentTest = 0;
const results = [];
let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;

function printHeader() {
  console.clear();
  console.log(`\n${colors.blue}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║${colors.reset}        ${colors.magenta}🧪 WAVE 2 INTEGRATION TEST SUITE 🧪${colors.reset}        ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);
  console.log(`${colors.yellow}Running ${TESTS.length} test suites...${colors.reset}\n`);
}

function runNextTest() {
  if (currentTest >= TESTS.length) {
    printSummary();
    return;
  }

  const test = TESTS[currentTest];
  const testNumber = currentTest + 1;

  console.log(`${colors.blue}─────────────────────────────────────────────────────────${colors.reset}`);
  console.log(`${colors.magenta}[${testNumber}/${TESTS.length}] ${test.name}${colors.reset}`);
  console.log(`${colors.yellow}${test.description}${colors.reset}`);
  console.log(`${colors.blue}─────────────────────────────────────────────────────────${colors.reset}\n`);

  const testPath = path.resolve(__dirname, test.file);
  
  if (!fs.existsSync(testPath)) {
    console.log(`${colors.red}✗ ERROR: Test file not found: ${test.file}${colors.reset}\n`);
    results.push({
      name: test.name,
      passed: 0,
      failed: 1,
      error: 'Test file not found'
    });
    currentTest++;
    setTimeout(runNextTest, 100);
    return;
  }

  const child = spawn('node', [testPath]);

  let output = '';
  let testsPassed = 0;
  let testsFailed = 0;

  child.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    process.stdout.write(text);

    // Parse test results
    if (text.includes('Passed:')) {
      const match = text.match(/Passed: (\d+)/);
      if (match) testsPassed = parseInt(match[1]);
    }
    if (text.includes('Failed:')) {
      const match = text.match(/Failed: (\d+)/);
      if (match) testsFailed = parseInt(match[1]);
    }
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    process.stderr.write(text);
    output += text;
  });

  child.on('close', (code) => {
    if (code === 0) {
      results.push({
        name: test.name,
        passed: testsPassed || 1,
        failed: testsFailed || 0,
        status: 'PASS'
      });
    } else {
      results.push({
        name: test.name,
        passed: testsPassed || 0,
        failed: testsFailed || 1,
        status: 'FAIL'
      });
    }

    console.log('\n');
    currentTest++;
    setTimeout(runNextTest, 500);
  });
}

function printSummary() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}║${colors.reset}           ${colors.yellow}📊 TEST SUITE RESULTS 📊${colors.reset}            ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Individual results
  results.forEach((result, index) => {
    const passed = result.passed || 0;
    const failed = result.failed || 0;
    const total = passed + failed;
    const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

    totalPassed += passed;
    totalFailed += failed;
    totalTests += total;

    if (result.status === 'PASS' || failed === 0) {
      console.log(`${colors.green}✓${colors.reset} ${result.name}`);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${result.name}`);
    }

    console.log(`  Passed: ${colors.green}${passed}${colors.reset} | Failed: ${failed > 0 ? colors.red + failed + colors.reset : failed}`);
    console.log(`  Success Rate: ${rate}%\n`);
  });

  // Overall summary
  console.log(`${colors.blue}─────────────────────────────────────────────────────────${colors.reset}`);
  console.log(`${colors.magenta}Overall Results:${colors.reset}`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ${colors.green}Passed: ${totalPassed}${colors.reset}`);
  if (totalFailed > 0) {
    console.log(`  ${colors.red}Failed: ${totalFailed}${colors.reset}`);
  }

  const overallRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';
  console.log(`  Success Rate: ${overallRate}%\n`);

  // Final verdict
  if (totalFailed === 0) {
    console.log(`${colors.green}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║${colors.reset}  ${colors.green}✓ ALL TESTS PASSED! 🎉${colors.reset}                      ${colors.green}║${colors.reset}`);
    console.log(`${colors.green}║${colors.reset}  Integration testing successful!                  ${colors.green}║${colors.reset}`);
    console.log(`${colors.green}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);
    console.log(`${colors.yellow}Next steps:${colors.reset}`);
    console.log(`  1. Create knowledge base: mkdir knowledge`);
    console.log(`  2. Add documents to knowledge/ folder`);
    console.log(`  3. Integrate services into messageController`);
    console.log(`  4. Test with real conversation flows`);
    console.log(`  5. Deploy to production\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.red}║${colors.reset}  ${colors.red}✗ SOME TESTS FAILED${colors.reset}                       ${colors.red}║${colors.reset}`);
    console.log(`${colors.red}║${colors.reset}  Review the errors above and fix issues              ${colors.red}║${colors.reset}`);
    console.log(`${colors.red}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);
    console.log(`${colors.yellow}Troubleshooting:${colors.reset}`);
    console.log(`  1. Review failed test output above`);
    console.log(`  2. Check service implementation`);
    console.log(`  3. Verify test data setup`);
    console.log(`  4. Run individual test: node ${TESTS[0].file}\n`);
    process.exit(1);
  }
}

// Start tests
printHeader();
runNextTest();
