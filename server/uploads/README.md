# 📁 Structure des Uploads

Cette directory contient tous les fichiers uploadés par les utilisateurs, organisés par type.

## 📂 Dossiers

```
uploads/
├── audio/          # Fichiers audio (MP3, WAV, M4A, etc.)
├── files/          # Documents (PDF, DOC, TXT, etc.)
├── images/         # Images (JPG, PNG, GIF, WebP, etc.)
└── video/          # Vidéos (MP4, WebM, MKV, etc.)
```

## 🔐 Sécurité

- Tous les files sont scannés avant stockage
- Extensions validées (`whitelist only`)
- Taille maximale par type
- Scan antivirus optionnel
- Chiffrement PII optionnel

## 📋 Configuration des Uploads

### Audio
```javascript
{
  folder: 'uploads/audio',
  maxSize: 50 * 1024 * 1024, // 50MB
  mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm'],
  extensions: ['.mp3', '.wav', '.m4a', '.webm', '.flac']
}
```

### Files (Documents)
```javascript
{
  folder: 'uploads/files',
  maxSize: 100 * 1024 * 1024, // 100MB
  mimeTypes: ['application/pdf', 'application/msword', 'text/plain'],
  extensions: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx']
}
```

### Images
```javascript
{
  folder: 'uploads/images',
  maxSize: 10 * 1024 * 1024, // 10MB
  mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
}
```

### Video
```javascript
{
  folder: 'uploads/video',
  maxSize: 500 * 1024 * 1024, // 500MB
  mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  extensions: ['.mp4', '.webm', '.mkv', '.mov', '.avi']
}
```

## 🛡️ Validation Recommandée

```javascript
const uploadConfig = {
  audio: {
    folder: 'uploads/audio',
    maxSize: 50 * 1024 * 1024,
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm'],
    extensions: ['.mp3', '.wav', '.m4a', '.webm', '.flac']
  },
  files: {
    folder: 'uploads/files',
    maxSize: 100 * 1024 * 1024,
    mimeTypes: ['application/pdf', 'application/msword', 'text/plain'],
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx']
  },
  images: {
    folder: 'uploads/images',
    maxSize: 10 * 1024 * 1024,
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  video: {
    folder: 'uploads/video',
    maxSize: 500 * 1024 * 1024,
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.mkv', '.mov', '.avi']
  }
};
```

## 📝 Exemple Utilisation avec Multer

```javascript
const multer = require('multer');
const path = require('path');

// Configuration storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'files'; // audio, files, images, video
    cb(null, `uploads/${type}/`);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  }
});

// Filter
const fileFilter = (req, file, cb) => {
  const allowed = ['audio', 'files', 'images', 'video'];
  const type = req.body.type || 'files';
  
  if (!allowed.includes(type)) {
    return cb(new Error('Type invalide'));
  }
  
  const config = uploadConfig[type];
  if (!config.extensions.includes(path.extname(file.originalname).toLowerCase())) {
    return cb(new Error(`Extension non autorisée pour ${type}`));
  }
  
  cb(null, true);
};

// Middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  },
  fileFilter: fileFilter
});

module.exports = { upload, uploadConfig };
```

## 🔄 Routes Recommandées

```javascript
// POST /api/upload/audio
// POST /api/upload/files
// POST /api/upload/images
// POST /api/upload/video
// GET /api/upload/list/:type
// DELETE /api/upload/:type/:filename
```

## 🧹 Nettoyage Automatique

```javascript
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Supprimer les fichiers > 30 jours
cron.schedule('0 0 * * *', () => { // Chaque jour à minuit
  const types = ['audio', 'files', 'images', 'video'];
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  types.forEach(type => {
    const dir = `uploads/${type}`;
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`Supprimé: ${filePath}`);
      }
    });
  });
});
```

## 📊 Statistiques Dossiers

```javascript
const getUploadStats = async () => {
  const types = ['audio', 'files', 'images', 'video'];
  const stats = {};
  
  for (const type of types) {
    const dir = `uploads/${type}`;
    const files = fs.readdirSync(dir);
    const totalSize = files.reduce((sum, file) => {
      const filePath = path.join(dir, file);
      return sum + fs.statSync(filePath).size;
    }, 0);
    
    stats[type] = {
      count: files.length,
      size: totalSize,
      sizeGB: (totalSize / (1024 ** 3)).toFixed(2)
    };
  }
  
  return stats;
};
```

## ✅ Checklist

- [x] Dossier `uploads/audio` créé
- [x] Dossier `uploads/files` créé
- [x] Dossier `uploads/images` créé
- [x] Dossier `uploads/video` créé
- [ ] Configurer Multer avec les limites
- [ ] Implémenter les routes d'upload
- [ ] Ajouter validation taille/extension
- [ ] Configurer nettoyage automatique
- [ ] Ajouter scan antivirus (optionnel)
- [ ] Implémenter compression images/vidéos (optionnel)
- [ ] Setup backup automatique (optionnel)

---

**Version**: 1.0  
**Date**: 4 mars 2026  
**Statut**: ✅ Structure créée, prête à implémenter
