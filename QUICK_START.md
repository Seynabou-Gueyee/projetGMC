# 🚀 Guide de Démarrage Rapide - TalkMe

**Temps estimé**: 5-10 minutes

---

## 📋 Prérequis

- ✅ Node.js (v14+)
- ✅ MongoDB (local ou Atlas)
- ✅ npm ou yarn
- ✅ Deux navigateurs ou deux onglets

---

## 🎯 Étapes de Démarrage

### Étape 1: Configuration MongoDB

#### Option A: MongoDB Local
```bash
# Windows - Démarrer MongoDB
mongod
# Accédez à http://localhost:27017/ pour vérifier
```

#### Option B: MongoDB Atlas (Cloud)
```bash
1. Allez sur https://www.mongodb.com/cloud/atlas
2. Créez un compte
3. Créez un cluster gratuit
4. Obtenez la connection string
5. Mettez à jour server/.env (voir étape 2)
```

---

### Étape 2: Setup Backend

```bash
# Terminal 1
cd server

# Installer les dépendances
npm install

# Créer/vérifier .env
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/talkme
# Ou pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/talkme
JWT_SECRET=your_super_secret_key_change_this!
NODE_ENV=development
EOF

# Démarrer le serveur
npm start
```

**Résultat attendu**:
```
✓ MongoDB connecté
✓ Utilisateur Admin créé
✓ Salon "Général" créé
🚀 Serveur TalkMe démarré
📡 Port: 5000
```

---

### Étape 3: Setup Frontend

```bash
# Terminal 2
cd client

# Installer les dépendances
npm install

# Démarrer l'app React
npm start
```

**Résultat attendu**:
```
Compiled successfully!
You can now view talkme in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

### Étape 4: Accueil de l'App

1. Ouvrez **http://localhost:3000** dans votre navigateur
2. Auto-refresh si c'est un dev mode

---

## 🧪 Tester les Fonctionnalités

### Préparation: Créer deux utilisateurs

#### Utilisateur 1:
```
Username: User1
Email: user1@test.com
Password: Test@1234
```

#### Utilisateur 2:
```
Username: User2
Email: user2@test.com
Password: Test@1234
```

### Six étapes pour tout tester:

1. **Onglet 1**: Login comme User1
2. **Onglet 2**: Login comme User2
3. **User1**: Envoie un message
4. **User1**: Voit ✓ Livré
5. **User2**: Voit 👁️ Lu après 500ms
6. **Testez chaque feature selon TEST_GUIDE.md**

---

## 📱 Configuration Multi-Users

### Option 1: Deux Navigateurs
```
Chrome  → http://localhost:3000 (User1)
Firefox → http://localhost:3000 (User2)
```

### Option 2: Deux Tabs
```
Tab 1 → User1 (incognito: Ctrl+Shift+N)
Tab 2 → User2 (normal)
```

### Option 3: Localhost + Network
```
Machine 1 → http://localhost:3000 (User1)
Machine 2 → http://192.168.1.x:3000 (User2)
```

---

## 🎮 Commandes Utiles

### Backend
```bash
# Démarrer
npm start

# Démarrer avec logs détaillés
npm start -- --log verbose

# Redémarrer après modification
npm start

# Arrêter: Ctrl+C
```

### Frontend
```bash
# Démarrer
npm start

# Build pour production
npm run build

# Run tests
npm test

# Arrêter: Ctrl+C
```

---

## 🔍 Vérification du Démarrage

### Backend (Terminal 1):
```
✓ MongoDB connecté                    → OK
✓ Utilisateur Admin créé              → OK
✓ Salon "Général" créé               → OK
🚀 Serveur TalkMe démarré             → OK
📡 Port: 5000                         → OK
🔗 Backend: http://localhost:5000    → OK
```

### Frontend (Terminal 2):
```
Compiled successfully!                → OK
You can now view talkme...            → OK
Local: http://localhost:3000          → OK
```

### Browser:
```
Page charge correctement               → OK
Pas d'erreurs 404                      → OK
Socket.IO connecté (check console)     → OK
Peut se connecter                      → OK
```

---

## 🆘 Troubleshooting

### Erreur: "MongoDB not found"
```bash
# Solution 1: Démarrer MongoDB
mongod

# Solution 2: Utiliser MongoDB Atlas
# Mettez à jour MONGODB_URI dans .env
```

### Erreur: "Port 5000 already in use"
```bash
# Windows
netstat -ano | find ":5000"
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>

# Ou changez le port dans server/.env
```

### Erreur: "Cannot find module..."
```bash
# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "Socket.IO connection refused"
```bash
# Vérifiez que le backend est démarré sur 5000
# Vérifiez que pas de firewall bloquant
# Vérifiez la console: Ctrl+Shift+I → Console
```

