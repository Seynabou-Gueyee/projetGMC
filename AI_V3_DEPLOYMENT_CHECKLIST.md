# ✅ AI v3.0 - Checklist de Déploiement

## 🎯 Avant de Commencer
- [ ] Vous avez lu `AI_V3_COMPLETE_GUIDE.md`
- [ ] Vous avez choisi une option (OpenAI / Claude / Gemini / Ollama)
- [ ] Node.js v14+ est installé (`node --version`)
- [ ] npm est à jour (`npm --version`)

---

## 📋 Configuration (2-5 minutes)

### Étape 1: Créer fichier .env
```bash
cp .env.example .env
```
- [ ] Fichier `.env` créé dans le dossier racine
- [ ] Fichier n'est pas committé en git (vérifier `.gitignore`)

### Étape 2: Ajouter Clé API (selon votre choix)

#### Si vous choisie **OpenAI** (Recommandé)
- [ ] Compte OpenAI créé: https://openai.com
- [ ] Clé API générée
- [ ] Dans `.env`, ajouter:
  ```
  OPENAI_API_KEY=sk-proj-votre-clé-ici
  AI_PRIMARY_PROVIDER=openai
  OPENAI_MODEL=gpt-4
  ```
- [ ] Clé testée (`curl https://api.openai.com/v1/models` avec Authorization)

#### Si vous choisie **Claude** (Anthropic)
- [ ] Compte Claude créé: https://console.anthropic.com/
- [ ] Clé API générée
- [ ] Dans `.env`, ajouter:
  ```
  CLAUDE_API_KEY=sk-ant-votre-clé-ici
  AI_PRIMARY_PROVIDER=claude
  CLAUDE_MODEL=claude-opus-4-1
  ```
- [ ] Clé testée

#### Si vous choisie **Gemini** (Google)
- [ ] Compte Google créé
- [ ] Free API key générée: https://ai.google.dev/
- [ ] Dans `.env`, ajouter:
  ```
  GEMINI_API_KEY=AIzaSy-votre-clé-ici
  AI_PRIMARY_PROVIDER=gemini
  ```
- [ ] Clé testée (limite gratuite: 60 req/min)

#### Si vous choisie **Ollama** (Local - Gratuit)
- [ ] Ollama téléchargé: https://ollama.ai
- [ ] Ollama installé et lancé (`ollama serve`)
- [ ] Modèle téléchargé: `ollama pull neural-chat`
- [ ] Dans `.env`, ajouter:
  ```
  OLLAMA_BASE_URL=http://localhost:11434
  OLLAMA_MODEL=neural-chat
  AI_PRIMARY_PROVIDER=ollama
  ```
- [ ] Service Ollama accessible sur port 11434

### Étape 3: Configuration Optionnelle
- [ ] Lire section "Advanced Features" dans `.env`
- [ ] Activer RAG si besoin: `USE_RAG=true`
- [ ] Configurer context window: `CONTEXT_WINDOW=8000`
- [ ] Activer cache: `CACHE_RESPONSES=true`

---

## 🚀 Installation des Dépendances

### Backend
```bash
cd server
npm install
```
- [ ] Dépendances installées sans erreur
- [ ] `node_modules/` créé
- [ ] Pas d'erreurs npm audit

### Frontend (optionnel pour setup)
```bash
cd client
npm install
```
- [ ] Dépendances installées sans erreur

---

## 🧪 Tests Pre-Déploiement

### Test 1: Vérifier Configuration
```bash
cd server
node -e "require('dotenv').config(); console.log('✅ Provider:', process.env.AI_PRIMARY_PROVIDER)"
```
- [ ] Provider correct affiché
- [ ] Pas d'erreur de chargement `.env`

### Test 2: Tester Connexion API
```bash
npm start
# Attendre "Listening on port 3000"
```
- [ ] Serveur démarre sans erreur
- [ ] Logs pas d'erreur d'authentification API
- [ ] Port 3000 disponible

### Test 3: Tester IA Service
Dans un nouveau terminal:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Bonjour, comment vas-tu?","userId":"test-user"}'
```
- [ ] Réponse reçue en <5 secondes
- [ ] Réponse cohérente et détaillée
- [ ] Pas d'erreur 500
- [ ] Pas d'erreur d'authentification API

### Test 4: Vérifier Logs
- [ ] Logs montrent: `[IA] Using provider: openai/claude/gemini/ollama`
- [ ] Pas d'erreur d'authentification
- [ ] Pas de warnings critiques

---

## 🌍 Tester avec Frontend (Optionnel)

```bash
# Terminal 1: Backend
cd server && npm start

