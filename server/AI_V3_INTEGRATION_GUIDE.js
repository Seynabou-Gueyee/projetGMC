// 🔧 AI_V3_INTEGRATION_GUIDE.js
// 
// Ce fichier montre comment intégrer advancedAIService dans
// vos endpoints existants et remplacer l'ancienne IA par la nouvelle.

const AdvancedAIService = require('./utils/advancedAIService');
const logger = require('./utils/logger');

/**
 * ═══════════════════════════════════════════════════════════════
 * INTÉGRATION QUICK START - 3 Étapes Simples
 * ═══════════════════════════════════════════════════════════════
 */

// ÉTAPE 1️⃣: Importer le service (fait ci-dessus)

// ÉTAPE 2️⃣: Créer une instance globale
const aiService = new AdvancedAIService();

// ÉTAPE 3️⃣: Utiliser dans vos endpoints!

// ═══════════════════════════════════════════════════════════════

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLE 1: INTÉGRATION DANS MESSAGE CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 * 
 * Remplacer l'ancien appel IA par le nouveau.
 */

// AVANT (ancien aiService):
/*
const aiService = require('./aiService');

async function sendMessage(req, res) {
  const { message, userId } = req.body;
  
  try {
    const response = await aiService.getResponse(message);  // ❌ ANCIEN
    
    res.json({ reply: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
*/

