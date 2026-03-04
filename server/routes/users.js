const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateStatus,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getPublicProfile,
  getConnectedUsers,
  searchUsers,
  promoteToModerator,
  demoteFromModerator
} = require('../controllers/userController');

// Configuration multer pour upload de photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../client/public/uploads/avatars');
    // Créer le dossier s'il n'existe pas
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non autorisé'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// @route   GET /api/users/profile
// @desc    Récupérer le profil de l'utilisateur connecté
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Mettre à jour le profil
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   POST /api/users/avatar
// @desc    Uploader une photo de profil
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// @route   PUT /api/users/status
// @desc    Mettre à jour le statut de l'utilisateur
// @access  Private
router.put('/status', protect, updateStatus);

// @route   POST /api/users/block
// @desc    Bloquer un utilisateur
// @access  Private
router.post('/block', protect, blockUser);

// @route   POST /api/users/unblock
// @desc    Débloquer un utilisateur
// @access  Private
router.post('/unblock', protect, unblockUser);

// @route   GET /api/users/blocked
// @desc    Récupérer la liste des utilisateurs bloqués
// @access  Private
router.get('/blocked', protect, getBlockedUsers);

// @route   GET /api/users/connected
// @desc    Récupérer les utilisateurs connectés
// @access  Private
router.get('/connected', protect, getConnectedUsers);

// @route   GET /api/users/search
// @desc    Chercher des utilisateurs
// @access  Private
router.get('/search', protect, searchUsers);

// @route   GET /api/users/:userId/profile
// @desc    Récupérer le profil public d'un utilisateur
// @access  Private
router.get('/:userId/profile', protect, getPublicProfile);

// @route   PUT /api/users/:userId/promote
// @desc    Promouvoir un utilisateur à modérateur (admin)
// @access  Private
router.put('/:userId/promote', protect, promoteToModerator);

// @route   PUT /api/users/:userId/demote
// @desc    Retirer le rôle de modérateur (admin)
// @access  Private
router.put('/:userId/demote', protect, demoteFromModerator);

module.exports = router;
