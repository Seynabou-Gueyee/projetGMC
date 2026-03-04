# Guide de Configuration MongoDB Atlas

## ⚠️ Problème actuel
L'application reçoit une erreur de timeout MongoDB car la base de données n'est pas configurée.

## ✅ Solution: MongoDB Atlas (Service Cloud Gratuit)

### Étape 1: Créer un compte MongoDB Atlas
1. Allez sur https://www.mongodb.com/cloud/atlas
2. Cliquez sur "Register" (Inscription gratuite)
3. Remplissez le formulaire et confirmez votre email

### Étape 2: Créer un Cluster
1. Après connexion, cliquez sur "Create a Deployment"
2. Sélectionnez "M0 Free" (gratuit)
3. Choisissez une région (ex: Europe - Frankfurt)
4. Cliquez sur "Create Deployment"
5. Attendez 3-5 minutes que le cluster soit créé

### Étape 3: Configurer l'accès
1. Allez dans "Network Access"
2. Cliquez sur "+ Add IP Address"
3. Sélectionnez "Allow access from anywhere"
4. Cliquez sur "Confirm"

### Étape 4: Créer un utilisateur de base de données
1. Allez dans "Database Access"
2. Cliquez sur "+ Add User"
3. Remplissez:
   - **Username**: `talkme_user`
   - **Password**: Générez un mot de passe fort
4. Cliquez sur "Create User"

### Étape 5: Obtenir la chaîne de connexion
1. Allez dans "Clusters"
2. Cliquez sur "Connect" à côté de votre cluster
3. Sélectionnez "Drivers"
4. Copiez la chaîne de connexion (ex: `mongodb+srv://...`)

### Étape 6: Mettre à jour le fichier .env
Éditez `server/.env` et remplacez:
```
MONGODB_URI=mongodb://localhost:27017/talkme
```

Par:
```
MONGODB_URI=mongodb+srv://talkme_user:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/talkme?retryWrites=true&w=majority
```

⚠️ **IMPORTANT**: Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe créé à l'Étape 4.

### Étape 7: Redémarrer le serveur
```bash
cd server
npm start
```

## 🎉 C'est fait!
L'inscription et la connexion devraient fonctionner maintenant!

---

## Alternative: MongoDB Local (Plus complexe)
Si vous préférez installer MongoDB localement:
1. Téléchargez: https://www.mongodb.com/try/download/community
2. Installez et démarrez le service
3. Vérifiez: `mongod --version`