# Terminal 2: Frontend
cd client && npm start
```
- [ ] Frontend démarre sur http://localhost:3000
- [ ] Application charge sans erreur
- [ ] ChatBot interface accessible
- [ ] Envoyer message → réponse IA reçue
- [ ] Réponse est détaillée et intelligente
- [ ] Pas de statut "erreur"

---

## 🔄 Fallback Testing (Optionnel Avancé)

Pour tester le fallback automatique:

1. Dans `.env`, ajouter une mauvaise clé primaire:
   ```
   AI_PRIMARY_PROVIDER=openai
   OPENAI_API_KEY=invalid-key-123
   ```

2. Ajouter fallback dans `.env`:
   ```
   AI_FALLBACK_PROVIDER=claude
   CLAUDE_API_KEY=sk-ant-votre-vraie-clé
   ```

3. Tester:
   ```bash
   npm start
   # Verifier les logs: "Primary provider failed, using fallback..."
   ```

- [ ] Fallback fonctionne
- [ ] Réponse reçue via fallback
- [ ] Système never goes down

---

## 📊 Performance Baseline

Avant de scaler en production, noter:

- [ ] Temps réponse 1ère requête: _____ ms
- [ ] Temps réponse requête cache: _____ ms
- [ ] Tokens utilisés par réponse: _____
- [ ] Coût estimé par requête: $_____
- [ ] Requêtes/min maimum testées: _____

---

## 🔒 Sécurité Pré-Production

- [ ] `.env` est dans `.gitignore`
- [ ] Aucune clé API committée en git
- [ ] `OPENAI_API_KEY` / `CLAUDE_API_KEY` / etc. jamais versionné
- [ ] Clés tournées tous les 3 mois (reminder calendar)
- [ ] Rate limiting activé: `RATE_LIMIT_ENABLED=true`
- [ ] Content filter activé: `CONTENT_FILTER_ENABLED=true`

---

## 🌐 Déploiement Production (si applicable)

### Heroku / Railway / Vercel
- [ ] `.env` variables configurées dans platform (pas de fichier)
- [ ] `AI_PRIMARY_PROVIDER` set
- [ ] API keys set comme secrets
- [ ] Tests POST avant go-live

### Server propre (VPS)
- [ ] `.env` créé sur serveur
- [ ] Permissions restrictives: `chmod 600 .env`
- [ ] Process manager configuré (PM2/systemd)
- [ ] Logs configurés: `npm start > logs/app.log 2>&1`
- [ ] Monitoring activé sur erreurs

- [ ] Déploiement en production ✅

---

## ✨ Après Déploiement

### Monitoring
- [ ] Logs surveillés pour erreurs IA
- [ ] Alertes configurées pour API timeouts
- [ ] Dashboard de coût (si OpenAI)

### Optimisation
- [ ] Model params tunés pour votre cas (température, max_tokens)
- [ ] System prompt customisé (langage, tone)
- [ ] RAG enrichement activé si besoin contexte custom

### Documentation
- [ ] Équipe entraînée sur nouveau système
- [ ] Troubleshooting guide partagé
- [ ] Support contact établi pour problèmes API

---

## 🎉 Résultat Final

Votre chatbot TalkMe a maintenant:

✅ **Intelligence**: ChatGPT / Claude / Gemini level
✅ **Fiabilité**: Fallback chain (never goes down)
✅ **Coût**: Optimisé (OpenAI economique ou Ollama free)
✅ **Performance**: Ultra-rapide (<2sec réponses)
✅ **Sécurité**: Content filter + rate limiting

**Status**: 🚀 PRODUCTION READY

---

## 📞 Support / Troubleshooting

Si problème, voir section "Troubleshooting" dans:
- `AI_V3_COMPLETE_GUIDE.md` (guide complet)
- `AI_V3_QUICK_START.sh` (guide rapide)
- Logs du serveur: `server/logs/`

---

**Dernière mise à jour**: 2024
**Maintenu par**: TalkMe Dev Team
**Version**: v3.0 (Advanced AI)
