/**
 * Routes Upload Multimédia
 * Endpoints API pour gérer audio, fichiers, images, vidéos
 * 
 * API Endpoints:
 * POST   /api/upload/audio         → Uploader fichier audio
 * POST   /api/upload/files         → Uploader document
 * POST   /api/upload/images        → Uploader image
 * POST   /api/upload/video         → Uploader vidéo
 * GET    /api/upload/list/:type    → Lister fichiers
 * DELETE /api/upload/:type/:file   → Supprimer fichier
 * GET    /api/upload/stats         → Statistiques
 * POST   /api/upload/cleanup       → Nettoyer ancien (Admin)
 */

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { handleFileUpload } = require('../config/uploadConfig');

// ==============================================
// ROUTES UPLOAD
// ==============================================

/**
 * POST /api/upload/audio
 * Uploader un fichier audio
 * 
 * Exemple cURL:
 * curl -X POST http://localhost:5000/api/upload/audio \
 *   -F "file=@song.mp3"
 */
router.post('/audio', uploadController.handleFileUpload('audio'), uploadController.uploadFile);

/**
 * POST /api/upload/files
 * Uploader un document
 * 
 * Exemple cURL:
 * curl -X POST http://localhost:5000/api/upload/files \
 *   -F "file=@document.pdf"
 */
router.post('/files', uploadController.handleFileUpload('files'), uploadController.uploadFile);

/**
 * POST /api/upload/images
 * Uploader une image
 * 
 * Exemple cURL:
 * curl -X POST http://localhost:5000/api/upload/images \
 *   -F "file=@photo.jpg"
 */
router.post('/images', uploadController.handleFileUpload('images'), uploadController.uploadFile);

/**
 * POST /api/upload/video
 * Uploader une vidéo
 * 
 * Exemple cURL:
 * curl -X POST http://localhost:5000/api/upload/video \
 *   -F "file=@video.mp4"
 */
router.post('/video', uploadController.handleFileUpload('video'), uploadController.uploadFile);

// ==============================================
// ROUTES CONSULTATION
// ==============================================

/**
 * GET /api/upload/list/:type
 * Lister tous les fichiers d'un type
 * 
 * Paramètres:
 * - type: audio | files | images | video
 * 
 * Exemple:
 * GET /api/upload/list/images
 */
router.get('/list/:type', uploadController.listFiles);

/**
 * GET /api/upload/stats
 * Obtenir statistiques d'utilisation
 * 
 * Exemple:
 * GET /api/upload/stats
 * 
 * Retourne:
 * {
 *   data: {
 *     audio: { count: 5, size_mb: 120.5, size_gb: 0.12 },
 *     files: { count: 12, size_mb: 450.3, size_gb: 0.45 },
 *     images: { count: 28, size_mb: 250.1, size_gb: 0.25 },
 *     video: { count: 3, size_mb: 1250.0, size_gb: 1.25 }
 *   }
 * }
 */
router.get('/stats', uploadController.getUploadStats);

/**
 * GET /api/upload/config
 * Obtenir configuration (pour frontend)
 */
router.get('/config', uploadController.getUploadConfig);

// ==============================================
// ROUTES SUPPRESSION
// ==============================================

/**
 * DELETE /api/upload/:type/:filename
 * Supprimer un fichier
 * 
 * Paramètres:
 * - type: audio | files | images | video
 * - filename: nom du fichier (URL-encoded)
 * 
 * Exemple:
 * DELETE /api/upload/images/123456-abc-photo.jpg
 */
router.delete('/:type/:filename', uploadController.deleteFile);

// ==============================================
// ROUTES ADMIN
// ==============================================

/**
 * POST /api/upload/cleanup
 * Nettoyer les fichiers anciens (Admin only)
 * 
 * Body:
 * {
 *   "days": 30  // Supprimer fichiers > 30 jours
 * }
 * 
 * Exemple:
 * curl -X POST http://localhost:5000/api/upload/cleanup \
 *   -H "Content-Type: application/json" \
 *   -d '{"days": 30}'
 */
router.post('/cleanup', uploadController.cleanupOldFiles);

// ==============================================
// ERROR HANDLER
// ==============================================

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Fichier trop volumineux'
      });
    }
  }

  res.status(500).json({
    success: false,
    error: err.message || 'Erreur upload'
  });
});

module.exports = router;
