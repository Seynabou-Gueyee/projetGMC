/**
 * Extensions Avancées pour le Chatbot TalkMe
 * Intégrations pour améliorer la culture générale et les capacités
 */

// 1. INTÉGRATION WIKIPEDIA (À IMPLÉMENTER)
const WikipediaIntegration = {
  async getWikipediaSummary(topic) {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
      );
      const data = await response.json();
      
      return {
        title: data.title,
        extract: data.extract.substring(0, 300) + '...',
        url: data.content_urls.mobile.page
      };
    } catch (error) {
      console.error('Wikipedia error:', error);
      return null;
    }
  },

  // Utilisation: Enrichir les définitions avec Wikipedia
  enrichDefinition(term, localResponse) {
    // Chercher sur Wikipedia et combiner avec réponse locale
    // Pour les personnages historiques, lieux géographiques, etc.
  }
};

// 2. INTÉGRATION GOOGLE KNOWLEDGE GRAPH
const KnowledgeGraphIntegration = {
  async getFactualInfo(query) {
    try {
      const response = await fetch(
        `https://kgsearch.googleapis.com/v1/entities:search?query=${query}&limit=1&indent=True&key=${process.env.GOOGLE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.itemListElement.length > 0) {
        return data.itemListElement[0]['result:description'];
      }
    } catch (error) {
      console.error('Knowledge Graph error:', error);
      return null;
    }
  }
};

// 3. INTÉGRATION NOUVELLE ACTUALITÉ
const NewsIntegration = {
  async getLatestNews(category = 'general') {
    try {
      // Utiliser NewsAPI.org
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&language=fr&apiKey=${process.env.NEWS_API_KEY}`
      );
      const data = await response.json();
      
      return data.articles.slice(0, 3).map(article => ({
        title: article.title,
        source: article.source.name,
        url: article.url
      }));
    } catch (error) {
      console.error('News API error:', error);
      return null;
    }
  }
};

// 4. INTÉGRATION MÉTÉO
const WeatherIntegration = {
  async getWeather(city) {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}&aqi=no`
      );
      const data = await response.json();
      
      return {
        city: data.location.name,
        temperature: data.current.temp_c,
        condition: data.current.condition.text,
        emoji: this.getWeatherEmoji(data.current.condition.code)
      };
    } catch (error) {
      console.error('Weather error:', error);
      return null;
    }
  },

  getWeatherEmoji(code) {
    const weatherMap = {
      1000: '☀️',  // Sunny
      1003: '⛅',  // Partly cloudy
      1006: '☁️',  // Cloudy
      1009: '🌧️', // Rainy
      1063: '🌧️', // Light rain
      1276: '⛈️', // Thunderstorm
      1255: '❄️',  // Snowy
    };
    return weatherMap[code] || '🌡️';
  }
};

// 5. INTÉGRATION TRADUCTION
const TranslationIntegration = {
  async translate(text, targetLanguage = 'en') {
    try {
      // Google Translate API
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            target: targetLanguage
          })
        }
      );
      
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return null;
    }
  }
};

// 6. INTÉGRATION CALCULATION AVANCÉE
const AdvancedCalculator = {
  evaluate(expression) {
    try {
      // Utiliser Wolfram Alpha pour calculs complexes
      // Actuellement utilise eval() avec validation
      const sanitized = expression
        .replace(/[^\d+\-*./ ()]/g, '')
        .trim();
      
      if (/^[\d+\-*./ ()]+$/.test(sanitized)) {
        const result = Function('"use strict"; return (' + sanitized + ')')();
        return {
          expression: expression,
          result: result,
          isValid: true
        };
      }
      
      return { isValid: false };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  },

  async solveWithWolframAlpha(query) {
    // Pour équations plus complexes
    try {
      const response = await fetch(
        `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=json&appid=${process.env.WOLFRAM_APP_ID}`
      );
      const data = await response.json();
      
      if (data.queryresult.success) {
        return data.queryresult.pods[1].subpods[0].plaintext;
      }
    } catch (error) {
      console.error('Wolfram Alpha error:', error);
      return null;
    }
  }
};

// 7. INTÉGRATION CITATIONS & INSPIRATION
const QuotesIntegration = {
  async getQuoteOfDay() {
    try {
      const response = await fetch('https://api.quotable.io/random');
      const data = await response.json();
      
      return {
        text: data.content,
        author: data.author,
        emoji: '💡'
      };
    } catch (error) {
      return {
        text: "La seule vraie sagesse est de connaître la limite de ses connaissances.",
        author: "Socrate",
        emoji: '💡'
      };
    }
  }
};

// 8. INTÉGRATION IMAGES & VISUALISATION
const ImageIntegration = {
  async getImageForTopic(topic) {
    try {
      // Utiliser Unsplash API
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${topic}&client_id=${process.env.UNSPLASH_API_KEY}`
      );
      const data = await response.json();
      
      return {
        url: data.urls.small,
        photographer: data.user.name,
        description: data.description
      };
    } catch (error) {
      return null;
    }
  }
};