// APRÈS (nouveau advancedAIService):
async function sendMessage(req, res) {
  const { message, userId, conversationHistory = [] } = req.body;
  
  try {
    // ✅ NOUVEAU - Passe aussi historique pour mieux répondre!
    const response = await aiService.getResponse(
      message,           // Question
      userId,            // Qui demande (pour memory)
      conversationHistory // Contexte conversation
    );
    
    res.json({ 
      reply: response,
      model: process.env.AI_PRIMARY_PROVIDER,  // Quel AI utilisé
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI Service Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLE 2: INTEGRATION AVEC HISTORIQUE CONVERSATION
 * ═══════════════════════════════════════════════════════════════
 */

async function sendMessageWithHistory(req, res) {
  const { message, userId } = req.body;
  
  try {
    // Récupérer historique depuis BD
    const Conversation = require('../models/Conversation');
    const history = await Conversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Convertir au format attendu
    const conversationHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    // ✅ Appeler IA avec contexte complet
    const response = await aiService.getResponse(
      message,
      userId,
      conversationHistory
    );
    
    // Sauvegarder réponse
    await Conversation.create({
      userId,
      sender: 'assistant',
      content: response
    });
    
    res.json({ reply: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLE 3: STREAMING RESPONSE (POUR UX OPTIMALE)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Au lieu d'attendre réponse complète,
 * envoyer au client au fur et à mesure!
 */

async function sendMessageStreaming(req, res) {
  const { message, userId } = req.body;
  
  try {
    // Headers pour streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Envoyer état "typing"
    res.write(JSON.stringify({ status: 'typing', provider: process.env.AI_PRIMARY_PROVIDER }));
    
    // Appeler IA
    const response = await aiService.getResponse(message, userId);
    
    // Envoyer réponse par chunks (imiter streaming)
    const chunkSize = 50;
    for (let i = 0; i < response.length; i += chunkSize) {
      const chunk = response.slice(i, i + chunkSize);
      res.write('\n' + JSON.stringify({ chunk, progress: Math.round(i / response.length * 100) }));
      
      // Petit delay pour UX streaming
      await new Promise(r => setTimeout(r, 50));
    }
    
    // Finir
    res.write('\n' + JSON.stringify({ status: 'complete', fullResponse: response }));
    res.end();
    
  } catch (error) {
    res.write('\n' + JSON.stringify({ error: error.message }));
    res.end();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLE 4: BATCH PROCESSING (PLUSIEURS QUESTIONS)
 * ═══════════════════════════════════════════════════════════════
 */

async function answerMultipleQuestions(req, res) {
  const { questions, userId } = req.body;
  
  try {
    const answers = [];
    
    for (const question of questions) {
      const answer = await aiService.getResponse(question, userId);
      answers.push({
        question,
        answer,
        provider: process.env.AI_PRIMARY_PROVIDER
      });
    }
    
    res.json({ results: answers, total: answers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLE 5: CONVERSATION DÉTAILLÉE AVEC METADATA
 * ═══════════════════════════════════════════════════════════════
 */

async function getDetailedResponse(req, res) {
  const { message, userId, includeReasoning = false } = req.body;
  
  try {
    const startTime = Date.now();
    
    // Appeler IA
    const response = await aiService.getResponse(message, userId);
    
    const responseTime = Date.now() - startTime;
    
    // Réponse enrichie
    res.json({
      response,
      metadata: {
        provider: process.env.AI_PRIMARY_PROVIDER,
        model: process.env[`${process.env.AI_PRIMARY_PROVIDER.toUpperCase()}_MODEL`],
        responseTimeMs: responseTime,
        timestamp: new Date().toISOString(),
        userId,
        messageLength: message.length,
        responseLength: response.length
      },
      estimatedCost: calculateCost(response)
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * UTILITAIRES
 * ═══════════════════════════════════════════════════════════════
 */

// Calculer coût estimé de la requête
function calculateCost(responseText) {
  const provider = process.env.AI_PRIMARY_PROVIDER;
  const tokens = Math.ceil(responseText.length / 4); // Approximation
  
  const costs = {
    openai: tokens * 0.00002,  // $0.02 per 1k tokens
    claude: tokens * 0.00003,  // $0.03 per 1k tokens
    gemini: 0,                 // Gratuit
    ollama: 0                  // Gratuit
  };
  
  return costs[provider] || 0;
}

// Middleware pour logger tous appels IA
function aiLoggingMiddleware(req, res, next) {
  if (req.path.includes('/chat') || req.path.includes('/message')) {
    logger.info(`[AI] Request from ${req.body.userId}: ${req.body.message.substring(0, 50)}...`);
  }
  next();
}

/**
 * ═══════════════════════════════════════════════════════════════
 * SETUP DANS votre express app
 * ═══════════════════════════════════════════════════════════════
 * 
 * Dans votre server.js ou main app file:
 * 
 * const app = require('express')();
 * const aiIntegration = require('./AI_V3_INTEGRATION_GUIDE.js');
 * 
 * app.use(aiIntegration.aiLoggingMiddleware);
 * app.post('/api/chat', aiIntegration.sendMessage);
 * app.post('/api/chat-advanced', aiIntegration.getDetailedResponse);
 * app.post('/api/chat-stream', aiIntegration.sendMessageStreaming);
 * 
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * UTILISER DANS ROUTES EXISTANTES
 * ═══════════════════════════════════════════════════════════════
 */

// Dans messageController.js:

// Route simple
// router.post('/send', sendMessage);  // ✅ Remplacé comme ci-dessus

// Route avec historique
// router.post('/send-with-context', sendMessageWithHistory);

// Route streaming
// router.post('/send-stream', sendMessageStreaming);

// Route détaillée
// router.post('/send-detailed', getDetailedResponse);

/**
 * ═══════════════════════════════════════════════════════════════
 * TESTER LES INTÉGRATIONS
 * ═══════════════════════════════════════════════════════════════
 */

// TEST 1: Simple
/*
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!","userId":"user1"}'
*/

// TEST 2: Avec historique
/*
curl -X POST http://localhost:3000/api/chat-with-history \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Quelle est ta couleur?",
    "userId":"user1",
    "conversationHistory": [
      {"role":"user","content":"Bonjour IA!"},
      {"role":"assistant","content":"Bonjour! Comment puis-je t'aider?"}
    ]
  }'
*/

// TEST 3: Détaillé
/*
curl -X POST http://localhost:3000/api/chat-detailed \
  -H "Content-Type: application/json" \
  -d '{"message":"Explique quantum computing","userId":"user1","includeReasoning":true}'
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * MIGRATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════
 * 
 * Passer de l'ancien aiService au nouveau advancedAIService:
 * 
 * [ ] Importer AdvancedAIService à la place de aiService
 * [ ] Créer instance globale: const aiService = new AdvancedAIService();
 * [ ] Remplacer aiService.getResponse() par aiService.getResponse(message, userId)
 * [ ] Ajouter historique conversation
 * [ ] Tester réponses (doivent être beaucoup plus longues/détaillées)
 * [ ] Vérifier .env pour clé API
 * [ ] Tester failover si possible
 * [ ] Monitor logs pour erreurs
 * [ ] Deployer en production
 * [ ] Monitorer coûts (si OpenAI)
 * 
 */

module.exports = {
  aiService,
  sendMessage,
  sendMessageWithHistory,
  sendMessageStreaming,
  answerMultipleQuestions,
  getDetailedResponse,
  calculateCost,
  aiLoggingMiddleware
};
