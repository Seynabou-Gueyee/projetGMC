# 🚀 Guide d'Implémentation des Extensions du Chatbot

## Overview

Ce guide montre comment implémenter les extensions avancées pour améliorer significativement les capacités du chatbot TalkMe.

---

## 📋 Prérequis - Variables d'Environnement

Ajoutez ces variables à votre fichier `.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
AI_MODEL=gpt-3.5-turbo

# Google APIs
GOOGLE_API_KEY=AIzaXXXXXXXXXXXXXXXX
GOOGLE_TRANSLATE_API_KEY=AIzaXXXXXXXXXXXXXXXX

# News
NEWS_API_KEY=xxxxxxxxxxxxxxxxxxxx

# Météo
WEATHER_API_KEY=xxxxxxxxxxxxxxxxxxxx

# Wolfram Alpha
WOLFRAM_APP_ID=XXXX-XXXX-XXXX

# Autres
UNSPLASH_API_KEY=xxxxxxxxxxxxxxxxxxxx
```

---

## 🔧 Implémentation Étape par Étape

### 1. Installation des Dépendances

```bash
npm install axios dotenv
```

### 2. Importer les Extensions

Dans `server/utils/aiService.js`, au top du fichier:

```javascript
const {
  WikipediaIntegration,
  NewsIntegration,
  WeatherIntegration,
  ConversationMemory,
  FeedbackSystem,
  ExternalServices
} = require('./advancedChatbotExtensions');
```

### 3. Initialiser la Mémoire de Conversation

Dans la classe `AIService`:

```javascript
class AIService {
  constructor() {
    // ... existing code ...
    this.conversationMemory = new ConversationMemory(10);
    this.feedbackSystem = new FeedbackSystem();
  }

  // Ajouter après getResponse()
  async getResponseWithContext(question, conversationHistory = [], userId) {
    // Ajouter à la mémoire
    this.conversationMemory.addMessage('user', question);
    
    const response = await this.getResponse(question, conversationHistory);
    this.conversationMemory.addMessage('assistant', response);
    
    return response;
  }
}
```

### 4. Enrichir les Réponses

Modifiez `server/utils/aiService.js`:

```javascript
async getLocalResponse(question) {
  const q = question.toLowerCase().trim();

  // ... existing patterns ...

  // NOUVEAUTÉ: Utiliser ExternalServices pour enrichir
  let response = await this.basicLocalResponse(q);
  
  if (process.env.USE_ADVANCED_FEATURES === 'true') {
    response = await ExternalServices.enrichResponse(question, response);
  }
  
  return response;
}
```

### 5. Ajouter la Recherche de Personnalités

Dans `aiService.js`:

```javascript
// PERSONNALITÉS ET FIGURES HISTORIQUES
if (this.matchKeywords(q, ['qui est', 'who is', 'personnalité', 'célèbre'])) {
  try {
    // D'abord chercher localement
    const localResponse = this.getLocalPersonalityResponse(q);
    if (localResponse) return localResponse;
    
    // Sinon, enrichir avec Wikipedia
    if (process.env.USE_WIKIPEDIA === 'true') {
      const topic = q.replace(/qui est|who is/gi, '').trim();
      const wikiInfo = await WikipediaIntegration.getWikipediaSummary(topic);
      
      if (wikiInfo) {
        return `📚 ${wikiInfo.title}: ${wikiInfo.extract}...\n🔗 Pour plus: ${wikiInfo.url}`;
      }
    }
  } catch (error) {
    logger.warn('Wikipedia lookup failed', { error: error.message });
  }
}
```

### 6. Implémenter la Météo

Dans `messageController.js`:

```javascript
const { WeatherIntegration } = require('../utils/advancedChatbotExtensions');

// Route API pour la météo
router.get('/weather/:city', async (req, res) => {
  try {
    const weather = await WeatherIntegration.getWeather(req.params.city);
    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 7. Système de Notation des Réponses

Dans `messageController.js`:

```javascript
const { FeedbackSystem } = require('../utils/advancedChatbotExtensions');