### Erreur: "AuthPage doesn't appear"
```bash
# C'est normal! L'app redirige vers /login
# Attendez quelques secondes ou rafraîchissez
```

---

## ✅ Checklist de Démarrage

```
Backend:
  ☐ MongoDB démarré ou connecté à Atlas
  ☐ server/.env configuré
  ☐ npm install fait
  ☐ npm start lancé
  ☐ Port 5000 accessible
  ☐ Pas d'erreurs dans le terminal

Frontend:
  ☐ client/.env.local configuré (port 3000 par défaut)
  ☐ npm install fait
  ☐ npm start lancé
  ☐ Page charge sans erreur 404
  ☐ Console sans erreurs critiques

Application:
  ☐ Vous pouvez créer un compte
  ☐ Vous pouvez vous connecter
  ☐ Vous voyez le salon "Général"
  ☐ Vous pouvez envoyer un message
  ☐ Le message s'affiche avec ✓ Livré

Prêt à tester:
  ☐ Deux utilisateurs créés
  ☐ Deux sessions ouvertes
  ☐ Prêt à suivre TEST_GUIDE.md
```

---

## 🎬 Résumé Visual

```
┌─────────────────────────────────┐
│ Terminal 1: cd server && npm start  │
│ (Attendre le message ✓ connecté)    │
└─────────────────────────────────┘
         ↓↓↓ 10 secondes ↓↓↓
┌─────────────────────────────────┐
│ Terminal 2: cd client && npm start  │
│ (Attendre "Compiled successfully")  │
└─────────────────────────────────┘
         ↓↓↓ 15 secondes ↓↓↓
┌─────────────────────────────────┐
│ Browser: http://localhost:3000     │
│ (Voir la page de login)            │
└─────────────────────────────────┘
         ↓↓↓ Register/Login ↓↓↓
┌─────────────────────────────────┐
│ Voir le salon "Général"            │
│ Envoyer un message de test         │
│ Voir ✓ Livré s'afficher           │
└─────────────────────────────────┘
         ↓↓↓ SUCCESS! 🎉 ↓↓↓
```

---

## 📊 Performance à Attendre

À la première utilisation:
- **Webpack compilation**: 30-60 secondes
- **MongoDB init**: 5-10 secondes
- **Page load**: 2-5 secondes
- **Message send**: <100ms
- **Après ça**: Très rapide! ⚡

---

## 🌐 Accès Réseau

### Pour accéder depuis une autre machine:

**Backend**:
```bash
# Dans server/.env, changez:
# PORT=5000 (reste pareil)
# Accessible à: http://<YOUR_IP>:5000
```

**Frontend**:
```bash
# Dans client/.env.local, ajoutez:
REACT_APP_API_URL=http://<YOUR_IP>:5000
```

**Dans le navigateur**:
```
http://<HOST_IP>:3000
# Exemple: http://192.168.1.10:3000
```

---

## 🔐 Comptes de Test Pré-créés

Après le premier démarrage, vous avez:

| Rôle | Email | Password |
|------|-------|----------|
| Admin | admin@talkme.com | Admin@123456 |

Créez d'autres utilisateurs via l'interface.

---

## 🚨 En Cas de Problème

### Step 1: Vérifier les logs
```bash
# Backend: Ctrl+Shift+I → Network & Console
# Frontend: Ctrl+Shift+I → Console
```

### Step 2: Redémarrer
```bash
# Terminal 1: Ctrl+C
# Terminal 2: Ctrl+C
# Puis relancer npm start sur les deux
```

### Step 3: Clear cache
```bash
# Browser: Ctrl+Shift+Delete → Clear everything
# App: F5 pour rafraîchir
```

### Step 4: Réinstaller
```bash
# Backend
rm -rf node_modules package-lock.json
npm install

# Frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 Succès!

Si vous voyez:
- ✅ Backend sur port 5000
- ✅ Frontend sur port 3000
- ✅ Page charge sans erreur
- ✅ Vous pouvez vous connecter
- ✅ Vous voyez le salon "Général"

**BRAVO! L'app fonctionne! 🎊**

Passez à [TEST_GUIDE.md](./TEST_GUIDE.md) pour tester les 8 fonctionnalités.

---

**Besoin d'aide?**
1. Vérifiez [README.md](./README.md)
2. Vérifiez [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Vérifiez les logs du terminal

---

**Version**: 1.2.0  
**Status**: Ready to Run  
**Last Updated**: 3 March 2026

🚀 **Let's Go TalkMe!**

