# 🚀 DÉMARRAGE DES SERVEURS - GUIDE D'INSTALLATION

## ⚠️ Prérequis: MongoDB

Avant de démarrer l'application, **MongoDB doit être configuré**.

---

## Option 1️⃣: MongoDB Local (Recommandé pour développement)

### Windows:
```powershell
# Installer MongoDB (si pas installé):
# https://www.mongodb.com/try/download/community

# Vérifier que MongoDB est installé:
mongod --version

# Démarrer le service MongoDB:
# Via Services Windows (Win+R → services.msc → MongoDB Server)
# OU via terminal:
mongod --dbpath "c:\data\db"
```

### macOS:
```bash
# Installer via Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Démarrer MongoDB:
brew services start mongodb-community
```

### Linux:
```bash
# Ubuntu/Debian:
sudo apt-get install -y mongodb

# Démarrer:
sudo systemctl start mongodb
```

---

## Option 2️⃣: MongoDB Atlas (Cloud - Recommandé pour production)

### Steps:
1. Aller à: https://www.mongodb.com/cloud/atlas
2. Créer un compte gratuit
3. Créer un cluster gratuit (M0)
4. Copier la chaîne de connexion
5. Ajouter à `.env`:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/talkme?retryWrites=true&w=majority
```

---

## Configuration .env

Créer/modifier `server/.env`:

```env
# Port serveur
PORT=5000

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/talkme

# OU MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/talkme?retryWrites=true&w=majority

# OpenAI API
OPENAI_API_KEY=sk-...

# JWT Secret
JWT_SECRET=your-secret-key-here

# Variables optionnelles
ENCRYPTION_KEY=your-encryption-key
LOG_LEVEL=info
NODE_ENV=development
```

---

## 🔧 Démarrage en 3 étapes

### Étape 1: Backend (Node.js + Express)
```bash
cd server
npm install  # Si dépendances pas installées
npm start    # Démarre sur http://localhost:5000

# Alternative:
node server.js
```

**Attendez de voir**: ✅ `MongoDB connecté` et `Server running on port 5000`

### Étape 2: Frontend (React)
```bash
cd client
npm install  # Si dépendances pas installées
npm start    # Démarre sur http://localhost:3000

# S'ouvre automatiquement ou:
# Ouvrir: http://localhost:3000
```

### Étape 3: Utiliser l'application
- Login/Register sur http://localhost:3000
- Chat room, drag & drop fichiers, etc.

---

## ✅ Checklist de Démarrage

- [ ] MongoDB running (local ou Atlas configuré)
- [ ] `.env` créé avec MONGODB_URI
- [ ] Backend démarré (port 5000) - voir "✓ MongoDB connecté"
- [ ] Frontend démarré (port 3000)
- [ ] Navigateur: http://localhost:3000
- [ ] Drag & drop fichiers dans le chat
- [ ] Envoyer/recevoir messages
- [ ] ChatBot accessible (bouton 🤖)

---

## 🐛 Dépannage

### "MongoDB connection refused"
```
✓ Vérifier que MongoDB est en cours d'exécution
✓ Vérifier MONGODB_URI dans .env
✓ Pour local: mongod --dbpath "c:\data\db"
✓ Pour Atlas: vérifier credentials et firewall
```

### "Cannot find module" erreurs
```
cd server
rm -rf node_modules package-lock.json
npm install
```

### Port déjà utilisé (5000 ou 3000)
```
# Trouver le processus:
netstat -ano | findstr :5000  # Windows
lsof -i :5000                # macOS/Linux

# Tuer le processus ou changer le port dans .env
```

### Erreur WebSocket (Socket.IO)
```
✓ Vérifier que backend tourne sur 5000
✓ Vérifier qu'il n'y a pas de firewall bloquant
✓ Vérifier CORS dans server.js
```

---

## 📊 Ports et URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend (React) | http://localhost:3000 | 3000 |
| Backend (Node.js) | http://localhost:5000 | 5000 |
| MongoDB (local) | mongodb://localhost:27017 | 27017 |
| Socket.IO | ws://localhost:5000 | 5000 |

---

## 🎯 Commandes Utiles

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm start

# Test API:
curl http://localhost:5000/api/health

# Voir logs MongoDB:
mongod --logpath "c:\logs\mongodb.log" --dbpath "c:\data\db"

# Reed logs Express:
# Voir console terminal où npm start tourne
```

---

## 🚀 Démarrage Rapide (Après MongoDB configuré)

```bash
# Terminal 1: Backend
cd TalkMe/server && npm start

# Terminal 2: Frontend
cd TalkMe/client && npm start

# Ouvrir navigateur:
# http://localhost:3000
```

**Prêt!** ✅ Votre application TalkMe tourne avec:
- ✅ Multi-provider IA (ChatGPT, Claude, Gemini)
- ✅ Chat en temps réel (Socket.IO)
- ✅ Drag & drop fichiers
- ✅ Détection émotions
- ✅ Recherche sémantique (vecteurs)
- ✅ etc.

---

**Important**: Sans MongoDB, le serveur ne peut pas stocker les données. Configurer d'abord!

Besoin d'aide? Vérifier les logs du serveur pour plus de détails.
