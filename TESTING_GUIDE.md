# WAVE 2 Integration Testing Guide

**Status**: 🧪 **TESTING IN PROGRESS**  
**Date**: March 4, 2026  

---

## Overview

This guide walks through testing the complete WAVE 2 implementation:
- RAG Service (Knowledge Base)
- Advanced Conversation Service (Emotion, Analytics)
- Open-Source Models Configuration
- Integration between services

---

## Test Files Created

### 1. **test_rag_service.js** (20 test cases)
Tests the RAG service independently

**What it tests**:
- ✅ Document loading and indexing
- ✅ Keyword-based search
- ✅ FAQ matching
- ✅ Context enrichment
- ✅ Knowledge persistence
- ✅ Statistics generation

**Run**:
```bash
node server/tests/test_rag_service.js
```

**Expected output**:
- 20 test cases
- All should PASS
- ~2-3 seconds to complete

---

### 2. **test_conversation_service.js** (30 test cases)
Tests emotion detection and conversation tracking

**What it tests**:
- ✅ Emotion detection (5 emotions)
- ✅ Entity extraction
- ✅ Keyword extraction
- ✅ User profile management
- ✅ Conversation summarization
- ✅ Sentiment trajectory
- ✅ Message formatting
- ✅ User analytics

**Run**:
```bash
node server/tests/test_conversation_service.js
```

**Expected output**:
- 30 test cases
- All should PASS
- ~2-3 seconds to complete

---

### 3. **test_integration.js** (15 test cases)
Tests how all services work together

**What it tests**:
- ✅ Complete support flow
- ✅ RAG enriching conversation
- ✅ Emotion-driven responses
- ✅ User profile learning
- ✅ Multi-turn conversations
- ✅ Escalation decisions
- ✅ Analytics data generation
- ✅ End-to-end workflows

**Run**:
```bash
node server/tests/test_integration.js
```

**Expected output**:
- 15 test cases
- All should PASS
- ~2-3 seconds to complete

---

## Quick Start (5 Minutes)

### Option 1: Run All Tests at Once
```bash
cd c:\Users\HP 830\Desktop\TalkMe

# Run each test
node server/tests/test_rag_service.js
node server/tests/test_conversation_service.js
node server/tests/test_integration.js
```

### Option 2: Run Tests with Summary Script
Create `run_all_tests.js`:
```bash
# In project root
node << 'EOF'
const { spawn } = require('child_process');

const tests = [
  'server/tests/test_rag_service.js',
  'server/tests/test_conversation_service.js',
  'server/tests/test_integration.js'
];

let current = 0;

function runNext() {
  if (current >= tests.length) {
    console.log('\n✅ All test suites completed!');
    process.exit(0);
  }
  
  console.log(`\n🧪 Running: ${tests[current]}\n`);
  const child = spawn('node', [tests[current]]);
  
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  
  child.on('close', (code) => {
    current++;
    runNext();
  });
}

runNext();
EOF
```

---

## Understanding Test Output

### Successful Test
```
✓ PASS: Extract Keywords from Message
```
- Green checkmark = Test passed
- Takes ~0.1 seconds

### Failed Test
```
✗ FAIL: Detect Happy Emotion
  Error: Expected "happy", got "neutral"
```
- Red X = Test failed
- Shows expected vs actual value
- Investigation needed

### Summary Output
```
=== TEST SUMMARY ===
Total Tests: 20
Passed: 20
Success Rate: 100%

✓ ALL TESTS PASSED!
```

---

## Test Cases Breakdown

### RAG Service Tests (20 cases)

| # | Test | Purpose |
|---|------|---------|
| 1 | Service Initialization | Verify RAG service loads |
| 2 | Add Document | Document storage works |
| 3 | Document Indexing | Documents are indexed for search |
| 4 | Search Documents | Keyword search returns results |
| 5 | Relevance Scoring | Results ranked by relevance |
| 6 | Add FAQ | FAQ entries can be added |
| 7 | Search FAQs | FAQ matching works |
| 8 | Extract Topics | Topic extraction from text |
| 9 | Enrich Context | Context enriched correctly |
| 10 | Format for Prompt | Context formatted as text |
| 11 | Persist KB | Knowledge base saved |
| 12 | Get Statistics | Stats retrieved |
| 13 | Empty Query | Handles empty input |
| 14 | Multiple Keywords | Multi-word search works |
| 15 | Relevant vs Irrelevant | Distinguishes relevant docs |
| 16 | Top-K Limiting | Returns max K results |
| 17 | KB Not Empty | Has documents |
| 18 | Service is Singleton | Single instance |
| 19 | Load Knowledge Base | Folder scanning works |
| 20 | Document Synthesis | Conversation to document |

**Expected**: 20/20 PASS ✅

---

### Conversation Service Tests (30 cases)