// Route pour noter une réponse
router.post('/feedback/rate', async (req, res) => {
  const { questionId, rating, comment } = req.body;
  
  try {
    feedbackSystem.rateResponse(questionId, rating, comment);
    res.json({ success: true, message: 'Merci pour ton avis!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour voir les statistiques
router.get('/feedback/stats', async (req, res) => {
  try {
    res.json({
      averageRating: feedbackSystem.getAverageRating(),
      flaggedIssues: feedbackSystem.getMostFlaggedIssues()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 8. Citation du Jour

Modifiez le bot pour inclure:

```javascript
const { QuotesIntegration } = require('../utils/advancedChatbotExtensions');

// Dans AUTO_RESPONSES ou en route spéciale
router.get('/quote-of-day', async (req, res) => {
  const quote = await QuotesIntegration.getQuoteOfDay();
  res.json({
    success: true,
    quote: quote.text,
    author: quote.author,
    emoji: quote.emoji
  });
});
```

### 9. Traduction Automatique

Ajouter une route:

```javascript
const { TranslationIntegration } = require('../utils/advancedChatbotExtensions');

router.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  
  try {
    const translated = await TranslationIntegration.translate(text, targetLanguage);
    res.json({
      success: true,
      original: text,
      translated: translated,
      language: targetLanguage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 10. Calcul Avancé

Dans `aiService.js`:

```javascript
const { AdvancedCalculator } = require('../utils/advancedChatbotExtensions');

// MATHÉMATIQUES AVANCÉES
if (this.matchKeywords(q, ['calculer', 'combien', 'math', '='])) {
  const result = AdvancedCalculator.evaluate(q);
  if (result.isValid) {
    return `Le résultat est: ${result.result} 🧮`;
  }
  
  // Pour équations complexes
  if (q.match(/équation|fonction|dérivée|intégrale/i)) {
    const wolframResult = await AdvancedCalculator.solveWithWolframAlpha(q);
    if (wolframResult) {
      return `📊 ${wolframResult} 🧮`;
    }
  }
}
```

---

## 🎯 Cas d'Usage Complets

### Scénario 1: Question Historique Enrichie

```javascript
// Utilisateur: "Qui était Napoléon Bonaparte?"
// Avant: "Napoléon Bonaparte était un général français..."
// Après: 
//   "Napoléon Bonaparte était un général français...
//    📚 Napoléon Ier, né Napoleone Buonaparte, était un 
//    chef militaire français... [extrait Wikipedia]
//    🔗 https://en.wikipedia.org/wiki/Napoleon
```

### Scénario 2: Actualités

```javascript
// Utilisateur: "Quelles sont les dernières nouvelles?"
// Réponse: 
//   "Voici les actualités du jour:
//    📰 [Titre article 1] - Source
//    📰 [Titre article 2] - Source
//    📰 [Titre article 3] - Source"
```

### Scénario 3: Météo Locale

```javascript
// Utilisateur: "Comment est la météo à Paris?"
// Réponse:
//   "À Paris:
//    🌡️ Température: 15°C
//    ☁️ Condition: Partiellement nuageux
//    🔗 Plus de détails..."
```

### Scénario 4: Équation Mathématique

```javascript
// Utilisateur: "Résous x² + 5x + 6 = 0"
// Réponse:
//   "📊 x = -2 ou x = -3
//    Voici comment: facteur (x+2)(x+3)=0 🧮"
```

---

## 📊 Configuration des Features

Dans `.env`:

```env
# Features avancées
USE_ADVANCED_FEATURES=true
USE_WIKIPEDIA=true
USE_NEWS_API=true
USE_WEATHER_API=true
USE_TRANSLATION=true
USE_WOLFRAM_ALPHA=true
USE_QUOTE_OF_DAY=true

# Debug
CHATBOT_DEBUG=true
LOG_ALL_REQUESTS=true
```

---

## 🧪 Test des Extensions

### Test Wikipedia

```bash
curl -X GET http://localhost:5000/api/chatbot/query?q="Qui%20est%20Albert%20Einstein"
```

Attendu: Réponse enrichie avec infos Wikipedia

### Test Météo

```bash
curl -X GET http://localhost:5000/api/weather/Paris
```

Réponse:
```json
{
  "city": "Paris",
  "temperature": 15,
  "condition": "Partly cloudy",
  "emoji": "⛅"
}
```

### Test Feedback

```bash
curl -X POST http://localhost:5000/api/feedback/rate \
  -H "Content-Type: application/json" \
  -d '{"questionId": "123", "rating": 5, "comment": "Excellente réponse!"}'
```

---

## 🚨 Gestion des Erreurs

```javascript
try {
  const response = await externalAPI.call();
  return response;
} catch (error) {
  // Fallback à la réponse locale
  logger.warn('External API failed, using fallback', error);
  return this.getLocalResponse(question);
}
```

**Toujours avoir un fallback!**

---

## 📈 Optimisation des Performances

### Caching des Réponses

```javascript
class ResponseCache {
  constructor(ttl = 3600000) { // 1 heure
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.value;
    }
    this.cache.delete(key);
    return null;
  }

  set(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: 'Trop de requêtes, merci de réessayer plus tard'
});

app.post('/api/chatbot/message', chatbotLimiter, (req, res) => {
  // ...
});
```

---

## 📚 Ressources Supplémentaires

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Wikipedia API](https://en.wikipedia.org/w/api.php)
- [NewsAPI](https://newsapi.org/)
- [Google Translate API](https://cloud.google.com/translate/docs)
- [Wolfram Alpha API](https://products.wolframalpha.com/api/)

---

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Toutes les dépendances installées
- [ ] Tests unitaires passent
- [ ] Fallbacks en place
- [ ] Logging configuré
- [ ] Rate limiting actif
- [ ] Cache implémenté
- [ ] Erreurs gérées
- [ ] Documentation mise à jour
- [ ] Déploiement en staging d'abord

---

**Version**: 2.0
**Date**: Mars 2026