// 9. SYSTÈME DE CONVERSATION AVEC MÉMOIRE
class ConversationMemory {
  constructor(maxHistoryLength = 10) {
    this.history = [];
    this.maxHistoryLength = maxHistoryLength;
    this.userPreferences = {};
    this.topicsDiscussed = [];
  }

  addMessage(role, content) {
    this.history.push({
      role,
      content,
      timestamp: new Date()
    });

    // Garder seulement les N derniers messages
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    // Track topics
    this.topicsDiscussed.push(this.extractTopic(content));
  }

  extractTopic(text) {
    // Simple extraction - peut être amélioré avec NLP
    const keywords = text.split(' ').filter(w => w.length > 4);
    return keywords[0] || 'general';
  }

  getContext() {
    return this.history
      .slice(-5) // Dernier 5 messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  rememberPreference(key, value) {
    this.userPreferences[key] = value;
  }

  getPreference(key) {
    return this.userPreferences[key];
  }

  getSummary() {
    return {
      totalMessages: this.history.length,
      topicsDiscussed: [...new Set(this.topicsDiscussed)],
      preferences: this.userPreferences
    };
  }
}

// 10. SYSTÈME DE NOTATION & APPRENTISSAGE
class FeedbackSystem {
  constructor() {
    this.ratings = [];
    this.improvements = [];
  }

  rateResponse(questionId, rating, comment = '') {
    this.ratings.push({
      questionId,
      rating, // 1-5 stars
      comment,
      timestamp: new Date()
    });
  }

  suggestImprovement(area, suggestion) {
    this.improvements.push({
      area,
      suggestion,
      timestamp: new Date()
    });
  }

  getAverageRating() {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / this.ratings.length).toFixed(2);
  }

  getMostFlaggedIssues() {
    const issueCounts = {};
    this.ratings
      .filter(r => r.rating < 3)
      .forEach(r => {
        const key = r.comment || 'no_comment';
        issueCounts[key] = (issueCounts[key] || 0) + 1;
      });
    return Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }
}

// 11. INTEGRATION AVEC SERVICES EXTERNES
class ExternalServices {
  static async enrichResponse(question, baseResponse) {
    try {
      // Chercher sur Wikipedia pour plus de détails
      if (question.includes('qui') || question.includes('qu\'est-ce')) {
        const wikipediaInfo = await WikipediaIntegration.getWikipediaSummary(
          question.replace(/qui est|qu'est-ce|qu'est|c'est quoi/gi, '').trim()
        );
        
        if (wikipediaInfo) {
          return `${baseResponse}\n\n📚 Plus d'info: ${wikipediaInfo.extract}...\n🔗 ${wikipediaInfo.url}`;
        }
      }

      // Ajouter actualités si pertinent
      if (question.match(/actualit|news|dernier|récent/i)) {
        const news = await NewsIntegration.getLatestNews();
        if (news) {
          return `${baseResponse}\n\n📰 Actualités: ${news[0].title}`;
        }
      }

      return baseResponse;
    } catch (error) {
      return baseResponse;
    }
  }
}

module.exports = {
  WikipediaIntegration,
  KnowledgeGraphIntegration,
  NewsIntegration,
  WeatherIntegration,
  TranslationIntegration,
  AdvancedCalculator,
  QuotesIntegration,
  ImageIntegration,
  ConversationMemory,
  FeedbackSystem,
  ExternalServices
};
