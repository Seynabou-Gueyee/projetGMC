/**
 * Configuration d'Upload Multimédia
 * Gère audio, fichiers, images et vidéos
 * 
 * Structure:
 * uploads/
 * ├── audio/      → Fichiers audio (MP3, WAV, etc.)
 * ├── files/      → Documents (PDF, DOC, etc.)
 * ├── images/     → Images (JPG, PNG, GIF, etc.)
 * └── video/      → Vidéos (MP4, WebM, etc.)
 */

const path = require('path');
const fs = require('fs');

const uploadConfig = {
  // Configuration globale
  global: {
    uploads_dir: path.join(__dirname, '../../uploads'),
    max_file_size: 500 * 1024 * 1024, // 500MB max
    cleanup_days: 30, // Supprimer fichiers > 30 jours
    enable_antivirus_scan: false, // À activer si ClamAV disponible
    enable_compression: true, // Compresser images/vidéos
    enable_encryption: false, // Chiffrer fichiers sensibles
  },

  // Configuration par type
  audio: {
    folder: 'uploads/audio',
    max_size: 50 * 1024 * 1024, // 50MB
    mime_types: [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/webm',
      'audio/flac',
      'audio/ogg',
      'audio/aac'
    ],
    extensions: ['.mp3', '.wav', '.m4a', '.webm', '.flac', '.ogg', '.aac'],
    allowed_bitrates: [128, 192, 256, 320], // kbps
    description: 'Fichiers audio (MP3, WAV, M4A, etc.)',
  },

  files: {
    folder: 'uploads/files',
    max_size: 100 * 1024 * 1024, // 100MB
    mime_types: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheet.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    extensions: [
      '.pdf',
      '.doc', '.docx',
      '.txt',
      '.xls', '.xlsx',
      '.ppt', '.pptx',
      '.csv',
      '.rtf'
    ],
    scan_for_pii: true, // Scanner pour PII (GDPR)
    description: 'Documents (PDF, Word, Excel, etc.)',
  },

  images: {
    folder: 'uploads/images',
    max_size: 10 * 1024 * 1024, // 10MB
    mime_types: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    compression: {
      enabled: true,
      quality: 85, // 0-100
      max_width: 2560,
      max_height: 2560,
      generate_thumbnail: true,
      thumbnail_size: 200
    },
    allowed_exif: ['DateTimeOriginal', 'Make', 'Model'], // GDPR - strip autres EXIF
    description: 'Images (JPG, PNG, GIF, WebP, etc.)',
  },

  video: {
    folder: 'uploads/video',
    max_size: 500 * 1024 * 1024, // 500MB
    mime_types: [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska'
    ],
    extensions: ['.mp4', '.webm', '.mkv', '.mov', '.avi', '.flv', '.m4v'],
    compression: {
      enabled: true,
      codec: 'h264', // h264, vp9, vp8
      bitrate: '2M', // 2Mbps
      max_duration: 3600 // 1 heure
    },
    generate_thumbnail: true,
    thumbnail_at_second: 5, // À 5 secondes
    description: 'Vidéos (MP4, WebM, MKV, etc.)',
  },
};

/**
 * Valider un fichier upload
 * @param {Object} file - Fichier multipart
 * @param {String} type - Type (audio, files, images, video)
 * @returns {Object} { valid: boolean, error?: string }
 */
const validateFile = (file, type) => {
  const config = uploadConfig[type];
  
  if (!config) {
    return { valid: false, error: `Type invalide: ${type}` };
  }

  // Vérifier taille
  if (file.size > config.max_size) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Max: ${config.max_size / 1024 / 1024}MB`
    };
  }

  // Vérifier extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!config.extensions.includes(ext)) {
    return {
      valid: false,
      error: `Extension non autorisée: ${ext}. Autorisées: ${config.extensions.join(', ')}`
    };
  }

  // Vérifier MIME type
  if (!config.mime_types.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Type MIME non autorisé: ${file.mimetype}`
    };
  }

  return { valid: true };
};

/**
 * Générer nom fichier sécurisé
 * @param {String} originalName
 * @returns {String}
 */
const generateSafeFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext)
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 50);
  
  return `${timestamp}-${random}-${name}${ext}`;
};

/**
 * Obtenir le chemin complet d'upload
 * @param {String} type - audio, files, images, video
 * @returns {String}
 */
const getUploadPath = (type) => {
  const config = uploadConfig[type];
  if (!config) return null;
  return path.join(uploadConfig.global.uploads_dir, config.folder);
};

/**
 * Obtenir statistiques dossiers d'upload
 * @returns {Promise<Object>}
 */
const getUploadStats = async () => {
  const types = Object.keys(uploadConfig).filter(k => k !== 'global');
  const stats = {};

  for (const type of types) {
    const dir = getUploadPath(type);
    try {
      const files = fs.readdirSync(dir).filter(f => f !== '.gitkeep');
      let totalSize = 0;

      files.forEach(file => {
        try {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        } catch (e) {
          console.error(`Erreur lecture ${file}:`, e.message);
        }
      });

      stats[type] = {
        count: files.length,
        size_bytes: totalSize,
        size_mb: (totalSize / (1024 ** 2)).toFixed(2),
        size_gb: (totalSize / (1024 ** 3)).toFixed(2),
      };
    } catch (e) {
      console.error(`Erreur lecture dossier ${type}:`, e.message);
      stats[type] = { error: e.message };
    }
  }

  return stats;
};

/**
 * Nettoyer fichiers anciens
 * @param {Number} days - Supprimer fichiers plus vieux que X jours
 */
const cleanupOldFiles = async (days = uploadConfig.global.cleanup_days) => {
  const types = Object.keys(uploadConfig).filter(k => k !== 'global');
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  let deleted = 0;

  for (const type of types) {
    const dir = getUploadPath(type);
    try {
      const files = fs.readdirSync(dir).filter(f => f !== '.gitkeep');

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filePath);
          deleted++;
          console.log(`[Cleanup] Supprimé: ${type}/${file}`);
        }
      }
    } catch (e) {
      console.error(`Erreur cleanup ${type}:`, e.message);
    }
  }

  return { deleted, days };
};

/**
 * Configuration Multer automatique
 * @returns {Object} Configuration pour multer.diskStorage
 */
const getMulterConfig = () => {
  const storage = require('multer').diskStorage({
    destination: (req, file, cb) => {
      const type = req.body.upload_type || file.fieldname || 'files';
      const dir = getUploadPath(type);
      
      if (!dir) {
        return cb(new Error(`Type d'upload invalide: ${type}`));
      }

      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, generateSafeFilename(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    const type = req.body.upload_type || file.fieldname || 'files';
    const validation = validateFile(file, type);

    if (!validation.valid) {
      return cb(new Error(validation.error));
    }

    cb(null, true);
  };

  return {
    storage,
    fileFilter,
    limits: {
      fileSize: uploadConfig.global.max_file_size
    }
  };
};

module.exports = {
  uploadConfig,
  validateFile,
  generateSafeFilename,
  getUploadPath,
  getUploadStats,
  cleanupOldFiles,
  getMulterConfig,
};
