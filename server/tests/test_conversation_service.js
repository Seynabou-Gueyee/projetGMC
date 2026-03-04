/**
 * Advanced Conversation Service Test Suite
 * Tests emotion detection, entity extraction, user profiles, and analytics
 */

const ConversationService = require('../utils/advancedConversationService');

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

// Helper functions
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

function assertInRange(value, min, max, message) {
  if (value < min || value > max) {
    throw new Error(message || `Expected between ${min} and ${max}, got ${value}`);
  }
}

function assertArrayLength(array, length, message) {
  if (!Array.isArray(array) || array.length !== length) {
    throw new Error(message || `Expected array length ${length}, got ${array?.length}`);
  }
}

console.log(`\n${colors.blue}=== CONVERSATION SERVICE TEST SUITE ===${colors.reset}\n`);

// Test 1: Service Initialization
test('Initialize Conversation Service', () => {
  const service = require('../utils/advancedConversationService');
  assertTrue(service !== undefined, 'Service should exist');
  assertTrue(typeof service.startConversation === 'function', 'Should have startConversation method');
});

// Test 2: Start Conversation
test('Start New Conversation', () => {
  const convoId = ConversationService.startConversation('user_001', { platform: 'web' });
  
  assertTrue(convoId !== undefined, 'Should return conversation ID');
  assertTrue(typeof convoId === 'string', 'Should return string ID');
  assertTrue(convoId.length > 0, 'Should return non-empty ID');
});

// Test 3: Add User Message
test('Add User Message to Conversation', () => {
  const convoId = ConversationService.startConversation('user_002');
  const message = ConversationService.addMessage(convoId, 'user', 'Hello!');
  
  assertTrue(message !== undefined, 'Should return message object');
  assertEquals(message.role, 'user', 'Should be user message');
  assertEquals(message.content, 'Hello!', 'Should preserve content');
  assertTrue(message.timestamp !== undefined, 'Should add timestamp');
});

// Test 4: Emotion Detection - Happy
test('Detect Happy Emotion', () => {
  const emotion = ConversationService.detectEmotion('I am so happy and excited today!');
  
  assertTrue(emotion.primary !== undefined, 'Should have primary emotion');
  assertTrue(['happy', 'excited'].includes(emotion.primary), 'Should detect positive emotion');
  assertGreaterThan(emotion.confidence, 0, 'Should have confidence > 0');
  assertLessThan(emotion.confidence, 1.1, 'Confidence should be <= 1');
});

// Test 5: Emotion Detection - Sad
test('Detect Sad Emotion', () => {
  const emotion = ConversationService.detectEmotion('I am really sad and disappointed right now');
  
  assertTrue(emotion.primary === 'sad', 'Should detect sad emotion');
  assertGreaterThan(emotion.confidence, 0, 'Should have confidence');
});

// Test 6: Emotion Detection - Angry
test('Detect Angry Emotion', () => {
  const emotion = ConversationService.detectEmotion('I am so frustrated and angry!');
  
  assertTrue(emotion.primary === 'angry', 'Should detect angry emotion');
  assertGreaterThan(emotion.confidence, 0, 'Should have confidence');
});

// Test 7: Emotion Detection - Confused
test('Detect Confused Emotion', () => {
  const emotion = ConversationService.detectEmotion('I am really confused and lost');
  
  assertTrue(emotion.primary === 'confused', 'Should detect confused emotion');
  assertGreaterThan(emotion.confidence, 0, 'Should have confidence');
});

// Test 8: Emotion Detection - Excited
test('Detect Excited Emotion', () => {
  const emotion = ConversationService.detectEmotion('I am so excited and energetic!');
  
  assertTrue(emotion.primary === 'excited', 'Should detect excited emotion');
  assertGreaterThan(emotion.confidence, 0, 'Should have confidence');
});

// Test 9: Emotion Has All Scores
test('Emotion Object Contains All Emotion Scores', () => {
  const emotion = ConversationService.detectEmotion('Hello there');
  
  assertTrue(emotion.scores !== undefined, 'Should have scores object');
  assertTrue(emotion.scores.happy !== undefined, 'Should have happy score');
  assertTrue(emotion.scores.sad !== undefined, 'Should have sad score');
  assertTrue(emotion.scores.angry !== undefined, 'Should have angry score');
  assertTrue(emotion.scores.confused !== undefined, 'Should have confused score');
  assertTrue(emotion.scores.excited !== undefined, 'Should have excited score');
});

// Test 10: Entity Extraction
test('Extract Entities from Text', () => {
  const text = 'My name is John and I work at Google in New York';
  const entities = ConversationService.extractEntities(text);
  
  assertTrue(entities !== undefined, 'Should return entities');
  assertTrue(Array.isArray(entities.names), 'Should have names array');
  assertTrue(Array.isArray(entities.locations), 'Should have locations array');
  assertTrue(Array.isArray(entities.organizations), 'Should have organizations array');
});

