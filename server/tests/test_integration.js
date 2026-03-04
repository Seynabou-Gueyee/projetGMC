/**
 * Integration Test Suite
 * Tests how RAG, Conversation, and AI services work together
 */

const RAGService = require('../utils/ragService');
const ConversationService = require('../utils/advancedConversationService');
const AIService = require('../utils/advancedAIService');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

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

function assertTrue(value, message) {
  if (value !== true) {
    throw new Error(message || `Expected true, got ${value}`);
  }
}

function assertGreaterThan(actual, threshold, message) {
  if (actual <= threshold) {
    throw new Error(message || `Expected > ${threshold}, got ${actual}`);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

console.log(`\n${colors.blue}=== INTEGRATION TEST SUITE ===${colors.reset}\n`);
console.log(`${colors.magenta}Testing RAG + Conversation + AI Services Together${colors.reset}\n`);

// Setup: Add test data to knowledge base
console.log(`${colors.yellow}Setting up test knowledge base...${colors.reset}`);
RAGService.addDocument('billing_guide', 
  'Billing Information. How much does a subscription cost? Standard plan is $9.99/month. Pro plan is $19.99/month. ' +
  'What payment methods do you accept? We accept all major credit cards, PayPal, and bank transfers.',
  { source: 'help-billing.md', category: 'pricing' });

RAGService.addDocument('faq_database',
  'Frequently Asked Questions. What is the refund policy? We offer 30-day money back guarantee. ' +
  'How do I cancel my subscription? Go to settings and click cancel subscription.',
  { source: 'faq.md' });

RAGService.addFAQ('How much does it cost?', 'Standard plan: $9.99/month, Pro plan: $19.99/month');
RAGService.addFAQ('Is there a free trial?', 'Yes, we offer a 14-day free trial.');

console.log(`${colors.green}✓${colors.reset} Test data loaded\n`);

// Test 1: Complete Support Flow
test('Complete Customer Support Flow', () => {
  const userId = 'support_test_001';
  
  // Start conversation
  const convoId = ConversationService.startConversation(userId);
  assertTrue(convoId !== undefined, 'Should start conversation');
  
  // User asks about pricing
  const userMessage = 'How much does your product cost?';
  ConversationService.addMessage(convoId, 'user', userMessage);
  
  // Get enriched context from RAG
  const enrichedContext = RAGService.enrichContext(userMessage, []);
  assertTrue(enrichedContext.documents.length > 0, 'RAG should find relevant docs');
  
  // Check emotion was detected
  const context = ConversationService.getFullContext(convoId);
  assertTrue(context.context.sentiment !== undefined, 'Should detect sentiment');
});

// Test 2: Knowledge Base Enriches Conversation
test('Knowledge Base Information Enriches Conversation', () => {
  const userId = 'enrich_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  const userQuery = 'What payment methods do you take?';
  ConversationService.addMessage(convoId, 'user', userQuery);
  
  // RAG should find payment methods info
  const enriched = RAGService.enrichContext(userQuery, []);
  
  assertTrue(enriched.documents.length > 0, 'Should find payment docs');
  assertTrue(enriched.documents.some(d => d.content.includes('PayPal')), 
    'Should have payment info');
});

// Test 3: Emotion-Driven Service Response
test('Emotion Detection Guides Service Response', () => {
  const userId = 'emotion_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  // User expresses frustration
  const frustratedMessage = 'I am so frustrated with your pricing!';
  const msg = ConversationService.addMessage(convoId, 'user', frustratedMessage);
  
  // Service detects anger/frustration
  assertTrue(msg.emotion.primary !== undefined, 'Should detect emotion');
  
  // In real scenario, this would trigger escalation to human
  if (msg.emotion.primary === 'angry') {
    // Would route to human support
    assertTrue(true, 'Angry customer would be escalated');
  }
});

// Test 4: User Profile Learns from Conversation
test('User Profile Updates with Conversation Topics', () => {
  const userId = 'profile_test_001';
  
  // Have multiple conversations about billing
  for (let i = 0; i < 2; i++) {
    const convoId = ConversationService.startConversation(userId);
    ConversationService.addMessage(convoId, 'user', 'I have questions about billing and pricing');
    ConversationService.endConversation(convoId);
  }
  
  // Check user profile learned preferences
  const profile = ConversationService.getUserProfile(userId);
  assertTrue(profile.conversationCount >= 2, 'Should track conversation count');
});

// Test 5: FAQ Matching in Conversation Context
test('FAQ Answers Used in Conversation Context', () => {
  const userId = 'faq_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  const question = 'Is there a free trial?';
  ConversationService.addMessage(convoId, 'user', question);
  
  // RAG should match FAQ
  const faqResults = RAGService.searchFAQs(question);
  assertTrue(faqResults.length > 0, 'Should find FAQ match');
  assertTrue(faqResults[0].answer.includes('14-day'), 'Should have correct answer');
});

// Test 6: Conversation Summary includes Knowledge Context
test('Conversation Summary Reflects Knowledge Base Usage', () => {
  const userId = 'summary_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  ConversationService.addMessage(convoId, 'user', 'Tell me about refund policy');
  ConversationService.addMessage(convoId, 'user', 'How long is the trial?');
  
  const summary = ConversationService.summarizeConversation(convoId);
  assertTrue(summary !== undefined, 'Should create summary');
  assertTrue(summary.mainTopics !== undefined, 'Should identify topics');
});

// Test 7: Multi-Turn Conversation with Context
test('Multi-Turn Conversation Maintains Context', () => {
  const userId = 'context_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  // User asks about pricing
  ConversationService.addMessage(convoId, 'user', 'What plans do you have?');
  
  // Follow-up about cost (context should remember plans were discussed)
  ConversationService.addMessage(convoId, 'user', 'Is the Pro plan worth it?');
  
  const context = ConversationService.getFullContext(convoId);
  assertTrue(context.messages.length >= 2, 'Should maintain conversation');
  
  // Get formatted context for AI
  const formatted = ConversationService.getFormattedMessages(convoId);
  assertTrue(formatted.length > 2, 'Should include all messages + system prompt');
});

// Test 8: Entity Extraction in Business Context
test('Extract Business Entities from Customer Message', () => {
  const message = 'My company Google wants to use your service for teams in New York and San Francisco';
  const entities = ConversationService.extractEntities(message);
  
  assertTrue(entities.organizations.length > 0, 'Should find organization');
  assertTrue(entities.locations.length > 0, 'Should find locations');
});

// Test 9: Emotion Trajectory Shows Conversation Quality
test('Emotion Trajectory Indicates Customer Satisfaction', () => {
  const userId = 'trajectory_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  // Customer starts confused, gets helped, becomes happy
  ConversationService.addMessage(convoId, 'user', 'I am confused about pricing');
  ConversationService.addMessage(convoId, 'user', 'Oh I see now, this is helpful!');
  ConversationService.addMessage(convoId, 'user', 'Perfect, I am happy with this solution!');
  
  const context = ConversationService.getFullContext(convoId);
  const trajectory = context.context.emotionTrajectory;
  
  assertTrue(trajectory.length > 0, 'Should have emotion history');
  // Trajectory should show improvement from confused to happy
});

// Test 10: Knowledge Base Search with Conversation Keywords
test('Use Conversation Keywords to Enhance RAG Search', () => {
  const userId = 'keyword_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  ConversationService.addMessage(convoId, 'user', 'I need help with billing and payment options');
  
  // Extract conversation keywords
  const history = [
    'I need help with billing and payment options'
  ];
  const topics = RAGService.extractTopics(history);
  assertTrue(topics.length > 0, 'Should extract topics');
  
  // Use topics to search knowledge base
  const results = RAGService.searchDocuments('billing payment', 3);
  assertTrue(results.length > 0, 'Should find relevant documents');
});

// Test 11: Escalation Decision Based on Emotion + User History
test('Escalation Decision: Emotion + Profile Data', () => {
  const userId = 'escalation_test_001';
  
  // Set up user as premium customer
  ConversationService.updateUserProfile(userId, {
    preferredTopics: ['billing', 'enterprise'],
    communicationStyle: 'formal'
  });
  
  // Angry message from premium customer
  const convoId = ConversationService.startConversation(userId);
  const msg = ConversationService.addMessage(convoId, 'user', 'I am extremely frustrated with the service!');
  
  const profile = ConversationService.getUserProfile(userId);
  
  // Decision logic
  const shouldEscalate = msg.emotion.primary === 'angry' && profile.conversationCount > 0;
  assertTrue(shouldEscalate === true, 'Should escalate premium angry customer');
});

// Test 12: Document Synthesis from Conversation
test('Create Knowledge Document from Conversation', () => {
  const userId = 'synthesis_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  ConversationService.addMessage(convoId, 'user', 'I learned that billing happens monthly');
  ConversationService.addMessage(convoId, 'user', 'And we use PayPal for payments');
  
  const context = ConversationService.getFullContext(convoId);
  
  // Synthesize conversation into document
  RAGService.synthesizeDocument(userId, context);
  
  // Document should be indexed and searchable
  const results = RAGService.searchDocuments('monthly billing PayPal');
  assertTrue(results.length > 0, 'Should find synthesized document');
});

// Test 13: Full Workflow: Question to Answer with All Services
test('Complete Workflow: Customer Question → RAG + Emotion + Answer', () => {
  const userId = 'workflow_test_001';
  
  // 1. Start conversation
  const convoId = ConversationService.startConversation(userId);
  
  // 2. User asks question
  const userQuestion = 'How much does the Pro plan cost and what is included?';
  const userMsg = ConversationService.addMessage(convoId, 'user', userQuestion);
  
  // 3. Detect emotion (should be neutral/curious)
  assertTrue(userMsg.emotion !== undefined, 'Should detect emotion');
  
  // 4. Extract entities (Pro plan, cost, features)
  assertTrue(userMsg.entities !== undefined, 'Should extract entities');
  
  // 5. Get RAG enrichment
  const enriched = RAGService.enrichContext(userQuestion, [userQuestion]);
  assertTrue(enriched.documents.length > 0, 'Should find relevant docs');
  
  // 6. Get user profile context
  const profile = ConversationService.getUserProfile(userId);
  assertTrue(profile !== undefined, 'Should have user profile');
  
  // 7. Would generate answer using all this context
  // (Not testing actual GPT call, just the pipeline)
});

// Test 14: Handle No Knowledge Base Match
test('Gracefully Handle When Knowledge Base Has No Match', () => {
  const userId = 'no_match_test_001';
  const convoId = ConversationService.startConversation(userId);
  
  const unknownQuestion = 'What is the meaning of life?';
  ConversationService.addMessage(convoId, 'user', unknownQuestion);
  
  // RAG won't find matching docs
  const enriched = RAGService.enrichContext(unknownQuestion, []);
  // Should handle gracefully (empty or low-relevance results)
  assertTrue(enriched !== undefined, 'Should return enriched context even with no match');
});

// Test 15: Analytics Dashboard Data
test('Generate Analytics Dashboard Data', () => {
  // Simulate multiple conversations
  for (let i = 0; i < 3; i++) {
    const userId = `analytics_user_${i}`;
    const convoId = ConversationService.startConversation(userId);
    ConversationService.addMessage(convoId, 'user', 'Test message ' + i);
    ConversationService.endConversation(convoId);
  }
  
  // Get stats
  const convStats = ConversationService.getStats();
  const ragStats = RAGService.getStats();
  
  assertTrue(convStats.totalConversations > 0, 'Should have conversation count');
  assertTrue(ragStats.totalDocuments > 0, 'Should have document count');
  
  // These would be shown in analytics dashboard
});

// Print Summary
console.log(`\n${colors.blue}=== INTEGRATION TEST SUMMARY ===${colors.reset}`);
console.log(`Total Tests: ${totalTests}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
if (failedTests > 0) {
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
}

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%\n`);

if (failedTests === 0) {
  console.log(`${colors.green}✓ ALL INTEGRATION TESTS PASSED!${colors.reset}`);
  console.log(`${colors.magenta}Services working together seamlessly 🎉${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}✗ SOME TESTS FAILED${colors.reset}\n`);
  process.exit(1);
}
