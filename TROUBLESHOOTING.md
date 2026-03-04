# 🔧 Dépannage TalkMe

## 🚨 Erreurs Courantes et Solutions

### ❌ "Operation buffering timed out after 10000ms"

**Cause**: MongoDB n'est pas configuré ou non accessible

**Solution**:
1. Ouvrez `server/.env`
2. Vérifiez que `MONGODB_URI` est correctement configuré
3. Suivez le guide: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

```bash
# ❌ INCORRECT (MongoDB local non installé)
MONGODB_URI=mongodb://localhost:27017/talkme

# ✅ CORRECT (MongoDB Atlas Cloud)
MONGODB_URI=mongodb+srv://talkme_user:PASSWORD@cluster0.xxxxx.mongodb.net/talkme?retryWrites=true&w=majority
```

---

### ❌ "⚠️ Timeout - Le serveur ne répond pas"

**Cause**: Le backend est arrêté ou MongoDB n'est pas configuré

**Solutions**:
1. Vérifiez que le backend tourne:
   ```bash
   cd server
   npm start
   ```
   
2. Vérifiez la console du serveur:
   - ❌ "Erreur MongoDB" → Configurez MongoDB Atlas
   - ✅ "MongoDB connecté" → OK
   - ✅ "Serveur TalkMe démarré" → OK

3. Vérifiez MongoDB Atlas:
   - Connectez-vous à https://cloud.mongodb.com
   - Vérifiez que le cluster est en ligne (state = "IDLE")
   - Vérifiez que votre adresse IP est autorisée (Network Access)

---

### ❌ "❌ Erreur réseau - Le serveur n'est pas accessible"

**Cause**: Le backend n'est pas accessible sur port 5000

**Solutions**:
```bash
# Terminal 1: Vérifiez que le backend tourne
cd server
npm start

# Terminal 2: Vérifiez la connexion
curl http://localhost:5000

# Doit retourner: "Serveur TalkMe est en ligne"
```

---

### ❌ "Les mots de passe ne correspondent pas"

**Cause**: Erreur lors de la saisie du formulaire

**Solution**:
- Vérifiez que les deux champs "Mot de passe" sont identiques
- Le mot de passe doit contenir au moins 6 caractères

---

### ❌ Messages ne s'affichent pas

**Cause**: Socket.IO n'est pas connecté

**Solutions**:
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Network"
3. Cherchez les WebSocket connections (socket.io)
4. Si absent: vérifiez que le backend tourne
5. Vérifiez la console pour les erreurs Socket.IO

**Codes d'erreur Socket.IO**:
- `CONNECT_ERROR` → Vérifiez le token JWT
- `Unauthorized` → Reconnectez-vous

---

### ❌ "Utilisateur déjà existant"

**Cause**: L'email ou le nom d'utilisateur existe déjà

**Solution**:
- Utilisez un email ou nom d'utilisateur différent
- Connectez-vous avec vos identifiants existants

---

## 🔍 Vérification Pas à Pas

### 1. Vérifier MongoDB
```bash
# Vérifiez que MongoDB Atlas cluster tourne
# Connectez-vous à https://cloud.mongodb.com
# État du cluster doit être "IDLE" (vert)
```

### 2. Vérifier le Backend
```bash
cd server
npm start

# ✅ Doit afficher:
# ✓ MongoDB connecté
# 🚀 Serveur TalkMe démarré
# 🔗 Port: 5000
```

### 3. Vérifier le Frontend
```bash
cd client
npm start

# ✅ Doit ouvrir http://localhost:3000 automatiquement
# ✅ Pas d'erreurs rouges dans la console
```

### 4. Vérifier la Connexion
```bash
curl -X GET http://localhost:5000/

# ✅ Doit retourner:
# "Serveur TalkMe est en ligne"
```

### 5. Vérifier Socket.IO
1. Ouvrez http://localhost:3000
2. Ouvrez DevTools (F12)
3. Allez dans Console
4. Cherchez: "Connecté au serveur Socket.IO"
5. ✅ Si présent → Connexion OK
6. ❌ Si absent → Vérifiez le backend

---

## 🛠️ Réinitialiser Complètement

Si tout échoue, réinitialisez:

```bash
# 1. Arrêtez tous les services (Ctrl+C dans tous les terminaux)

# 2. Nettoyez le cache
rm -rf server/node_modules client/node_modules
npm cache clean --force

# 3. Réinstallez
cd server && npm install
cd ../client && npm install

# 4. Vérifiez MongoDB Atlas
# Connectez-vous à cloud.mongodb.com
# Vérifiez que le cluster existe et est en ligne

# 5. Mettez à jour .env
# server/.env:
# MONGODB_URI=mongodb+srv://talkme_user:PASSWORD@cluster0.xxxxx.mongodb.net/talkme?retryWrites=true&w=majority

# 6. Redémarrez
cd server && npm start    # Terminal 1
cd client && npm start    # Terminal 2
```

---

## 📋 Checklist de Démarrage

- [ ] MongoDB Atlas cluster créé et en ligne
- [ ] `server/.env` avec URI MongoDB Atlas correcte
- [ ] Backend démarré (`npm start` dans server/)
- [ ] Frontend démarré (`npm start` dans client/)
- [ ] Pas d'erreurs rouges dans les consoles
- [ ] Backend affiche "MongoDB connecté"
- [ ] Frontend charge à http://localhost:3000
- [ ] Socket.IO connecté (visible dans DevTools)

---

## 💬 Encore Besoin d'Aide?

1. Vérifiez les logs du serveur dans le terminal
2. Ouvrez la console du navigateur (F12)
3. Consultez la section pertinente ci-dessus
4. Suivez le guide MongoDB: [MONGODB_SETUP.md](./MONGODB_SETUP.md)
