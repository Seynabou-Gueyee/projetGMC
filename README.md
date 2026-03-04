# 🚀 TalkMe - Application de Chat en Temps Réel

Une application web moderne de chat en temps réel construite avec **React**, **Express.js** et **Socket.IO**.

## 📋 Pré-requis

- Node.js (v16+)
- MongoDB Atlas (gratuit) OU MongoDB local
- Un navigateur web moderne

## 🔧 Installation et Démarrage

### 1️⃣ Configurer MongoDB Atlas (OBLIGATOIRE)

**Voir le guide détaillé**: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

**Résumé rapide**:
1. Créez un compte gratuit: https://www.mongodb.com/cloud/atlas
2. Créez un cluster M0 gratuit
3. Créez un utilisateur de base de données
4. Copiez la chaîne de connexion
5. Mettez à jour `server/.env`

### 2️⃣ Configurer les variables d'environnement

**Backend** (`server/.env`):
```bash
PORT=5000
MONGODB_URI=mongodb+srv://talkme_user:PASSWORD@cluster0.xxxxx.mongodb.net/talkme?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 3️⃣ Installer les dépendances

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4️⃣ Démarrer l'application

**Terminal 1 - Backend**:
```bash
cd server
npm start
# ✅ Doit afficher: "Serveur TalkMe démarré sur le port 5000"
# ✅ Et: "MongoDB connecté"
```

**Terminal 2 - Frontend**:
```bash
cd client
npm start
# ✅ Doit ouvrir http://localhost:3000 automatiquement
```

## 🎯 Utilisation

1. **S'inscrire**: Créez un nouvel utilisateur avec email et mot de passe
2. **Se connecter**: Entrez vos identifiants
3. **Créer un salon**: Cliquez sur "Créer un salon"
4. **Discuter**: Rejoignez un salon et commencez à discuter en temps réel!

## 🏗️ Architecture

### Backend (Node.js + Express)
- `server.js` - Configuration principale et Socket.IO
- `routes/` - Endpoints API (auth, chat-rooms, messages)
- `models/` - Schémas Mongoose (User, ChatRoom, Message)
- `controllers/` - Logique métier
- `middleware/` - Authentification JWT

### Frontend (React)
- `src/pages/` - Pages (AuthPage, ChatPage)
- `src/components/` - Composants réutilisables
- `src/App.js` - Routage
- `src/*.css` - Styles (avec variables CSS, responsive)

## 🔌 Caractéristiques

✅ **Chat en temps réel** avec Socket.IO  
✅ **Salons de discussion** publics  
✅ **Authentification JWT** sécurisée  
✅ **Historique des messages** persistant (MongoDB)  
✅ **Design responsive** (320px → 1920px)  
✅ **Interface moderne** avec animations  
✅ **Gestion d'utilisateurs** en ligne  

## 🐛 Dépannage

### Erreur: "Operation buffering timed out"
→ **MongoDB n'est pas configuré**  
→ Suivez le guide: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

### Erreur: "Cannot GET /api/..."
→ Assurez-vous que le backend tourne sur le port 5000  
→ Vérifiez la console du serveur pour les erreurs

### Messages ne s'affichent pas
→ Vérifiez que Socket.IO est connecté (onglet Network dans DevTools)  
→ Vérifiez la console du serveur: `New socket connection`

## 📱 Responsive Design

L'application est optimisée pour tous les appareils:
- 📱 Mobile: 320px, 480px
- 📱 Tablette: 640px, 768px, 1024px
- 🖥️ Bureau: 1440px, 1920px

## 🔐 Sécurité

- JWT pour l'authentification
- Passwords hashés avec bcrypt
- CORS configuré
- Validation des entrées

## 📝 Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| PORT | Port du serveur | 5000 |
| MONGODB_URI | URI de connexion MongoDB | mongodb://localhost:27017/talkme |
| JWT_SECRET | Clé secrète JWT | your_jwt_secret_key |
| NODE_ENV | Environnement | development |

## 📦 Dépendances principales

**Backend**:
- express (5.2.1)
- socket.io (4.8.3)
- mongoose (9.2.3)
- jsonwebtoken (9.0.3)
- bcryptjs (3.0.3)

**Frontend**:
- react (19.2.4)
- react-router-dom (7.13.1)
- socket.io-client (4.8.3)
- axios (1.13.6)

## 🚀 Déploiement

Pour déployer en production:
1. Utilisez un service comme **Vercel** (frontend) ou **Render** (backend)
2. Configurez les variables d'environnement
3. Mettez à jour les CORS dans `server.js`
4. Utilisez HTTPS

## 📞 Support

Pour toute question ou problème:
1. Vérifiez d'abord [MONGODB_SETUP.md](./MONGODB_SETUP.md)
2. Consultez les logs du serveur
3. Vérifiez les erreurs dans la console React

---

**Version**: 1.0.0  
**Date**: Mars 2026  
**Statut**: ✅ Fonctionnel
