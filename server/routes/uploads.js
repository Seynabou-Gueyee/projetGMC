const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

// Créer les dossiers d'upload s'ils n'existent pas
const uploadsDir = path.join(__dirname, '../uploads');
const directoriesNeeded = ['images', 'videos', 'audio', 'files'];

directoriesNeeded.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = getFileType(file.mimetype);
    const uploadPath = path.join(uploadsDir, fileType);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    file: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
  };

  const allAllowedTypes = Object.values(allowedTypes).flat();
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Fonction pour déterminer le type de fichier
function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('video/')) return 'videos';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'files';
}

// @route   POST /api/uploads/single
// @desc    Télécharger un seul fichier
// @access  Private
router.post('/single', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const fileType = getFileType(req.file.mimetype);
    const fileUrl = `/uploads/${fileType}/${req.file.filename}`;

    res.status(200).json({
      success: true,
      file: {
        type: fileType.replace('s', ''), // 'images' -> 'image'
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        url: fileUrl,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/uploads/multiple
// @desc    Télécharger plusieurs fichiers
// @access  Private
router.post('/multiple', protect, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const files = req.files.map(file => {
      const fileType = getFileType(file.mimetype);
      return {
        type: fileType.replace('s', ''),
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        url: `/uploads/${fileType}/${file.filename}`,
        uploadedAt: new Date()
      };
    });

    res.status(200).json({
      success: true,
      files,
      count: files.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/uploads/:fileType/:fileName
// @desc    Télécharger un fichier
// @access  Public
router.get('/:fileType/:fileName', (req, res) => {
  try {
    const { fileType, fileName } = req.params;
    const filePath = path.join(uploadsDir, fileType, fileName);

    // Vérifier que le fichier existe et qu'il est dans le bon répertoire
    if (!fs.existsSync(filePath) || !filePath.startsWith(uploadsDir)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/uploads/:fileType/:fileName
// @desc    Supprimer un fichier
// @access  Private
router.delete('/:fileType/:fileName', protect, (req, res) => {
  try {
    const { fileType, fileName } = req.params;
    const filePath = path.join(uploadsDir, fileType, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Fichier supprimé'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware de gestion des erreurs multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ message: 'Fichier trop volumineux (max 50MB)' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Trop de fichiers (max 10)' });
    }
  }
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

module.exports = router;
