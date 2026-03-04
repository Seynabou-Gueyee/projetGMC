# 🚀 Integration Guide - RAG + Advanced Conversation + Open-Source Models

## 🎯 What's New

You now have 3 powerful new systems integrated into your AI:

1. **RAG Service** - Augment responses with knowledge
2. **Advanced Conversation** - Better conversation management
3. **Open-Source Models** - Free, private, offline models

---

## 📚 System Architecture

```
User Request
    ↓
Advanced Conversation Service
    ├─ Track conversation context
    ├─ Detect emotions
    ├─ Extract entities
    └─ Store user preferences
    ↓
RAG Service
    ├─ Search knowledge base
    ├─ Search FAQs
    ├─ Find related documents
    └─ Enrich context
    ↓
Advanced AI Service
    ├─ OpenAI
    ├─ Claude
    ├─ Gemini
    └─ Open-Source (Ollama)
    ↓
Response to User
```

---

## 🔌 INTEGRATION INTO advancedAIService.js

Update your `server/utils/advancedAIService.js` to use new services:

```javascript
// At the top, add these imports:
const RAGService = require('./ragService');
const ConversationService = require('./advancedConversationService');
const openSourceConfig = require('../config/openSourceModelsConfig');

class AdvancedAIService {
  constructor() {
    this.rag = RAGService;
    this.conversation = ConversationService;
    this.openSourceConfig = openSourceConfig;
    // ... rest of constructor
  }

  async getResponse(question, userId, conversationHistory = []) {
    try {
      // 1. Start/continue conversation
      let conversationId = this.conversation.conversationSessions.get(userId);
      if (!conversationId) {
        conversationId = this.conversation.startConversation(userId);
      }

      // 2. Add user message to conversation
      this.conversation.addMessage(conversationId, 'user', question);

      // 3. Enrich context with RAG
      const enrichedContext = this.rag.enrichContext(question, conversationHistory);
      const contextText = this.rag.formatContextForPrompt(enrichedContext);

      // 4. Build messages with context
      let messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt() + contextText
        },
        ...this.conversation.getFormattedMessages(conversationId)
      ];

      // 5. Get response from AI
      let response = await this.callPrimaryProvider(messages);

      if (!response) {
        // Fallback chain
        for (const provider of this.fallbackProviders) {
          response = await this.callProvider(provider, messages);
          if (response) break;
        }
      }

      // 6. Add AI response to conversation
      this.conversation.addMessage(conversationId, 'assistant', response);

      // 7. Store conversation for RAG
      this.rag.storeConversation(userId, this.conversation.getFormattedMessages(conversationId));

      return response;
    } catch (error) {
      logger.error('[AI] Error:', error);
      throw error;
    }
  }

  // New method: Call open-source models
  async callOpenSourceModel(messages, modelName = 'mistral') {
    try {
      const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const modelConfig = this.openSourceConfig[modelName];

      if (!modelConfig) {
        throw new Error(`Unknown model: ${modelName}`);
      }

      const response = await axios.post(
        baseUrl + '/api/generate',
        {
          model: modelConfig.models[modelName]?.name || modelName,
          prompt: messages[messages.length - 1].content,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        },
        { timeout: 30000 }
      );

      return response.data.response;
    } catch (error) {
      logger.error('[OpenSource] Error:', error);
      return null;
    }
  }
}
```

---

## 📁 How to Use RAG Service

### Add documents to knowledge base:

```javascript
const RAGService = require('./utils/ragService');

// Initialize (do once on startup)
await RAGService.initialize();

// Add custom document
RAGService.addDocument(
  'company-guide',
  'Our company was founded in 2020...',
  { title: 'Company Information', source: 'manual' }
);

// Add FAQ
RAGService.addFAQ(
  'How do I reset my password?',
  'Go to login page, click "Forgot Password", enter your email...'
);

// Save knowledge base
await RAGService.saveKnowledgeBase();
```

### Files structure:

Create a `knowledge/` folder in your project root:

```
TalkMe/
├── knowledge/
│   ├── company-info.md
│   ├── faq.json
│   ├── product-guide.txt
│   └── knowledge-base.json
└── server/
```

### Example FAQ file (`knowledge/faq.json`):

```json
[
  {
    "question": "How do I create an account?",
    "answer": "Click the Sign Up button and fill in the form..."
  },
  {
    "question": "Is TalkMe free?",
    "answer": "Yes, TalkMe is completely free to use..."
  }
]
```

### Example Knowledge document (`knowledge/company-info.md`):

```markdown
# About TalkMe

TalkMe is a modern chatbot platform founded in 2020.

## Features
- Multi-provider AI support
- RAG for knowledge augmentation
- Advanced conversation management
- Open-source model support

## Contact
Email: info@talkme.com
Phone: +1-XXX-XXX-XXXX
```

---

## 💬 How to Use Advanced Conversation Service

