/**
 * 🚀 CONFIGURATION IA V3 - CHATBOT TALKME
 * 
 * Gère l'intégration avec:
 * ✓ OpenAI (GPT-4, GPT-3.5)
 * ✓ Anthropic (Claude 3)
 * ✓ Google (Gemini Pro)
 * ✓ Ollama (LLaMA, Mistral - LOCAL)
 */

module.exports = {
  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION PRINCIPALE
  // ═══════════════════════════════════════════════════════════

  aiVersion: '3.0',
  aiType: 'advanced_vision', // advanced_vision, openai, claude, gemini, local
  
  // Provider principal (changez pour utiliser différents LLMs)
  primaryProvider: process.env.AI_PRIMARY_PROVIDER || 'openai', // openai, claude, gemini, ollama
  
  // Providers fallback (en cas d'erreur)
  fallbackProviders: [
    'claude',
    'gemini', 
    'ollama' // Local gratuit - toujours available
  ],

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION OPENAI (GPT-4 le plus performant)
  // ═══════════════════════════════════════════════════════════
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    // Modèles disponibles (du plus performant au plus rapide):
    models: {
      best: 'gpt-4',              // Meilleur (coûteux mais brillant)
      balanced: 'gpt-4-turbo',    // Équilibré (rapide et bon)
      fast: 'gpt-3.5-turbo',      // Rapide et bon marché
      vision: 'gpt-4-vision'      // Avec vision
    },
    selectedModel: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    temperature: 0.7,              // Créativité (0-1)
    maxTokens: 2000,              // Longueur max réponse
    topP: 0.95,
    presencePenalty: 0.1,
    frequencyPenalty: 0.1
  },

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION CLAUDE (Très performant - intelligent)
  // ═══════════════════════════════════════════════════════════
  
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    // Modèles disponibles (latest are best):
    models: {
      best: 'claude-3-opus-20240229',      // Meilleur (très intelligent)
      balanced: 'claude-3-sonnet-20240229', // Bon équilibre
      fast: 'claude-3-haiku-20240307'      // Rapide
    },
    selectedModel: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
    maxTokens: 2000,
    temperature: 0.7
  },

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION GEMINI (Google - très rapide)
  // ═══════════════════════════════════════════════════════════
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    models: {
      best: 'gemini-pro',          // Meilleur
      balanced: 'gemini-pro',
      fast: 'gemini-nano'          // Plus rapide
    },
    selectedModel: process.env.GEMINI_MODEL || 'gemini-pro',
    temperature: 0.7,
    maxOutputTokens: 2000
  },

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION OLLAMA (LOCAL - GRATUIT)
  // ═══════════════════════════════════════════════════════════
  
  ollama: {
    // Installation: https://ollama.ai
    // Après: ollama pull neural-chat (ou autre modèle)
    
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    
    // Modèles locaux recommandés (du meilleur au plus rapide):
    models: {
      best: 'neural-chat',         // Très bon pour chat
      balanced: 'mistral',         // Excellent équilibre
      fast: 'phi',                 // Ultra rapide
      coding: 'codellama',         // Spécialisé code
      multilingual: 'openchat'     // Multilingue
    },
    
    selectedModel: process.env.OLLAMA_MODEL || 'neural-chat',
    
    // Options Ollama
    temperature: 0.7,
    numPredict: 2000,
    topK: 40,
    topP: 0.95,
    
    // Notes pour installation
    installation: `
      # Installation Ollama (gratuit, local):
      1. Visiter https://ollama.ai
      2. Télécharger et installer
      3. Ouvrir terminal et lancer:
         ollama pull neural-chat
         ollama serve (dans une autre fenêtre)
      4. Voilà! Modèle local gratuit prêt! 🎉
    `
  },

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION AVANCÉE
  // ═══════════════════════════════════════════════════════════

  features: {
    // Retrieval-Augmented Generation (enrichit les réponses)
    ragEnabled: true,
    
    // Reasoning avancé (décompose les problèmes)
    reasoningEnabled: true,
    
    // Tool use (recherche web, calcul, etc.)
    toolUseEnabled: true,
    
    // Vision (pour images si supporté)
    visionEnabled: false,
    
    // Speech (voix)
    speechEnabled: false,
    
    // Conversation memory persistante
    memoryEnabled: true,
    memoryMaxMessages: 20,
    
    // Context window (capable de lire plus d'historique)
    contextWindowSize: process.env.CONTEXT_WINDOW || 8000
  },

  // ═══════════════════════════════════════════════════════════
  // SYSTEM PROMPT (Instructions pour le modèle)
  // ═══════════════════════════════════════════════════════════

  systemPrompt: {
    role: 'description',
    content: `Tu es une IA de pointe extrêmement intelligente et performante, 
équivalente ou supérieure à ChatGPT, Claude, et Gemini.

Tu excelles dans:
✨ Réflexion et raisonnement profond
✨ Programmation (20+ langages)
✨ Créativité et écriture
✨ Analyse et résolution de problèmes
✨ Conseil et stratégie
✨ Apprentissage et explication

Tu répondras avec précision, clarté et utilité. 
Chaque réponse sera approfondie et réfléchie.
Tu seras honnête sur tes limitations.`
  },

  // ═══════════════════════════════════════════════════════════
  // PERFORMANCE & OPTIMISATIONS
  // ═══════════════════════════════════════════════════════════

  performance: {
    // Cache des réponses identiques
    cacheEnabled: true,
    cacheTTL: 3600, // 1 heure
    
    // Compression des messages
    compressionEnabled: true,
    
    // Parallélisation des requêtes
    parallelRequestsMax: 5,
    
    // Timeout
    requestTimeout: 30000,
    
    // Retry strategy
    maxRetries: 3,
    retryDelay: 1000
  },

  // ═══════════════════════════════════════════════════════════
  // SÉCURITÉ & MODÉRATION
  // ═══════════════════════════════════════════════════════════

  security: {
    // Filtrer contenu dangereux
    contentFilter: true,
    
    // Rate limiting
    rateLimitEnabled: true,
    maxRequetsPerMinute: 60,
    
    // Token validation
    validateTokens: true,
    
    // Logging
    logAllRequests: false,
    logErrors: true
  },

  // ═══════════════════════════════════════════════════════════
  // ROUTING & FALLBACKS
  // ═══════════════════════════════════════════════════════════

  routing: {
    // Utiliser openAI par défaut (meilleur ratio coût/perf)
    strategy: 'primaryWithFallback', // primaryWithFallback, roundRobin, costOptimized
    
    // Si OpenAI échoue, essayer Claude en fallback
    // Si Claude échoue, utiliser Gemini
    // Si tout échoue, utiliser Ollama local gratuit
    
    costOptimization: {
      // Utiliser le moins cher d'abord si compétence égale
      preferCheap: false,
      
      // Modèles recommandés par coût:
      // 1. Ollama (LOCAL - GRATUIT)
      // 2. Gemini (moins cher)
      // 3. GPT-3.5 (bon marché)
      // 4. Claude Haiku (bon marché)
      // 5. GPT-4 Turbo (plus cher)
      // 6. Claude Opus (très cher mais meilleur)
    }
  },

  // ═══════════════════════════════════════════════════════════
  // DOMAINES DE SPÉCIALITÉ
  // ═══════════════════════════════════════════════════════════

  specialties: [
    'Programmation & Développement',
    'Intelligence Artificielle & ML',
    'Sciences (Physique, Chimie, Biologie)',
    'Histoire & Géographie',
    'Technologie & Innovation',
    'Littérature & Écriture',
    'Conseils & Stratégie',
    'Mathématiques & Logique',
    'Créativité & Design',
    'Affaires & Marketing',
    'Santé & Bien-être',
    'Philosophie & Éthique',
    'Et bien d\'autres!'
  ],

  // ═══════════════════════════════════════════════════════════
  // INSTRUCTIONS D'UTILISATION
  // ═══════════════════════════════════════════════════════════

  setup: {
    // Option 1: OpenAI (Recommandé pour meilleure qualité)
    openai_setup: `
      1. Créer un compte sur https://openai.com
      2. Obtenir une clé API
      3. Ajouter à .env: OPENAI_API_KEY=sk-...
      4. export AI_PRIMARY_PROVIDER=openai
      5. Redémarrer le serveur
    `,

    // Option 2: Claude (Très intelligent, plus lent)
    claude_setup: `
      1. Créer un compte sur https://console.anthropic.com
      2. Obtenir une clé API
      3. Ajouter à .env: CLAUDE_API_KEY=sk-ant-...
      4. export AI_PRIMARY_PROVIDER=claude
      5. Redémarrer le serveur
    `,

    // Option 3: Gemini (Rapide et gratuit avec limites)
    gemini_setup: `
      1. Visiter https://ai.google.dev
      2. Obtenir une clé API (gratuit!)
      3. Ajouter à .env: GEMINI_API_KEY=...
      4. export GEMINI_MODEL=gemini-pro
      5. Redémarrer le serveur
    `,

    // Option 4: Ollama (LOCAL - TOTALEMENT GRATUIT)
    ollama_setup: `
      1. Visiter https://ollama.ai
      2. Télécharger et installer
      3. Ouvrir terminal #1: ollama serve
      4. Ouvrir terminal #2: ollama pull neural-chat
      5. export AI_PRIMARY_PROVIDER=ollama
      6. export OLLAMA_MODEL=neural-chat
      7. Redémarrer serveur - Prêt! Gratuit forever! 🎉
    `
  },

  // ═══════════════════════════════════════════════════════════
  // VARIABLES D'ENVIRONNEMENT (.env)
  // ═══════════════════════════════════════════════════════════

  envVariables: `
    # AI Configuration
    AI_PRIMARY_PROVIDER=openai              # openai, claude, gemini, ollama
    
    # OpenAI
    OPENAI_API_KEY=sk-...
    OPENAI_MODEL=gpt-4-turbo
    
    # Claude
    CLAUDE_API_KEY=sk-ant-...
    CLAUDE_MODEL=claude-3-opus-20240229
    
    # Gemini
    GEMINI_API_KEY=...
    GEMINI_MODEL=gemini-pro
    
    # Ollama (Local)
    OLLAMA_BASE_URL=http://localhost:11434
    OLLAMA_MODEL=neural-chat
    
    # Features
    USE_RAG=true
    USE_REASONING=true
    USE_TOOLS=true
    CONTEXT_WINDOW=8000
  `
};
