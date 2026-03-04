/**
 * 💬 Advanced Conversation Service
 * 
 * Gère les conversations avancées:
 * - Multi-turn dialogue
 * - Context management
 * - Emotion detection
 * - Conversation summarization
 * - User preferences
 * - Conversation analysis
 */

const logger = require('./logger');

class AdvancedConversationService {
  constructor() {
    this.conversations = new Map();
    this.userProfiles = new Map();
    this.conversationSessions = new Map();
  }

  /**
   * Démarrer nouvelle conversation
   */
  startConversation(userId, metadata = {}) {
    const conversationId = `conv-${userId}-${Date.now()}`;
    
    const conversation = {
      id: conversationId,
      userId,
      startTime: new Date(),
      messages: [],
      metadata,
      context: {
        currentTopic: null,
        subtopics: [],
        sentiment: 'neutral',
        emotionTrajectory: [],
        userPreferences: this.getUserProfile(userId)
      },
      summary: null,
      isActive: true
    };

    this.conversations.set(conversationId, conversation);
    this.conversationSessions.set(userId, conversationId);

    logger.info(`[CONV] Started conversation: ${conversationId}`);
    return conversationId;
  }

  /**
   * Ajouter message à la conversation
   */
  addMessage(conversationId, role, content, metadata = {}) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      logger.warn('[CONV] Conversation not found:', conversationId);
      return null;
    }

    const message = {
      role,
      content,
      timestamp: new Date(),
      metadata,
      emotion: this.detectEmotion(content),
      entities: this.extractEntities(content),
      keywords: this.extractKeywords(content)
    };

    conversation.messages.push(message);

    // Update conversation context
    this.updateConversationContext(conversationId, message);

    return message;
  }

  /**
   * Détecter émotion du message
   */
  detectEmotion(text) {
    const emotionScores = {
      happy: 0,
      sad: 0,
      angry: 0,
      confused: 0,
      excited: 0
    };

    const emotionKeywords = {
      happy: ['great', 'good', 'excellent', 'love', 'happy', '😊', 'perfect'],
      sad: ['sad', 'bad', 'terrible', 'hate', 'awful', 'depressed', '😢'],
      angry: ['angry', 'furious', 'hate', '😠', 'annoyed', 'upset'],
      confused: ['confused', 'unclear', 'dont understand', 'what', '?', '😕'],
      excited: ['wow', 'amazing', 'awesome', 'cant wait', '!', '😄', 'thrilled']
    };

    const lowerText = text.toLowerCase();

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          emotionScores[emotion]++;
        }
      });
    }

    // Trouver émotion dominante
    const dominantEmotion = Object.entries(emotionScores)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      primary: dominantEmotion[1] > 0 ? dominantEmotion[0] : 'neutral',
      scores: emotionScores,
      confidence: dominantEmotion[1] / 5 // Normalize to 0-1
    };
  }

  /**
   * Extraire entités nommées
   */
  extractEntities(text) {
    const entities = {
      names: [],
      locations: [],
      organizations: [],
      topics: [],
      timestamps: []
    };

    // Simple entity extraction (peut être amélioré avec NER)
    
    // Dates/Timestamps
    const datePattern = /\b(today|tomorrow|yesterday|monday|tuesday|january|february|2024|2025|2026)\b/gi;
    const dateMatches = text.match(datePattern) || [];
    entities.timestamps = [...new Set(dateMatches.map(m => m.toLowerCase()))];

    // Topics (capitalized words)
    const capitalizedPattern = /\b[A-Z][a-z]+\b/g;
    entities.names = [...new Set(text.match(capitalizedPattern) || [])];

    return entities;
  }

  /**
   * Extraire keywords importants
   */
  extractKeywords(text) {
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'be', 'been', 'have', 'has', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'can', 'that', 'this', 'it',
      'i', 'you', 'we', 'he', 'she', 'it', 'me', 'him', 'her', 'us'
    ]);

    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter(w => 
        !stopwords.has(w) && 
        w.length > 2 && 
        !/[^\w]/.test(w)
      );

    // Return top 5 keywords
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }

  /**
   * Mettre à jour le contexte de la conversation
   */
  updateConversationContext(conversationId, newMessage) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    const context = conversation.context;

    // Update sentiment trajectory
    context.emotionTrajectory.push({
      emotion: newMessage.emotion.primary,
      confidence: newMessage.emotion.confidence,
      timestamp: newMessage.timestamp
    });

    // Keep only last 20 emotions
    if (context.emotionTrajectory.length > 20) {
      context.emotionTrajectory.shift();
    }

    // Update current sentiment (average of last 5)
    const recentEmotions = context.emotionTrajectory.slice(-5);
    const emotionCounts = {};
    recentEmotions.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    const dominantEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0];
    context.sentiment = dominantEmotion ? dominantEmotion[0] : 'neutral';

    // Update topics from keywords
    context.subtopics = [
      ...new Set([
        ...context.subtopics,
        ...newMessage.keywords
      ])
    ].slice(-10);
  }

  /**
   * Obtenir contexte complet pour l'IA
   */
  getFullContext(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    return {
      conversationId,
      userId: conversation.userId,
      messageCount: conversation.messages.length,
      context: conversation.context,
      recentMessages: conversation.messages.slice(-5),
      summary: conversation.summary,
      duration: new Date() - conversation.startTime
    };
  }

  /**
   * Obtenir les messages formattés pour l'IA
   */
  getFormattedMessages(conversationId, includeContext = true) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return [];

    let messages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Ajouter contexte au système si demandé
    if (includeContext && conversation.messages.length > 0) {
      const context = conversation.context;
      const systemContext = `
[Context Information]
Current Topic: ${context.currentTopic || 'General'}
User Sentiment: ${context.sentiment}
Subtopics discussed: ${context.subtopics.slice(-3).join(', ') || 'None'}
`;

      messages = [
        {
          role: 'system',
          content: systemContext
        },
        ...messages
      ];
    }

    return messages;
  }

  /**
   * Créer summary de la conversation
   */
  summarizeConversation(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.messages.length === 0) return null;

    const summary = {
      startTime: conversation.startTime,
      endTime: new Date(),
      messageCount: conversation.messages.length,
      mainTopics: [...new Set(
        conversation.messages
          .flatMap(m => m.keywords)
          .slice(0, 5)
      )],
      emotionTrajectory: conversation.context.emotionTrajectory,
      finalSentiment: conversation.context.sentiment,
      keyEntities: {
        names: [...new Set(
          conversation.messages.flatMap(m => m.entities.names).slice(0, 3)
        )],
        topics: [...new Set(
          conversation.messages.flatMap(m => m.entities.topics).slice(0, 3)
        )]
      },
      userSatisfaction: this.estimateSatisfaction(conversation)
    };

    conversation.summary = summary;
    return summary;
  }

  /**
   * Estimer satisfaction de l'utilisateur
   */
  estimateSatisfaction(conversation) {
    if (conversation.messages.length === 0) return 0.5;

    // Analyser trajectory émotionnelle
    const emotionTrajectory = conversation.context.emotionTrajectory;
    if (emotionTrajectory.length === 0) return 0.5;

    const lastEmotion = emotionTrajectory[emotionTrajectory.length - 1];
    const emotionScores = {
      happy: 0.9,
      excited: 0.85,
      neutral: 0.5,
      confused: 0.3,
      angry: 0.1,
      sad: 0.2
    };

    return emotionScores[lastEmotion.emotion] || 0.5;
  }

  /**
   * Gestionnaires de profil utilisateur
   */
  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        conversationCount: 0,
        preferredTopics: [],
        language: 'en',
        communicationStyle: 'balanced',
        averageSentiment: 'neutral',
        metadata: {}
      });
    }

    return this.userProfiles.get(userId);
  }

  /**
   * Mettre à jour profil utilisateur
   */
  updateUserProfile(userId, updates) {
    const profile = this.getUserProfile(userId);
    Object.assign(profile, updates);
    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Analyser tendances de conversation pour un utilisateur
   */
  getUserConversationTrends(userId) {
    const userConversations = Array.from(this.conversations.values())
      .filter(c => c.userId === userId && c.summary);

    if (userConversations.length === 0) return null;

    const trends = {
      averageLength: userConversations.reduce((sum, c) => sum + c.messages.length, 0) / userConversations.length,
      topicsFrequency: {},
      sentimentProgression: [],
      commonKeywords: [],
      averageSatisfaction: userConversations.reduce((sum, c) => sum + (c.summary?.userSatisfaction || 0.5), 0) / userConversations.length
    };

    // Aggregate topics
    userConversations.forEach(c => {
      c.summary.mainTopics.forEach(topic => {
        trends.topicsFrequency[topic] = (trends.topicsFrequency[topic] || 0) + 1;
      });
    });

    // Sentiment progression
    trends.sentimentProgression = userConversations.map(c => c.summary.finalSentiment);

    // Common keywords
    const allKeywords = userConversations.flatMap(c => c.summary.mainTopics);
    const keywordFreq = {};
    allKeywords.forEach(kw => {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    });
    trends.commonKeywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([kw]) => kw);

    return trends;
  }

  /**
   * Terminer une conversation
   */
  endConversation(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    conversation.isActive = false;
    const summary = this.summarizeConversation(conversationId);

    // Update user profile
    const profile = this.getUserProfile(conversation.userId);
    profile.conversationCount++;
    profile.averageSentiment = conversation.context.sentiment;
    profile.preferredTopics = [
      ...new Set([
        ...profile.preferredTopics,
        ...conversation.context.subtopics
      ])
    ].slice(-10);

    logger.info(`[CONV] Ended conversation: ${conversationId}`);
    return summary;
  }

  /**
   * Obtenir statistiques globales
   */
  getStats() {
    return {
      activeConversations: Array.from(this.conversations.values()).filter(c => c.isActive).length,
      totalConversations: this.conversations.size,
      registeredUsers: this.userProfiles.size,
      averageMessagePerConversation: this.conversations.size > 0 
        ? Array.from(this.conversations.values()).reduce((sum, c) => sum + c.messages.length, 0) / this.conversations.size 
        : 0
    };
  }

  /**
   * Exporter conversation (pour analyse)
   */
  exportConversation(conversationId, format = 'json') {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    if (format === 'json') {
      return JSON.stringify(conversation, null, 2);
    }

    if (format === 'text') {
      return conversation.messages
        .map(m => `[${m.role.toUpperCase()}]: ${m.content}`)
        .join('\n\n');
    }

    return null;
  }
}

module.exports = new AdvancedConversationService();
