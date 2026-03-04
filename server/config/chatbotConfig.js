/**
 * Configuration avancée pour le chatbot TalkMe
 * Permet de personnaliser les réponses et les connaissances du chatbot
 */

const chatbotConfig = {
  // Configuration générale
  general: {
    name: 'TalkMeBot',
    version: '2.0',
    language: 'fr', // fr pour français, en pour anglais
    personality: 'friendly', // friendly, professional, funny
    useEmojis: true,
    maxResponseLength: 500,
  },

  // Configuration de l'IA
  ai: {
    // Utiliser OpenAI si les clés sont disponibles
    useOpenAI: !!process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    provider: process.env.AI_PROVIDER || 'openai', // openai, local, hybrid
    
    // Température pour contrôler la créativité (0-1)
    temperature: 0.7,
    
    // Nombre maximum de tokens
    maxTokens: 500,
    
    // Utiliser le fallback local si API échoue
    useFallback: true,
    
    // Historique de conversation à conserver
    conversationHistory: 5,
  },

  // Domaines de connaissance activés
  knowledgeDomains: {
    sciences: true,           // Sciences, physique, chimie, astronomie
    histoire: true,          // Histoire, périodes, événements
    geographie: true,        // Géographie, pays, capitales
    litterature: true,       // Littérature, livres, auteurs
    technologie: true,       // Technologie, programmation, IT
    sport: true,            // Sports, compétitions
    cuisine: true,          // Cuisine, gastronomie, recettes
    culturePop: true,       // Films, séries, musique, célébrités
    economie: true,         // Économie, finance, investissement
    sante: true,            // Santé, bien-être, fitness
    philosophie: true,      // Philosophie, éthique
    psychologie: true,      // Psychologie, comportement
    politique: true,        // Politique, gouvernement
    sociologie: true,       // Sociologie, société
    art: true,              // Art, peinture, sculpture
    mathematiques: true,    // Mathématiques, calcul
  },

  // Réponses spéciales
  specialResponses: {
    enableEncouragement: true,    // Encouragements motivants
    enableHumor: true,            // Blagues et humour
    enableEmotionalSupport: true, // Soutien émotionnel
    enableCompliments: true,      // Compliments
  },

  // Mode de conversation
  conversation: {
    rememberUserName: true,       // Se souvenir du nom de l'utilisateur
    trackConversationHistory: true, // Garder historique
    enableFollowUp: true,          // Poser des questions de suivi
    enableCorrection: true,        // Corriger poliment les erreurs
    enableClarification: true,     // Demander des clarifications
  },

  // Filtrage de contenu
  safety: {
    filterProfanity: true,         // Filtrer les insultes
    filterHateSpeech: true,        // Filtrer les discours haineux
    enableContentWarnings: true,   // Avertissements pour contenu sensible
    maxConsecutiveRequests: 100,   // Limite de requêtes
  },

  // Langues supportées
  supportedLanguages: {
    fr: 'Français',
    en: 'Anglais',
    es: 'Espagnol',
    de: 'Allemand',
    it: 'Italien',
  },

  // Base de connaissance enrichie
  knowledgeBase: {
    enableWikipediaIntegration: false, // À implémenter
    enableWebSearch: false,             // À implémenter
    enableCustomKnowledge: true,        // Base locale de connaissances
    customKnowledgePath: './data/kb',   // Chemin vers la base de connaissances
  },

  // Métrique et analytics
  analytics: {
    trackQuestions: true,
    saveConversations: false,
    logErrors: true,
    generateReports: true,
  },

  // Réponses par défaut
  defaultResponses: {
    notUnderstood: 'Je ne suis pas sûr de bien comprendre. Peux-tu réexpliquer? 🤔',
    noAnswer: 'Je n\'ai pas la réponse à cette question, mais je peux essayer de t\'aider autrement! 💡',
    timeout: 'Désolé, ma réponse a pris trop de temps. Réessaye s\'il te plaît! ⏱️',
    error: 'Oups! Une erreur est survenue. Je vais me rétablir! 🔧',
  },
};

module.exports = chatbotConfig;
