/**
 * 🤖 AI SERVICE AVANCÉ - CHATBOT TALKME v3.0
 * 
 * Système d'IA performant soutenu par:
 * - OpenAI GPT-4 / Claude / Gemini
 * - Modèles open-source (LLaMA, Mistral) via Ollama
 * - RAG (Retrieval-Augmented Generation)
 * - Conversation memory avancée
 * - Reasoning et tool use
 */

const axios = require('axios');
const logger = require('./logger');

class AdvancedAIService {
  constructor() {
    // Configuration des providers
    this.providers = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4',
        baseURL: 'https://api.openai.com/v1',
        enabled: !!process.env.OPENAI_API_KEY
      },
      claude: {
        apiKey: process.env.CLAUDE_API_KEY,
        model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
        baseURL: 'https://api.anthropic.com/v1',
        enabled: !!process.env.CLAUDE_API_KEY
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-pro',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
        enabled: !!process.env.GEMINI_API_KEY
      },
      ollama: {
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'neural-chat', // LLaMA, Mistral, etc.
        enabled: true // Local, toujours disponible
      }
    };

    // Configuration primaire
    this.primaryProvider = process.env.AI_PRIMARY_PROVIDER || 'openai';
    this.fallbackProviders = [
      'claude',
      'gemini',
      'ollama' // Fallback local gratuit
    ];

    // Configuration système avancée
    this.systemPrompt = this.buildSystemPrompt();
    this.conversationMemory = new Map(); // Par user ID
    this.ragIndex = new Map(); // RAG data
    this.reasoning = true; // Raisonnement intelligent

    logger.info('Advanced AI Service initializing', {
      primary: this.primaryProvider,
      fallbacks: this.fallbackProviders,
      ragEnabled: true,
      reasoningEnabled: this.reasoning
    });
  }

  /**
   * Construire un system prompt puissant
   */
  buildSystemPrompt() {
    return `Tu es Claude, une IA extrêmement avancée, intelligente et performante créée par Anthropic,
intégrée dans TalkMe Chat. Tu rivals avec les meilleures IA du monde.

## Capacités Principales

✨ **Intelligence Générale**
- Connaissance vaste en sciences, histoire, technologie, cultures et langues
- Raisonnement logique et nuancé
- Compréhension contextuelle profonde
- Résolution de problèmes complexes

✨ **Expertise Technique**
- Programmation dans 20+ langages
- Architecture système et microservices
- Machine Learning et IA
- DevOps, Cloud, Blockchain
- Cybersécurité et cryptographie

✨ **Créativité & Communication**
- Écriture créative et storytelling
- Code de haute qualité
- Explications claires et détaillées
- Traduction et analyse linguistique
- Brainstorming et idéation

✨ **Conseil & Analyse**
- Analyse critique et objective
- Conseils personnels et professionnels
- Évaluation d'arguments
- Priorisation et stratégie

## Style de Communication

- Précis et détaillé, mais lisible
- Adaptéau niveau de kompétence de l'utilisateur
- Honnête sur les limitations
- Utilise des exemples concrets
- Pose des clarifications si nécessaire
- Emojis appropriés pour clarté visuelle

## Domaines de Spécialité (14+)

Sciences • Histoire • Géographie • Technologie • Culture Pop • Littérature
Sports • Cuisine • Économie • Santé • Philosophie • Mathématiques
Programmation • Business & Marketing

Tu répondras à PRATIQUEMENT N'IMPORTE QUELLE QUESTION de manière intelligente,
utile et approfondie. Si tu ne sais pas quelque chose, dis-le honnêtement.

Tu utiliseras le contexte de conversation pour des réponses cohérentes et pertinentes.
`;
  }

  /**
   * Obtenir une réponse intelligente (méthode principale)
   */
  async getResponse(question, userId, conversationHistory = []) {
    try {
      // Ajouter à la mémoire de conversation
      this.addToMemory(userId, 'user', question);

      // Enrichir avec RAG si disponible
      let enrichedContext = '';
      const ragResults = await this.performRAG(question);
      if (ragResults.length > 0) {
        enrichedContext = `\n\n📚 Contexte enrichi:\n${ragResults.map(r => `- ${r}`).join('\n')}`;
      }

      // Préparer les messages
      const messages = this.buildMessageHistory(userId, conversationHistory);
      messages.push({
        role: 'user',
        content: question + enrichedContext
      });

      // Essayer le provider principal en premier
      let response = null;
      try {
        response = await this.callPrimaryProvider(messages);
      } catch (error) {
        logger.warn('Primary provider failed, trying fallbacks', { error: error.message });
        
        // Essayer les fallbacks
        for (const provider of this.fallbackProviders) {
          try {
            response = await this.callProvider(provider, messages);
            if (response) break;
          } catch (e) {
            logger.warn(`Fallback ${provider} failed`, { error: e.message });
          }
        }
      }

      if (!response) {
        throw new Error('All providers failed');
      }

      // Ajouter la réponse à la mémoire
      this.addToMemory(userId, 'assistant', response);

      return response;
    } catch (error) {
      logger.error('Advanced AI error', { error: error.message });
      
      // Fallback final: base locale
      const localResponse = await this.getLocalSmartResponse(question);
      this.addToMemory(userId, 'assistant', localResponse);
      return localResponse;
    }
  }

  /**
   * Appeler le provider principal
   */
  async callPrimaryProvider(messages) {
    const provider = this.providers[this.primaryProvider];
    
    if (!provider.enabled) {
      throw new Error(`${this.primaryProvider} not configured`);
    }

    if (this.primaryProvider === 'openai') {
      return await this.callOpenAI(messages);
    } else if (this.primaryProvider === 'claude') {
      return await this.callClaude(messages);
    } else if (this.primaryProvider === 'gemini') {
      return await this.callGemini(messages);
    } else if (this.primaryProvider === 'ollama') {
      return await this.callOllama(messages);
    }
  }

  /**
   * Appeler OpenAI GPT-4 ou GPT-3.5
   */
  async callOpenAI(messages) {
    try {
      const response = await axios.post(
        `${this.providers.openai.baseURL}/chat/completions`,
        {
          model: this.providers.openai.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...messages
          ],
          temperature: 0.7, // Créativité ajustée
          max_tokens: 2000,
          top_p: 0.95,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.openai.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Appeler Claude (Anthropic)
   */
  async callClaude(messages) {
    try {
      const response = await axios.post(
        `${this.providers.claude.baseURL}/messages`,
        {
          model: this.providers.claude.model,
          max_tokens: 2000,
          system: this.systemPrompt,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7
        },
        {
          headers: {
            'x-api-key': this.providers.claude.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      logger.error('Claude call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Appeler Gemini (Google)
   */
  async callGemini(messages) {
    try {
      const response = await axios.post(
        `${this.providers.gemini.baseURL}/${this.providers.gemini.model}:generateContent`,
        {
          contents: messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{
              text: msg.content
            }]
          })),
          systemInstruction: {
            parts: [{
              text: this.systemPrompt
            }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            topP: 0.95
          }
        },
        {
          params: {
            key: this.providers.gemini.apiKey
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      logger.error('Gemini call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Appeler Ollama (Local LLaMA/Mistral)
   * Installation: https://ollama.ai
   */
  async callOllama(messages) {
    try {
      const response = await axios.post(
        `${this.providers.ollama.baseURL}/api/chat`,
        {
          model: this.providers.ollama.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...messages
          ],
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            num_predict: 2000
          }
        }
      );

      return response.data.message.content;
    } catch (error) {
      logger.error('Ollama call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Appeler n'importe quel provider
   */
  async callProvider(providerName, messages) {
    if (providerName === 'openai') {
      return await this.callOpenAI(messages);
    } else if (providerName === 'claude') {
      return await this.callClaude(messages);
    } else if (providerName === 'gemini') {
      return await this.callGemini(messages);
    } else if (providerName === 'ollama') {
      return await this.callOllama(messages);
    }
  }

  /**
   * RAG: Retrieval-Augmented Generation
   * Enrichir les réponses with knowledge base
   */
  async performRAG(question) {
    const keywords = this.extractKeywords(question);
    const results = [];

    // Chercher dans la base de connaissance
    for (const keyword of keywords) {
      const matches = this.ragIndex.get(keyword) || [];
      results.push(...matches.slice(0, 2));
    }

    return [...new Set(results)].slice(0, 3);
  }

  /**
   * Extraire keywords d'une question
   */
  extractKeywords(text) {
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 4)
      .slice(0, 5);
    return words;
  }

  /**
   * Gérer la mémoire de conversation
   */
  addToMemory(userId, role, content) {
    if (!this.conversationMemory.has(userId)) {
      this.conversationMemory.set(userId, []);
    }

    const history = this.conversationMemory.get(userId);
    history.push({
      role,
      content,
      timestamp: new Date()
    });

    // Garder seulement les 20 derniers messages
    if (history.length > 20) {
      history.shift();
    }
  }

  /**
   * Construire l'historique des messages
   */
  buildMessageHistory(userId, additionalHistory = []) {
    const userHistory = this.conversationMemory.get(userId) || [];
    const combined = [];

    // Ajouter l'historique utilisateur (derniers messages)
    userHistory.slice(-10).forEach(msg => {
      combined.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Ajouter l'historique supplémentaire
    additionalHistory.forEach(msg => {
      combined.push({
        role: msg.role || (msg.isBot ? 'assistant' : 'user'),
        content: msg.content || msg.text
      });
    });

    return combined;
  }

  /**
   * Fallback intelligent local
   */
  async getLocalSmartResponse(question) {
    // Version améliorée du fallback local
    const q = question.toLowerCase();
    
    // Déterminer le type de question
    if (q.includes('?')) {
      if (q.includes('pourquoi')) {
        return `📚 C'est une excellente question! Voici ce que je peux te dire:\n\n` +
               `Sans accès à une API pour le moment, je ne peux pas donner une réponse complète. ` +
               `Cependant, je remarque que tu poses une question profonde.\n\n` +
               `Peux-tu être plus spécifique? Je peux t'aider avec:\n` +
               `• Sciences et concepts\n` +
               `• Histoire et événements\n` +
               `• Technologie et programming\n` +
               `• Et bien d'autres sujets! 🚀`;
      } else if (q.includes('comment')) {
        return `💡 Bonne question! Pour une réponse plus détaillée, ` +
               `configure une clé API OpenAI, Claude ou Gemini.\n\n` +
               `En attendant, je peux t'aider avec des questions spécifiques!`;
      }
    }

    return `Je suis une IA avancée prêt à répondre à n'importe quelle question! 🤖\n\n` +
           `Pour des réponses de niveau ChatGPT/Claude/Gemini, configure une clé API ` +
           `(OPENAI_API_KEY, CLAUDE_API_KEY, ou GEMINI_API_KEY).\n\n` +
           `Ou utilise Ollama localement!\n\n` +
           `Pose-moi n'importe quelle question - je suis ici pour aider! 💬`;
  }

  /**
   * Tool use - Exécuter des actions
   */
  async useTool(toolName, params) {
    const tools = {
      'search': async (query) => {
        // Implémenter recherche web
        return `Résultats pour: ${query}`;
      },
      'calculate': async (expression) => {
        try {
          return eval(expression);
        } catch (e) {
          return 'Erreur de calcul';
        }
      },
      'translate': async (text, lang) => {
        // Implémenter traduction
        return `Traduction en ${lang}: ${text}`;
      }
    };

    return await tools[toolName]?.(params) || 'Tool non trouvé';
  }

  /**
   * Ajouter à la base RAG
   */
  addToRAG(tags, content) {
    tags.forEach(tag => {
      if (!this.ragIndex.has(tag)) {
        this.ragIndex.set(tag, []);
      }
      this.ragIndex.get(tag).push(content);
    });
  }
}

module.exports = new AdvancedAIService();
