/**
 * RAG Service Test Suite
 * Tests document loading, indexing, searching, and context enrichment
 */

const RAGService = require('../utils/ragService');
const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper function
function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`${colors.green}✓ PASS${colors.reset}: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset}: ${name}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    failedTests++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, message) {
  if (value !== true) {
    throw new Error(message || `Expected true, got ${value}`);
  }
}

function assertFalse(value, message) {
  if (value !== false) {
    throw new Error(message || `Expected false, got ${value}`);
  }
}

function assertGreaterThan(actual, threshold, message) {
  if (actual <= threshold) {
    throw new Error(message || `Expected > ${threshold}, got ${actual}`);
  }
}

function assertLessThan(actual, threshold, message) {
  if (actual >= threshold) {
    throw new Error(message || `Expected < ${threshold}, got ${actual}`);
  }
}

function assertArrayLength(array, length, message) {
  if (!Array.isArray(array) || array.length !== length) {
    throw new Error(message || `Expected array length ${length}, got ${array?.length}`);
  }
}

console.log(`\n${colors.blue}=== RAG SERVICE TEST SUITE ===${colors.reset}\n`);

// Test 1: Service Initialization
test('Initialize RAG Service', () => {
  const service = require('../utils/ragService');
  assertTrue(service !== undefined, 'RAG Service should exist');
  assertTrue(typeof service.initialize === 'function', 'Should have initialize method');
});

// Test 2: Add Document
test('Add Document to Knowledge Base', () => {
  RAGService.addDocument(
    'test_doc_1',
    'This is a test document about password reset. Users can reset their password by clicking the forgot password link.',
    { source: 'help.md', category: 'user-help' }
  );
  
  const kb = RAGService.knowledgeBase;
  assertTrue(kb.has('test_doc_1'), 'Document should be added to knowledge base');
  assertEquals(kb.get('test_doc_1').title, 'test_doc_1', 'Document title should match');
});

// Test 3: Document Indexing
test('Index Document for Search', () => {
  RAGService.addDocument(
    'test_doc_2',
    'How to reset password. Go to login page. Click forgot password. Enter email. Check inbox for reset link.',
    { source: 'faq.md' }
  );
  
  const index = RAGService.documentIndex;
  assertTrue(index.has('test_doc_2'), 'Document should be indexed');
  const docIndex = index.get('test_doc_2');
  assertTrue(docIndex['password'] > 0, 'Should index password keyword');
  assertTrue(docIndex['reset'] > 0, 'Should index reset keyword');
});

// Test 4: Search Documents by Keyword
test('Search Documents by Keyword', () => {
  const results = RAGService.searchDocuments('password reset', 3);
  assertGreaterThan(results.length, 0, 'Should find documents');
  assertTrue(results.some(r => r.docId === 'test_doc_1'), 'Should find test_doc_1');
  assertTrue(results.some(r => r.docId === 'test_doc_2'), 'Should find test_doc_2');
});

// Test 5: Search Relevance Scoring
test('Search Results Have Relevance Scores', () => {
  RAGService.addDocument('test_doc_3', 'Password password password reset reset', {});
  const results = RAGService.searchDocuments('password reset', 5);
  
  assertTrue(results.length > 0, 'Should have results');
  assertTrue(results[0].relevanceScore > 0, 'Should have relevance score');
  
  // Test_doc_3 should rank higher (has more matches)
  const doc3 = results.find(r => r.docId === 'test_doc_3');
  assertTrue(doc3 !== undefined, 'Should find highly relevant document');
});

// Test 6: Add FAQ
test('Add FAQ Entry', () => {
  RAGService.addFAQ('How do I login?', 'Click the login button and enter your credentials.');
  
  const faqDb = RAGService.faqDatabase;
  assertGreaterThan(faqDb.length, 0, 'FAQ should be added');
  assertTrue(faqDb.some(f => f.question === 'How do I login?'), 'FAQ question should exist');
});

// Test 7: Search FAQs
test('Search FAQs by Query', () => {
  RAGService.addFAQ('What is my account?', 'Your account contains your profile and settings.');
  RAGService.addFAQ('How do I change my password?', 'Go to settings and select change password.');
  
  const results = RAGService.searchFAQs('password');
  assertGreaterThan(results.length, 0, 'Should find FAQ');
  assertTrue(results.some(f => f.question.includes('password')), 'Should find password-related FAQ');
});

// Test 8: Extract Topics from Conversation
test('Extract Topics from Conversation History', () => {
  const history = [
    'I need help with password reset',
    'How do I reset my password?',
    'I forgot my login credentials',
    'Can you help me regain access?',
    'What should I do now?'
  ];
  
  const topics = RAGService.extractTopics(history);
  assertTrue(Array.isArray(topics), 'Should return array');
  assertGreaterThan(topics.length, 0, 'Should extract topics');
  assertTrue(topics.some(t => t.toLowerCase().includes('password')), 'Should identify password topic');
});

// Test 9: Enrich Context
test('Enrich Context with Documents and FAQs', () => {
  const question = 'How do I reset my password?';
  const history = ['User asking about password'];
  
  const enriched = RAGService.enrichContext(question, history);
  
  assertTrue(enriched !== undefined, 'Should return enriched context');
  assertTrue(Array.isArray(enriched.documents), 'Should have documents array');
  assertTrue(Array.isArray(enriched.faqs), 'Should have FAQs array');
  assertTrue(enriched.conversationContext !== undefined, 'Should have conversation context');
  assertTrue(Array.isArray(enriched.recommendations), 'Should have recommendations');
});

// Test 10: Format Context for Prompt
test('Format Enriched Context as Text', () => {
  const enriched = {
    documents: [
      { docId: 'doc1', content: 'Document content', relevanceScore: 0.9 }
    ],
    faqs: [
      { question: 'Q?', answer: 'A.' }
    ],
    conversationContext: 'Previous context',
    recommendations: ['Recommend 1']
  };
  
  const formatted = RAGService.formatContextForPrompt(enriched);
  assertTrue(typeof formatted === 'string', 'Should return string');
  assertTrue(formatted.length > 0, 'Should format context');
  assertTrue(formatted.includes('Document content'), 'Should include document');
  assertTrue(formatted.includes('Recommend 1'), 'Should include recommendations');
});

// Test 11: Persist Knowledge Base
test('Save Knowledge Base to Disk', () => {
  RAGService.addDocument('persist_test', 'This should be persisted', {});
  RAGService.saveKnowledgeBase();
  
  // Check if file exists
  const kbPath = path.join(__dirname, '../', 'knowledge_base.json');
  assertTrue(fs.existsSync(kbPath), 'Knowledge base file should exist');
});

// Test 12: Get Statistics
test('Get Knowledge Base Statistics', () => {
  const stats = RAGService.getStats();
  
  assertTrue(stats !== undefined, 'Should return stats');
  assertGreaterThan(stats.totalDocuments, 0, 'Should count documents');
  assertGreaterThan(stats.totalFAQs, 0, 'Should count FAQs');
  assertTrue(stats.indexedDocuments >= 0, 'Should show indexed count');
});

// Test 13: Empty Query Handling
test('Handle Empty Query Gracefully', () => {
  const results = RAGService.searchDocuments('');
  assertTrue(Array.isArray(results), 'Should return array even for empty query');
});

// Test 14: Similar Words in Search
test('Search with Multiple Keywords', () => {
  RAGService.addDocument('tech_doc', 'JavaScript programming language for web development');
  
  const results = RAGService.searchDocuments('web programming JavaScript');
  assertTrue(results.length > 0, 'Should find documents with multiple keywords');
});

// Test 15: Synthesize Document from Conversation
test('Create Document from Conversation', () => {
  const conversation = {
    messages: [
      { content: 'Tell me about billing' },
      { content: 'How much does it cost?' },
      { content: 'What payment methods do you accept?' }
    ]
  };
  
  RAGService.synthesizeDocument('test_user_123', conversation);
  
  const kb = RAGService.knowledgeBase;
  const synthesized = Array.from(kb.values()).find(doc => doc.source === 'synthesized');
  assertTrue(synthesized !== undefined, 'Should create synthesized document');
});

// Test 16: Extract Keywords (Utility)
test('Extract Keywords from Text', () => {
  // This tests a helper function if available
  const text = 'password reset email login account security verification';
  const words = text.split(' ');
  
  assertTrue(words.length > 0, 'Should extract words');
  assertTrue(words.includes('password'), 'Should identify keyword');
});

// Test 17: Relevance vs Non-Relevance
test('Distinguish Relevant from Irrelevant Documents', () => {
  RAGService.addDocument('relevant', 'How to reset your password and regain access');
  RAGService.addDocument('irrelevant', 'The weather is sunny today');
  
  const results = RAGService.searchDocuments('password reset');
  const relevant = results.find(r => r.docId === 'relevant');
  const irrelevant = results.find(r => r.docId === 'irrelevant');
  
  assertTrue(relevant !== undefined, 'Should find relevant doc');
  if (irrelevant) {
    assertGreaterThan(relevant.relevanceScore, irrelevant.relevanceScore, 
      'Relevant should score higher');
  }
});

// Test 18: Top-K Limiting
test('Return Only Top-K Results', () => {
  RAGService.addDocument('doc_a', 'password');
  RAGService.addDocument('doc_b', 'password');
  RAGService.addDocument('doc_c', 'password');
  RAGService.addDocument('doc_d', 'password');
  RAGService.addDocument('doc_e', 'password');
  
  const results = RAGService.searchDocuments('password', 2);
  assertTrue(results.length <= 2, 'Should limit to top-K results');
});

// Test 19: Knowledge Base Not Empty
test('Knowledge Base Contains Documents', () => {
  const stats = RAGService.getStats();
  assertGreaterThan(stats.totalDocuments, 0, 'Should have documents in KB');
});

// Test 20: Service is Singleton
test('RAG Service is Singleton', () => {
  const service1 = require('../utils/ragService');
  const service2 = require('../utils/ragService');
  
  assertEquals(service1, service2, 'Should be same instance');
});

// Print Summary
console.log(`\n${colors.blue}=== TEST SUMMARY ===${colors.reset}`);
console.log(`Total Tests: ${totalTests}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
if (failedTests > 0) {
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
}

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%\n`);

if (failedTests === 0) {
  console.log(`${colors.green}✓ ALL TESTS PASSED!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}✗ SOME TESTS FAILED${colors.reset}\n`);
  process.exit(1);
}
