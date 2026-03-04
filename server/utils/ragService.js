/**
 * 🔍 RAG Service (Retrieval-Augmented Generation)
 * 
 * Augmente les réponses IA avec de la connaissance externe:
 * - Documents
 * - Historique chat
 * - FAQ
 * - Données utilisateur
 * - Base de connaissance
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class RAGService {
  constructor() {
    this.knowledgeBase = new Map();
    this.documentIndex = new Map();
    this.conversationContext = new Map();
    this.faqDatabase = [];
    this.initialized = false;
  }

  /**
   * Initialiser le service RAG
   */
  async initialize() {
    try {
      await this.loadKnowledgeBase();
      await this.loadFAQs();
      this.initialized = true;
      logger.info('[RAG] Service initialized successfully');
    } catch (error) {
      logger.error('[RAG] Initialization failed:', error);
      this.initialized = false;
    }
  }

  /**
   * Charger base de connaissance depuis fichiers
   */
  async loadKnowledgeBase() {
    try {
      const knowledgeDir = path.join(__dirname, '../../knowledge');
      
      // Créer dossier s'il n'existe pas
      try {
        await fs.access(knowledgeDir);
      } catch {
        await fs.mkdir(knowledgeDir, { recursive: true });
        logger.info('[RAG] Created knowledge directory:', knowledgeDir);
        return;
      }

      // Charger documents
      const files = await fs.readdir(knowledgeDir);
      
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.txt')) {
          const filepath = path.join(knowledgeDir, file);
          const content = await fs.readFile(filepath, 'utf-8');
          
          const docId = file.replace(/\.(md|txt)$/, '');
          this.knowledgeBase.set(docId, {
            title: docId,
            content,
            source: file,
            indexed: this.indexDocument(docId, content)
          });
        }
      }

      logger.info('[RAG] Loaded', this.knowledgeBase.size, 'documents');
    } catch (error) {
      logger.warn('[RAG] Knowledge base loading failed:', error.message);
    }
  }

  /**
   * Indexer un document pour recherche rapide
   */
  indexDocument(docId, content) {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

    const index = {};
    words.forEach(word => {
      if (!index[word]) index[word] = 0;
      index[word]++;
    });

    this.documentIndex.set(docId, index);
    return index;
  }

  /**
   * Charger FAQs depuis BD ou fichier
   */
  async loadFAQs() {
    try {
      const faqFile = path.join(__dirname, '../../knowledge/faq.json');
      
      try {
        const data = await fs.readFile(faqFile, 'utf-8');
        this.faqDatabase = JSON.parse(data);
        logger.info('[RAG] Loaded', this.faqDatabase.length, 'FAQ items');
      } catch {
        // FAQ file not found, will use empty array
        this.faqDatabase = [];
      }
    } catch (error) {
      logger.warn('[RAG] FAQ loading failed:', error.message);
    }
  }

  /**
   * Ajouter un document à la base de connaissance
   */
  addDocument(docId, content, metadata = {}) {
    this.knowledgeBase.set(docId, {
      title: metadata.title || docId,
      content,
      source: metadata.source || 'dynamic',
      metadata,
      indexed: this.indexDocument(docId, content)
    });

    logger.info('[RAG] Added document:', docId);
  }

  /**
   * Ajouter FAQ item
   */
  addFAQ(question, answer) {
    this.faqDatabase.push({
      question: question.toLowerCase(),
      answer,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Rechercher documents pertinents
   * @param {string} query - Question de l'utilisateur
   * @param {number} topK - Nombre de résultats
   */
  searchDocuments(query, topK = 3) {
    if (!this.initialized) return [];

    const queryWords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/);

    const scores = new Map();

    // Scorer chaque document
    for (const [docId, index] of this.documentIndex) {
      let score = 0;
      
      queryWords.forEach(word => {
        if (index[word]) {
          score += index[word];
        }
      });

      if (score > 0) {
        scores.set(docId, score);
      }
    }

    // Retourner top K
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([docId, score]) => ({
        id: docId,
        score,
        ...this.knowledgeBase.get(docId)
      }));
  }

  /**
   * Rechercher FAQs pertinents
   */
  searchFAQs(query) {
    if (!this.faqDatabase.length) return [];

    const queryLower = query.toLowerCase();
    const results = [];

    for (const faq of this.faqDatabase) {
      // Simple matching - peut être amélioré avec fuzzy matching
      const similarity = this.calculateSimilarity(queryLower, faq.question);
      
      if (similarity > 0.3) {
        results.push({
          ...faq,
          similarity
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  /**
   * Calculer similarité entre deux strings
   */
  calculateSimilarity(str1, str2) {
    const set1 = new Set(str1.split(/\s+/));
    const set2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Obtenir contexte enrichi pour une requête
   * @param {string} question
   * @param {array} conversationHistory
   * @returns {object} Contexte enrichi
   */
  enrichContext(question, conversationHistory = []) {
    const context = {
      documents: [],
      faqs: [],
      conversationContext: '',
      recommendations: []
    };

    // Chercher documents pertinents
    context.documents = this.searchDocuments(question);

    // Chercher FAQs
    context.faqs = this.searchFAQs(question);

    // Extraire contexte conversation
    if (conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-5);
      context.conversationContext = recentMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
    }

    // Recommendations basées sur la conversation
    context.recommendations = this.generateRecommendations(
      question,
      conversationHistory
    );

    return context;
  }

  /**
   * Formatter le contexte pour le prompt
   */
  formatContextForPrompt(enrichedContext) {
    let contextText = '';

    // Documents
    if (enrichedContext.documents.length > 0) {
      contextText += '\n## Reference Documents:\n';
      enrichedContext.documents.forEach((doc, idx) => {
        contextText += `\n### Document ${idx + 1}: ${doc.title}\n`;
        contextText += `${doc.content.substring(0, 500)}...\n`;
      });
    }

    // FAQs
    if (enrichedContext.faqs.length > 0) {
      contextText += '\n## Related FAQ Items:\n';
      enrichedContext.faqs.forEach((faq, idx) => {
        contextText += `\n${idx + 1}. Q: ${faq.question}\n`;
        contextText += `A: ${faq.answer}\n`;
      });
    }

    // Conversation context
    if (enrichedContext.conversationContext) {
      contextText += '\n## Conversation History:\n';
      contextText += enrichedContext.conversationContext;
    }

    return contextText;
  }

  /**
   * Générer recommendations basées sur contexte
   */
  generateRecommendations(question, conversationHistory) {
    const recommendations = [];

    // Analyser topics dans historique
    if (conversationHistory.length > 0) {
      const topics = this.extractTopics(conversationHistory);
      
      // Recommander documents liés aux topics
      for (const topic of topics) {
        const relatedDocs = this.searchDocuments(topic, 1);
        if (relatedDocs.length > 0) {
          recommendations.push({
            type: 'relatedDocument',
            topic,
            document: relatedDocs[0]
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Extraire topics d'une conversation
   */
  extractTopics(conversationHistory) {
    const topics = [];
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'be', 'been', 'that', 'this', 'it', 'i', 'you', 'we', 'me', 'him', 'her'
    ]);

    for (const message of conversationHistory.slice(-10)) {
      const words = message.content
        .toLowerCase()
        .split(/\s+/)
        .filter(w => !stopwords.has(w) && w.length > 3);
      
      topics.push(...words);
    }

    // Retourner top words
    const wordFreq = {};
    topics.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
  }

  /**
   * Ajouter conversation à la mémoire pour RAG
   */
  storeConversation(userId, messages) {
    this.conversationContext.set(userId, {
      messages,
      timestamp: new Date().toISOString(),
      topicsSummary: this.extractTopics(messages)
    });
  }

  /**
   * Récupérer conversation précédente
   */
  getConversationContext(userId) {
    return this.conversationContext.get(userId) || null;
  }

  /**
   * Créer un document synthétique à partir de la conversation
   */
  synthesizeDocument(userId) {
    const context = this.getConversationContext(userId);
    if (!context) return null;

    const docId = `conversation-${userId}-${Date.now()}`;
    const content = context.messages
      .map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`)
      .join('\n\n');

    this.addDocument(docId, content, {
      title: `Conversation: ${context.topicsSummary.join(', ')}`,
      source: 'conversation',
      userId,
      timestamp: context.timestamp
    });

    return docId;
  }

  /**
   * Sauvegarder la base de connaissance
   */
  async saveKnowledgeBase() {
    try {
      const dataFile = path.join(__dirname, '../../knowledge/knowledge-base.json');
      const data = Array.from(this.knowledgeBase.entries()).map(([id, doc]) => ({
        id,
        title: doc.title,
        content: doc.content,
        source: doc.source,
        metadata: doc.metadata
      }));

      await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
      logger.info('[RAG] Knowledge base saved');
    } catch (error) {
      logger.error('[RAG] Save failed:', error);
    }
  }

  /**
   * Obtenir statistiques RAG
   */
  getStats() {
    return {
      documentsCount: this.knowledgeBase.size,
      faqCount: this.faqDatabase.length,
      conversationsStored: this.conversationContext.size,
      initialized: this.initialized
    };
  }
}

// Export singleton
module.exports = new RAGService();