// Test 11: Extract Keywords
test('Extract Keywords from Message', () => {
  const keywords = ConversationService.extractKeywords('password reset email login account');
  
  assertTrue(Array.isArray(keywords), 'Should return array');
  assertGreaterThan(keywords.length, 0, 'Should extract keywords');
  assertTrue(keywords.length <= 5, 'Should max 5 keywords');
});

// Test 12: Message Includes Emotion
test('Message Includes Detected Emotion', () => {
  const convoId = ConversationService.startConversation('user_003');
  const message = ConversationService.addMessage(convoId, 'user', 'I am so happy!');
  
  assertTrue(message.emotion !== undefined, 'Should have emotion field');
  assertTrue(message.emotion.primary !== undefined, 'Should have primary emotion');
  assertTrue(message.emotion.scores !== undefined, 'Should have scores');
  assertTrue(message.emotion.confidence !== undefined, 'Should have confidence');
});

// Test 13: Message Includes Entities
test('Message Includes Extracted Entities', () => {
  const convoId = ConversationService.startConversation('user_004');
  const message = ConversationService.addMessage(convoId, 'user', 'My name is Alice and I work at Microsoft');
  
  assertTrue(message.entities !== undefined, 'Should have entities field');
  assertTrue(Array.isArray(message.entities.names), 'Should have names');
  assertTrue(Array.isArray(message.entities.organizations), 'Should have organizations');
});

// Test 14: Message Includes Keywords
test('Message Includes Extracted Keywords', () => {
  const convoId = ConversationService.startConversation('user_005');
  const message = ConversationService.addMessage(convoId, 'user', 'billing payment cost pricing');
  
  assertTrue(Array.isArray(message.keywords), 'Should have keywords array');
  assertGreaterThan(message.keywords.length, 0, 'Should have extracted keywords');
});

// Test 15: Get Full Context
test('Get Complete Conversation Context', () => {
  const convoId = ConversationService.startConversation('user_006');
  ConversationService.addMessage(convoId, 'user', 'Hello!');
  ConversationService.addMessage(convoId, 'assistant', 'Hi there!');
  
  const context = ConversationService.getFullContext(convoId);
  
  assertTrue(context !== undefined, 'Should return context');
  assertTrue(Array.isArray(context.messages), 'Should have messages');
  assertTrue(context.context.sentiment !== undefined, 'Should have sentiment');
  assertGreaterThan(context.messages.length, 0, 'Should have messages in context');
});

// Test 16: Get Formatted Messages for AI
test('Get Messages Formatted for AI', () => {
  const convoId = ConversationService.startConversation('user_007');
  ConversationService.addMessage(convoId, 'user', 'What is Python?');
  ConversationService.addMessage(convoId, 'assistant', 'Python is a programming language');
  
  const formatted = ConversationService.getFormattedMessages(convoId);
  
  assertTrue(Array.isArray(formatted), 'Should return array');
  assertGreaterThan(formatted.length, 2, 'Should include system message + user + assistant');
});

// Test 17: Summarize Conversation
test('Create Conversation Summary', () => {
  const convoId = ConversationService.startConversation('user_008');
  ConversationService.addMessage(convoId, 'user', 'How does billing work?');
  ConversationService.addMessage(convoId, 'assistant', 'We charge monthly');
  ConversationService.addMessage(convoId, 'user', 'What payment methods?');
  
  const summary = ConversationService.summarizeConversation(convoId);
  
  assertTrue(summary !== undefined, 'Should return summary');
  assertTrue(summary.mainTopics !== undefined, 'Should have main topics');
  assertTrue(summary.userSatisfaction !== undefined, 'Should have satisfaction score');
});

// Test 18: User Profile Management
test('Create User Profile', () => {
  const profile = ConversationService.getUserProfile('user_009');
  
  assertTrue(profile !== undefined, 'Should return profile');
  assertTrue(profile.userId === 'user_009', 'Should have user ID');
  assertTrue(profile.conversationCount >= 0, 'Should initialize conversation count');
});

// Test 19: Update User Profile
test('Update User Profile Preferences', () => {
  const userId = 'user_010';
  ConversationService.updateUserProfile(userId, { 
    preferredTopics: ['python', 'javascript'],
    language: 'en'
  });
  
  const profile = ConversationService.getUserProfile(userId);
  assertTrue(profile.preferredTopics.includes('python'), 'Should update preferences');
});

