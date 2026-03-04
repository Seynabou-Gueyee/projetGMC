/**
 * Contrôleur Upload Multimédia
 * Gère les uploads audio, fichiers, images, vidéos
 */

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { 
  uploadConfig, 
  validateFile, 
  generateSafeFilename,
  getUploadPath,
  getUploadStats,
  getMulterConfig 
} = require('../config/uploadConfig');

/**
 * GET /api/upload/stats
 * Obtenir statistiques d'utilisation des uploads
 */
exports.getUploadStats = async (req, res) => {
  try {
    const stats = await getUploadStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/upload/config
 * Obtenir configuration pour le frontend
 */
exports.getUploadConfig = (req, res) => {
  const config = {
    types: {},
    global: uploadConfig.global
  };

  Object.keys(uploadConfig).forEach(type => {
    if (type !== 'global') {
      config.types[type] = {
        folder: uploadConfig[type].folder,
        max_size: uploadConfig[type].max_size,
        max_size_mb: uploadConfig[type].max_size / (1024 * 1024),
        extensions: uploadConfig[type].extensions,
        description: uploadConfig[type].description
      };
    }
  });

  res.json({ success: true, data: config });
};

/**
 * POST /api/upload/:type
 * Uploader un fichier (audio, files, images, video)
 */
exports.uploadFile = async (req, res) => {
  try {
    const { type } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    const validation = validateFile(req.file, type);
    if (!validation.valid) {
      // Supprimer le fichier uploadé
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const uploadedFile = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: `/uploads/${type}/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploaded_at: new Date(),
      uploaded_by: req.user?.id || 'anonymous'
    };

    // TODO: Sauvegarder métadonnées en base de données
    // await uploadedFile.save();

    res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      file: uploadedFile
    });

  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (req.file) {
      fs.unlinkSync(req.file.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/upload/list/:type
 * Lister tous les fichiers d'un type
 */
exports.listFiles = async (req, res) => {
  try {
    const { type } = req.params;
    const dir = getUploadPath(type);

    if (!dir) {
      return res.status(400).json({
        success: false,
        error: `Type invalide: ${type}`
      });
    }

    const files = fs.readdirSync(dir)
      .filter(f => f !== '.gitkeep')
      .map(filename => {
        const filePath = path.join(dir, filename);
        const stats = fs.statSync(filePath);

        return {
          id: filename,
          filename: filename,
          type: type,
          path: `/uploads/${type}/${filename}`,
          size: stats.size,
          size_mb: (stats.size / (1024 * 1024)).toFixed(2),
          created_at: stats.birthtimeMs,
          modified_at: stats.mtimeMs,
          url: `${req.protocol}://${req.get('host')}/uploads/${type}/${filename}`
        };
      })
      .sort((a, b) => b.created_at - a.created_at);

    res.json({
      success: true,
      type: type,
      count: files.length,
      data: files
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * DELETE /api/upload/:type/:filename
 * Supprimer un fichier
 */
exports.deleteFile = async (req, res) => {
  try {
    const { type, filename } = req.params;

    // Sécurité: éviter path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Nom de fichier invalide'
      });
    }

    const dir = getUploadPath(type);
    if (!dir) {
      return res.status(400).json({
        success: false,
        error: `Type invalide: ${type}`
      });
    }

    const filePath = path.join(dir, filename);

    // Vérifier que le fichier est dans le bon dossier
    if (!filePath.startsWith(dir)) {
      return res.status(400).json({
        success: false,
        error: 'Accès refusé'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Fichier non trouvé'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Fichier supprimé',
      file: {
        type: type,
        filename: filename
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/upload/:type/download/:filename
 * Télécharger un fichier
 */
exports.downloadFile = (req, res) => {
  try {
    const { type, filename } = req.params;

    // Sécurité: éviter path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Nom de fichier invalide'
      });
    }

    const dir = getUploadPath(type);
    if (!dir) {
      return res.status(400).json({
        success: false,
        error: `Type invalide: ${type}`
      });
    }

    const filePath = path.join(dir, filename);

    // Vérifier que le fichier est dans le bon dossier
    if (!filePath.startsWith(dir)) {
      return res.status(400).json({
        success: false,
        error: 'Accès refusé'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Fichier non trouvé'
      });
    }

    res.download(filePath, filename);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/upload/cleanup
 * Nettoyer les fichiers anciens (Admin only)
 */
exports.cleanupOldFiles = async (req, res) => {
  try {
    // TODO: Vérifier auth admin

    const { days = 30 } = req.body;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const types = Object.keys(uploadConfig).filter(k => k !== 'global');
    let deletedCount = 0;
    const deletedFiles = [];

    for (const type of types) {
      const dir = getUploadPath(type);
      const files = fs.readdirSync(dir).filter(f => f !== '.gitkeep');

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
          deletedFiles.push({
            type: type,
            filename: file,
            age_days: Math.round((Date.now() - stats.mtimeMs) / (24 * 60 * 60 * 1000))
          });
        }
      }
    }

    res.json({
      success: true,
      message: `${deletedCount} fichiers supprimés`,
      deleted_count: deletedCount,
      deleted_files: deletedFiles,
      cleanup_threshold_days: days
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Middleware File Upload
 * @param {String} type - audio, files, images, video
 */
exports.handleFileUpload = (type) => {
  const config = getMulterConfig();
  return multer({
    ...config,
    limits: {
      fileSize: uploadConfig[type]?.max_size || uploadConfig.global.max_file_size
    }
  }).single('file');
};

module.exports = exports;
