# 🔧 AI v3.0 - Troubleshooting Guide

## Sommaire Rapide
- [Problèmes de Configuration](#configuration)
- [Problèmes d'API](#api)
- [Problèmes de Performance](#performance)
- [Problèmes de Réponse](#reponses)
- [Problèmes de Fallback](#fallback)

---

## 🔴 Configuration

### Problème: "Error: OPENAI_API_KEY is not defined"

**Cause**: Fichier `.env` manquant ou non chargé

**Solutions**:
```bash
# Vérifier fichier existe
ls -la .env

# Si manquant, créer
cp .env.example .env

# Ajouter votre clé
echo "OPENAI_API_KEY=sk-proj-votre-clé" >> .env

# Redémarrer serveur
npm start
```

**Test**:
```bash
node -e "require('dotenv').config(); console.log('API Key:', !!process.env.OPENAI_API_KEY)"
# Doit afficher: API Key: true
```

---

### Problème: "Cannot find module 'advancedAIService'"

**Cause**: Service non dupliqué ou mauvais chemin

**Solutions**:
```bash
# Vérifier fichier existe
ls server/utils/advancedAIService.js

# Si manquant, vérifier chemin dans votre import
# Doit être: require('./utils/advancedAIService');
# ou: require('../utils/advancedAIService');
```

---

### Problème: ".env file not found but not required"

**Cause**: .env optionnel, mais les clés API ne sont pas définis

**Solutions**:
```bash
# Ajouter à votre .bashrc/.zshrc ou export avant npm start
export OPENAI_API_KEY="sk-proj-..."
export AI_PRIMARY_PROVIDER="openai"

npm start
```

---

## 🔴 API

### Problème: "Invalid API Key"

**Cause**: Clé incorrecte, expirée, ou révoquée

**Solutions**:
```bash
# 1. Vérifier clé dans .env
cat .env | grep API_KEY

# 2. Tester clé directement
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-proj-votre-clé"

# 3. Si 401 Unauthorized:
#    → Clé invalide
#    → Aller https://openai.com/account/api-keys
#    → Générer nouvelle clé
#    → Updater .env

# 4. Si 429 Too Many Requests:
#    → Rate limit dépassé
#    → Attendre 1 minute
#    → Augmenter interval entre requêtes
```

---

### Problème: "Failed to fetch from OpenAI API"

**Cause**: Problème réseau ou API service down

**Solutions**:
```bash
# 1. Vérifier connexion internet
ping 8.8.8.8

# 2. Vérifier API status
curl https://status.openai.com/

# 3. Vérifier firewall/proxy
npm install -g http-server
http-server  # Lancer serveur test

# 4. Ajouter timeout plus long dans .env
OPENAI_TIMEOUT=30000  # 30 secondes au lieu de 10

# 5. Tester avec curl directement
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hi"}]}'
```

---

### Problème: "API returned 400 Bad Request"

**Cause**: Paramètres invalides

**Solutions**:
```javascript
// Vérifier que les paramètres sont corrects dans advancedAIService.js:

// ❌ MAUVAIS
const data = {
  model: "gpt-4",
  messages: message,  // Doit être array
  temperature: 2.5,   // Doit être 0-2
  max_tokens: "300"   // Doit être nombre
};

// ✅ BON
const data = {
  model: "gpt-4",
  messages: [{ role: "user", content: message }],
  temperature: 1.0,   // 0-2
  max_tokens: 300,    // nombre
  top_p: 0.9
};
```

**Test**:
```bash
# Tester structure message
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model":"gpt-4",
    "messages":[{"role":"user","content":"Test"}],
    "temperature":1.0,
    "max_tokens":300
  }'
```

---

## 🔴 Performance

### Problème: "Response takes 30+ seconds"

**Cause**: OpenAI API lent, modèle lourd, ou réseau lent

**Solutions**:

```javascript
// Dans .env, réduire charge:
OPENAI_MODEL=gpt-3.5-turbo  // Plus rapide que gpt-4
CONTEXT_WINDOW=2000         // Moins de tokens à traiter
USE_CACHE=true              // Cache réponses identiques

// Dans advancedAIService.js, ajouter:
const timeout = 15000;  // Timeout 15s au lieu de 30s

// Ou utiliser modèle plus rapide
```

**Altérnative rapide - Utiliser Gemini**:
```bash
# Dans .env
AI_PRIMARY_PROVIDER=gemini
GEMINI_API_KEY=votre-clé-gratuite
```

**Test timing**:
```bash
time curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi","userId":"test"}'

# Doit être <5s
```

---

### Problème: "OOM - Out of Memory"

**Cause**: Conversation history trop grande ou fuite mémoire

**Solutions**:
```bash
# 1. Réduire context window
# Dans .env:
CONTEXT_WINDOW=2000  # Moins messages conservés

# 2. Limiter memory par converstion
# Dans advancedAIService.js, ajouter:
if (this.conversationMemory[userId].length > 20) {
  this.conversationMemory[userId].shift();  // Supprimer ancien
}

# 3. Redémarrer serveur régulièrement
# Avec PM2:
pm2 start server.js --max-memory-restart 500M

# 4. Monitorer mémoire
npm install -g pm2
pm2 monit
```

---

## 🔴 Réponses

### Problème: "Réponse très courte / incomplète"

**Cause**: `max_tokens` trop bas

**Solutions**:
```bash
# Dans .env, augmenter:
OPENAI_MAX_TOKENS=2000  # Au lieu de 300

# Ou dans advancedAIService.js:
const maxTokens = 2000;  // Augmenter
```

**Test**:
```bash
curl -X POST http://localhost:3000/api/chat \
  -d '{"message":"Explique quantum computing en détail","userId":"test"}'

# Réponse doit être 500+ mots
```

---

### Problème: "Réponse aléatoire / incohérante"

**Cause**: Température trop haute

**Solutions**:
```bash
# Dans .env:
OPENAI_TEMPERATURE=0.7  # Plus bas = plus cohérent (0-2)

# Ou dans advancedAIService.js:
const temperature = 0.5;  // Réduire randomness
```

**Échelle**:
- 0.0 = Déterministe (toujours même réponse)
- 0.5 = Équilibré
- 1.5+ = Très créatif (peut être incohérante)

---

### Problème: "Réponse hors contexte / ignore la question"

**Cause**: System prompt mauvais ou conversatino history non passée

**Solutions**:

```javascript
// 1. Vérifier conversaion history est passée:
const response = await aiService.getResponse(
  message,
  userId,
  conversationHistory  // ✅ Important!
);

// 2. Vérifier system prompt structure dans advancedAIService.js
// Doit inclure: "Be concise", "Answer in French", etc.

// 3. Tester avec historique vide
const response = await aiService.getResponse(
  message,
  userId,
  []  // Historique vide
);
// Si répond mieux → historique est problème
```

---

### Problème: "Réponse en anglais au lieu du français"

**Cause**: System prompt non spécifié ou API préfère anglais

**Solutions**:

```javascript
// Dans buildSystemPrompt() dans advancedAIService.js, ajouter:
const systemPrompt = `You are TalkMe assistant...
Always respond in FRENCH (français).
User langue: French`;

// Ou dans advancedAIService.js getResponse():
const messages = [
  { role: "system", content: `Respond ONLY in French. User question: ${question}` },
  { role: "user", content: question }
];
```

---

## 🔴 Fallback

### Problème: "Fallback ne fonctionne pas / reste sur provider échoué"

**Cause**: Fallback logic non activée ou mal configurée

**Solutions**:

```javascript
// 1. Vérifier dans .env:
echo "AI_FALLBACK_PROVIDERS=claude,gemini,ollama"

// 2. Checker dans advancedAIService.js:
// getResponse() doit avoir try/catch avec logic fallback:
let response = await this.callPrimaryProvider(messages);
if (!response) {
  for (const provider of this.fallbackProviders) {
    response = await this.callProvider(provider, messages);
  }
}

// 3. Tester fallback deliberately:
// Dans .env, mettre clé OpenAI invalide:
OPENAI_API_KEY=invalid-test-key
// Ajouter clé Claude valide:
CLAUDE_API_KEY=sk-ant-votre-vraie-clé

npm start
// Logs doivent montrer: "OpenAI failed, trying Claude..."
```

**Logs à vérifier**:
```bash
# Chercher dans logs:
tail -f server/logs/application.log

# Doit voir:
# [AI] Using provider: openai
# [AI] Request payload sent
# [ERROR] OpenAI request failed: ...
# [AI] Fallback: Trying claude...
# [AI] Using provider: claude
# [INFO] Successfully got response from claude
```

---

### Problème: "Ollama fallback ne démarre / pas trouvé"

**Cause**: Ollama pas lancé ou port 11434 occupé

**Solutions**:

```bash
# 1. Vérifier Ollama est lancé
lsof -i :11434

# Si pas => lancer:
ollama serve

# 2. Vérifier modèle est téléchargé
ollama list
# Doit voir: neural-chat

# Si absent:
ollama pull neural-chat

# 3. Tester connexion Ollama
curl http://localhost:11434/api/generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"model":"neural-chat","prompt":"Hi"}'

# Doit recevoir réponse

# 4. Dans .env, vérifier:
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=neural-chat
```

---

## 🟡 Avertissements (Warnings)

### "Using fallback provider" appear trop souvent

**Cause**: Primary provider problématique

**Diagnostic**:
```bash
# Vérifier raison fallback
tail -100 server/logs/application.log | grep ERROR

# Causes possibles:
# 1. API Key invalide
# 2. Quota dépassé
# 3. Rate limit
# 4. Serveur API down
```

---

### "Memory usage increasing" au fil du temps

**Cause**: Memory leak dans conversation history

**Solution**:
```javascript
// Dans advancedAIService.js, ajouter limite:
const MAX_MEMORY_PER_USER = 10;

if (this.conversationMemory[userId].length > MAX_MEMORY_PER_USER) {
  this.conversationMemory[userId].shift();  // Supprimer ancien
}
```

---

## ✅ Commandes Diagnostic

```bash
# Test 1: Vérifier configuration
node -e "require('dotenv').config(); console.log(process.env.AI_PRIMARY_PROVIDER, !!process.env.OPENAI_API_KEY)"

# Test 2: Vérifier dépendances
ls node_modules | grep axios logger

# Test 3: Démarrer serveur en debug
DEBUG=* npm start

# Test 4: Tester endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test"}' \
  -v

# Test 5: Vérifier logs
tail -50 server/logs/application.log
```

---

## 📞 Support Escalation

Si rien ne marche:

1. **Vérifier**: Logs complètes (`server/logs/`)
2. **Isoler**: Quel provider échoue exactement
3. **Tester**: Avec curl directement vers API
4. **Check**: Clés API valides
5. **Fallback**: Essayer Ollama (totalement gratuit)

---

**Dernière mise à jour**: 2024
**AI v3.0**