// Test 20: Get User Conversation Trends
test('Analyze User Conversation Trends', () => {
  const userId = 'user_011';
  
  // Create some conversations
  const convo1 = ConversationService.startConversation(userId);
  ConversationService.addMessage(convo1, 'user', 'I am happy!');
  ConversationService.endConversation(convo1);
  
  const convo2 = ConversationService.startConversation(userId);
  ConversationService.addMessage(convo2, 'user', 'This is great!');
  ConversationService.endConversation(convo2);
  
  const trends = ConversationService.getUserConversationTrends(userId);
  
  assertTrue(trends !== undefined, 'Should return trends');
  assertTrue(trends.conversationCount >= 2, 'Should count conversations');
});

// Test 21: End Conversation
test('End Conversation and Archive', () => {
  const convoId = ConversationService.startConversation('user_012');
  ConversationService.addMessage(convoId, 'user', 'Hello');
  
  ConversationService.endConversation(convoId);
  
  // Conversation should still exist but be marked as ended
  const context = ConversationService.getFullContext(convoId);
  assertTrue(context !== undefined, 'Should still access ended conversation');
});

// Test 22: Export Conversation
test('Export Conversation as JSON', () => {
  const convoId = ConversationService.startConversation('user_013');
  ConversationService.addMessage(convoId, 'user', 'Test message');
  
  const exported = ConversationService.exportConversation(convoId, 'json');
  
  assertTrue(exported !== undefined, 'Should export conversation');
  assertTrue(typeof exported === 'string', 'Should return JSON string');
});

// Test 23: Estimate Satisfaction
test('Calculate User Satisfaction Score', () => {
  const convoId = ConversationService.startConversation('user_014');
  ConversationService.addMessage(convoId, 'user', 'I am happy with the service!');
  
  const context = ConversationService.getFullContext(convoId);
  const satisfaction = ConversationService.estimateSatisfaction(context);
  
  assertInRange(satisfaction, 0, 1, 'Satisfaction should be 0-1');
});

// Test 24: Emotion Trajectory Tracking
test('Track Emotion Trajectory Over Conversation', () => {
  const convoId = ConversationService.startConversation('user_015');
  ConversationService.addMessage(convoId, 'user', 'I am frustrated'); // angry
  ConversationService.addMessage(convoId, 'user', 'Actually, I feel better now'); // happy
  ConversationService.addMessage(convoId, 'user', 'Things are improving!'); // excited
  
  const context = ConversationService.getFullContext(convoId);
  const trajectory = context.context.emotionTrajectory;
  
  assertTrue(Array.isArray(trajectory), 'Should have trajectory array');
  assertGreaterThan(trajectory.length, 0, 'Should have emotion history');
});

// Test 25: Service is Singleton
test('Conversation Service is Singleton', () => {
  const service1 = require('../utils/advancedConversationService');
  const service2 = require('../utils/advancedConversationService');
  
  assertEquals(service1, service2, 'Should be same instance');
});

// Test 26: Message Timestamp
test('Messages Have Timestamps', () => {
  const convoId = ConversationService.startConversation('user_016');
  const message = ConversationService.addMessage(convoId, 'user', 'Test');
  
  assertTrue(message.timestamp !== undefined, 'Should have timestamp');
  assertTrue(typeof message.timestamp === 'number', 'Timestamp should be number');
  assertGreaterThan(message.timestamp, 0, 'Timestamp should be positive');
});

// Test 27: Multiple Messages in Conversation
test('Support Multiple Messages in Same Conversation', () => {
  const convoId = ConversationService.startConversation('user_017');
  
  for (let i = 0; i < 5; i++) {
    ConversationService.addMessage(convoId, 'user', `Message ${i}`);
  }
  
  const context = ConversationService.getFullContext(convoId);
  assertGreaterThan(context.messages.length, 4, 'Should have all messages');
});

// Test 28: Get Statistics
test('Get Service Statistics', () => {
  const stats = ConversationService.getStats();
  
  assertTrue(stats !== undefined, 'Should return stats');
  assertTrue(stats.totalConversations >= 0, 'Should have conversation count');
  assertTrue(stats.totalMessages >= 0, 'Should have message count');
});

// Test 29: Neutral Emotion Detection
test('Handle Neutral Text (No Strong Emotion)', () => {
  const emotion = ConversationService.detectEmotion('The weather is nice today');
  
  assertTrue(emotion !== undefined, 'Should return emotion object');
  assertTrue(emotion.confidence >= 0, 'Should have confidence');
});

// Test 30: Long Message Processing
test('Process Long Messages', () => {
  const convoId = ConversationService.startConversation('user_018');
  const longMessage = 'This is a very long message. ' + 'Lorem ipsum dolor sit amet. '.repeat(20);
  
  const message = ConversationService.addMessage(convoId, 'user', longMessage);
  
  assertTrue(message !== undefined, 'Should handle long messages');
  assertTrue(message.keywords !== undefined, 'Should still extract keywords');
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