| # | Test | Purpose |
|---|------|---------|
| 1 | Service Initialization | Service loads |
| 2 | Start Conversation | Conversation created |
| 3 | Add User Message | Messages tracked |
| 4-8 | Emotion Detection (5) | All 5 emotions detected |
| 9 | Emotion Scores | All emotion scores present |
| 10 | Entity Extraction | NER works |
| 11 | Keyword Extraction | Top 5 keywords extracted |
| 12 | Message Emotion | Message has emotion field |
| 13 | Message Entities | Message has entities |
| 14 | Message Keywords | Message has keywords |
| 15 | Get Full Context | Context retrieved |
| 16 | Format for AI | Messages formatted |
| 17 | Summarize | Summary created |
| 18 | User Profile | Profile management |
| 19 | Update Profile | Profile updatable |
| 20 | User Trends | Analytics work |
| 21 | End Conversation | Conversation ended |
| 22 | Export Conversation | Export works |
| 23 | Estimate Satisfaction | Satisfaction calculated |
| 24 | Emotion Trajectory | History tracked |
| 25 | Service is Singleton | Single instance |
| 26 | Message Timestamp | Timestamps present |
| 27 | Multiple Messages | Handles many messages |
| 28 | Get Statistics | Stats retrieved |
| 29 | Neutral Emotion | Handles neutral text |
| 30 | Long Messages | Handles long input |

**Expected**: 30/30 PASS ✅

---

### Integration Tests (15 cases)

| # | Test | Purpose |
|---|------|---------|
| 1 | Support Flow | Complete customer flow |
| 2 | RAG Enrichement | KB enriches conversation |
| 3 | Emotion Response | Emotion drives response |
| 4 | Profile Learning | Profile learns from talk |
| 5 | FAQ Matching | FAQs used in context |
| 6 | Summary Context | Summary uses KB |
| 7 | Multi-Turn Context | Conversation context maintained |
| 8 | Business Entities | Entity extraction works |
| 9 | Trajectory Satisfaction | Emotions show satisfaction |
| 10 | Keyword RAG Search | Keywords enhance RAG |
| 11 | Escalation Decision | Emotion + profile = escalate |
| 12 | Document Synthesis | Convo becomes document |
| 13 | Full Workflow | Question → answer pipeline |
| 14 | No Match Gracefully | Handles missing KB |
| 15 | Analytics Data | Dashboard data generated |

**Expected**: 15/15 PASS ✅

---

## What Each Test Validates

### RAG Service Validation

**Document Storage**:
- Documents can be added to knowledge base
- Documents are persisted
- Retrieval works correctly

**Search Quality**:
- Keyword matching is accurate
- Results ranked by relevance
- Top-K limiting works

**FAQ Functionality**:
- FAQs can be stored
- Similarity matching works
- Exact and partial matches found

**Context Enrichment**:
- Context formatted correctly for AI
- Recommendations generated
- Conversation awareness built in

---

### Conversation Service Validation

**Emotion Detection**:
- Happy emotion detected correctly
- Sad emotion detected correctly
- Angry emotion detected correctly
- Confused emotion detected correctly
- Excited emotion detected correctly
- Confidence scores 0-1 range
- All emotion scores present

**Entity Recognition**:
- Names extracted
- Locations extracted
- Organizations extracted
- Topics identified
- Timestamps found

**Conversation Tracking**:
- Messages stored with metadata
- Timestamps added automatically
- Emotion detected for each message
- Entities extracted for each message
- Keywords extracted for each message

**User Profiles**:
- Profiles created on demand
- Preferences stored
- Conversation history tracked
- Trends analyzed
- Communication style learned

**Analytics**:
- Message count totaled
- Sentiment calculated
- Emotion trajectory tracked
- User satisfaction estimated
- Topic distribution analyzed

---

### Integration Validation

**End-to-End Flow**:
- Customer question → conversation started
- Message tracked with emotion
- RAG searches knowledge base
- Results incorporated
- User profile updated
- Response generated with context

**Service Cooperation**:
- RAG enriches conversation
- Conversation drives RAG search
- Emotion detected affects response
- Profile learns from conversation
- Analytics combine all data

**Real-World Scenarios**:
- Support ticket escalation
- FAQ auto-matching
- Customer satisfaction tracking
- Knowledge base learning
- Premium customer handling

---

## Running Specific Tests

### Test Only Emotion Detection
```javascript
// In test_conversation_service.js, comment out other tests:
// test('Another test', () => { /* skipped */ })

// Only run emotion tests:
test('Detect Happy Emotion', () => { /* ... */ });
test('Detect Sad Emotion', () => { /* ... */ });
test('Detect Angry Emotion', () => { /* ... */ });
test('Detect Confused Emotion', () => { /* ... */ });
test('Detect Excited Emotion', () => { /* ... */ });
```

### Test Only RAG Search
```javascript
// Run specific tests:
test('Search Documents by Keyword', () => { /* ... */ });
test('Search Results Have Relevance Scores', () => { /* ... */ });
test('Search FAQs by Query', () => { /* ... */ });
```