```javascript
const ConversationService = require('./utils/advancedConversationService');

// Start a conversation
const conversationId = ConversationService.startConversation('user123');

// Add messages
ConversationService.addMessage(conversationId, 'user', 'Hello!');
ConversationService.addMessage(conversationId, 'assistant', 'Hi there!');

// Get full context
const context = ConversationService.getFullContext(conversationId);
console.log('Current user sentiment:', context.context.sentiment);
console.log('Topics discussed:', context.context.subtopics);

// Get messages formatted for AI
const formattedMessages = ConversationService.getFormattedMessages(conversationId);

// Analyze user
const trends = ConversationService.getUserConversationTrends('user123');
console.log('Average satisfaction:', trends.averageSatisfaction);
console.log('Favorite topics:', trends.commonKeywords);

// End conversation and get summary
const summary = ConversationService.endConversation(conversationId);
console.log('Conversation summary:', summary);
```

---

## 🦙 How to Use Open-Source Models

### Download a model:

```bash
# Download Mistral (recommended)
ollama pull mistral

# Or download other models
ollama pull neural-chat
ollama pull zephyr
ollama pull phi
ollama pull llama2
```

### Use in your code:

```javascript
const openSourceConfig = require('./config/openSourceModelsConfig');

// Get recommendation for your use case
const recommendation = openSourceConfig.selectModel({
  speed: 'fast',
  intelligence: 'excellent',
  memory: 'low',
  specialization: 'chat'
});

console.log('Recommended model:', recommendation.topRecommendation);
// → Output: "mistral"

// In messageController
const response = await aiService.callOpenSourceModel(messages, 'mistral');
```

---

## 🎯 Complete Integration Example

```javascript
// messageController.js
const AdvancedAIService = require('../utils/advancedAIService');
const RAGService = require('../utils/ragService');
const ConversationService = require('../utils/advancedConversationService');

router.post('/send-message', async (req, res) => {
  try {
    const { message, userId } = req.body;

    // 1. Get or create conversation
    let conversationId = ConversationService.conversationSessions.get(userId);
    if (!conversationId) {
      conversationId = ConversationService.startConversation(userId);
    }

    // 2. Add user message
    ConversationService.addMessage(conversationId, 'user', message);

    // 3. Get AI response (with RAG + conversation context)
    const response = await AdvancedAIService.getResponse(message, userId);

    // 4. Add AI response
    ConversationService.addMessage(conversationId, 'assistant', response);

    // 5. Get context for UI
    const context = ConversationService.getFullContext(conversationId);

    res.json({
      reply: response,
      sentiment: context.context.sentiment,
      confidence: context.context.emotionTrajectory[0]?.confidence || 0.5
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📊 Monitoring & Analytics

```javascript
// Dashboard endpoint
router.get('/analytics', async (req, res) => {
  const convStats = ConversationService.getStats();
  const ragStats = RAGService.getStats();

  res.json({
    conversations: convStats,
    knowledge: ragStats,
    timestamp: new Date().toISOString()
  });
});

// Output example:
{
  "conversations": {
    "activeConversations": 5,
    "totalConversations": 342,
    "registeredUsers": 127,
    "averageMessagePerConversation": 8.5
  },
  "knowledge": {
    "documentsCount": 45,
    "faqCount": 23,
    "conversationsStored": 120,
    "initialized": true
  }
}
```

---

## 🚀 Environment Variables

Update your `.env`:

```bash
# Existing RAG support
USE_RAG=true

# Open-source models
OLLAMA_BASE_URL=http://localhost:11434
OPEN_SOURCE_MODEL=mistral
ENABLE_OPEN_SOURCE=true

# Advanced conversation
STORE_CONVERSATIONS=true
MAX_CONTEXT_MESSAGES=20

# Knowledge path
KNOWLEDGE_BASE_PATH=./knowledge
```

---

## 📈 Feature Matrix

| Feature | RAG Service | Conversation Service | Open-Source |
|---------|-----------|----------------------|------------|
| Knowledge Base | ✅ Yes | ❌ No | N/A |
| Context Enrichment | ✅ Yes | ✅ Yes | N/A |
| Emotion Detection | ❌ No | ✅ Yes | N/A |
| User Profile | ❌ No | ✅ Yes | N/A |
| Sentiment Tracking | ❌ No | ✅ Yes | N/A |
| Free Models | N/A | N/A | ✅ Yes |
| Offline Support | Optional | ✅ Yes | ✅ Yes |
| Privacy | ✅ Local | ✅ Local | ✅ 100% Local |

---

## 🎓 Quick Start Checklist

- [ ] Create `knowledge/` folder
- [ ] Add documents and FAQs
- [ ] Download open-source model: `ollama pull mistral`
- [ ] Update `.env` with `USE_RAG=true`
- [ ] Update `advancedAIService.js` to use new services
- [ ] Test with: `curl -X POST http://localhost:3000/api/chat ...`
- [ ] Verify RAG is enriching responses
- [ ] Monitor conversation analytics
- [ ] Deploy to production

---

## 🆘 Troubleshooting

**RAG Service not finding documents?**
→ Check `knowledge/` folder exists
→ Verify file encoding is UTF-8
→ Run `RAGService.initialize()` on startup

**Conversations not tracked?**
→ Use `ConversationService.startConversation(userId)`
→ Call `addMessage()` for each message
→ Check `STORE_CONVERSATIONS=true` in `.env`

**Open-source model slow?**
→ Use `phi` or `phi-2` (smaller, faster)
→ Check Ollama service is running
→ Monitor GPU/CPU usage

---

**Ready to deploy!** 🚀