---

## Interpreting Results

### All Pass ✅
```
Success Rate: 100%

✓ ALL TESTS PASSED!
```
**What it means**: System is working correctly, ready to integration test in actual code

---

### Some Fail ❌
```
✗ FAIL: Detect Happy Emotion
  Error: Expected 'happy', got 'neutral'

Success Rate: 93.3%
```
**What to do**:
1. Check the test error message
2. Verify the service code
3. Common issues:
   - Emotion keywords might need tuning
   - Text analysis might need improvement
   - Confidence thresholds might be too high

**Example fix**:
```javascript
// In advancedConversationService.js
const happyKeywords = [
  'happy', 'glad', 'pleased', 'delighted', 'joyful', 'content'
];
// Might need to add more keywords
```

---

## Test Data Reference

### Sample Messages Tested

**Happy**:
- "I am so happy and excited today!"
- "This is great!"

**Sad**:
- "I am really sad and disappointed right now"
- "I am sad"

**Angry**:
- "I am so frustrated and angry!"
- "I'm extremely frustrated with the service!"

**Confused**:
- "I am really confused and lost"
- "I don't understand the pricing"

**Excited**:
- "I am so excited and energetic!"
- "This is amazing!"

**Neutral**:
- "The weather is nice today"
- "What are your hours?"

---

## Expected Performance

### Test Execution Time
- RAG Service: ~2-3 seconds (20 tests)
- Conversation Service: ~2-3 seconds (30 tests)
- Integration: ~2-3 seconds (15 tests)
- **Total**: ~7-10 seconds all tests

### Memory Usage
- RAG + Conversation services: ~50MB
- Test data: ~5MB
- **Total**: ~55MB (minimal)

### Reliability
- Expected success rate: >99%
- Flakiness: Very low (uses in-memory storage)
- Reproducibility: High (deterministic tests)

---

## Next Steps After Testing

### ✅ All Tests Pass
1. Create knowledge base folder structure
2. Add company documents to knowledge/
3. Test with real conversation flows
4. Integrate into messageController
5. Deploy to production

### ❌ Some Tests Fail
1. Review failing test cases
2. Check service implementation
3. Fix the code
4. Re-run tests
5. Proceed to integration

---

## Test Infrastructure

### Running with Different Node Versions
```bash
# Check current Node version
node --version

# With nvm (if installed)
nvm use 16   # Run with Node 16
node server/tests/test_rag_service.js

nvm use 18   # Run with Node 18
node server/tests/test_rag_service.js
```

### Running with npm scripts (optional)
Add to `package.json`:
```json
{
  "scripts": {
    "test:rag": "node server/tests/test_rag_service.js",
    "test:conversation": "node server/tests/test_conversation_service.js",
    "test:integration": "node server/tests/test_integration.js",
    "test:all": "npm run test:rag && npm run test:conversation && npm run test:integration"
  }
}
```

Then run:
```bash
npm run test:all
```

---

## Troubleshooting Common Issues

### Error: "Cannot find module"
```
Error: Cannot find module '../utils/ragService'
```
**Fix**: Verify files are in correct location:
- `server/utils/ragService.js` ✅
- `server/utils/advancedConversationService.js` ✅
- Tests in `server/tests/` ✅

### Error: "Assertion failed"
```
Error: Expected > 0, got 0
```
**Fix**: The test failed because a count was 0. Either:
- Service didn't return data (check service logic)
- Test setup didn't create test data properly
- Service method has a bug

### Error: "Maximum call stack exceeded"
**Cause**: Likely infinite recursion in service
**Fix**: Check for circular dependencies in service code

---

## Success Criteria

✅ **You've successfully completed integration testing when**:

1. ✅ All RAG tests pass (20/20)
2. ✅ All Conversation tests pass (30/30)
3. ✅ All Integration tests pass (15/15)
4. ✅ Success rate >= 95%
5. ✅ No errors in test output
6. ✅ Execution time < 15 seconds total

---

## Next Phase: Actual Integration

Once all tests pass, proceed to:

1. **Create knowledge base**:
   ```bash
   mkdir knowledge
   touch knowledge/faq.json
   ```

2. **Update messageController**:
   - Integrate RAG for context
   - Track conversations
   - Detect emotions
   - Update user profiles

3. **Test with real messages**:
   - Send test messages
   - Verify emotion detection
   - Check knowledge base search
   - Monitor analytics

4. **Deploy with confidence**:
   - Services are tested
   - Integration is verified
   - Analytics ready
   - Ready for production

---

## Summary

**Testing approach**: Unit tests + Integration tests
**Coverage**: 65 test cases across 3 test suites
**Services tested**: RAG, Conversation, Integration
**Expected result**: 100% pass rate

**After testing**: System ready for actual codebase integration

🎉 **Ready to test?** Run the tests above!
