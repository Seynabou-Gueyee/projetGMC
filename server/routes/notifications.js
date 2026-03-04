const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  muteConversation,
  unmuteConversation,
  getMuteSettings,
  checkIfMuted
} = require('../controllers/notificationController');

// NOTIFICATIONS

// @route   GET /api/notifications
// @desc    Récupérer les notifications
// @access  Private
router.get('/', protect, getNotifications);

// @route   PUT /api/notifications/:notificationId/read
// @desc    Marquer une notification comme lue
// @access  Private
router.put('/:notificationId/read', protect, markNotificationAsRead);

// @route   PUT /api/notifications/all/read
// @desc    Marquer toutes les notifications comme lues
// @access  Private
router.put('/all/read', protect, markAllNotificationsAsRead);

// @route   DELETE /api/notifications/:notificationId
// @desc    Supprimer une notification
// @access  Private
router.delete('/:notificationId', protect, deleteNotification);

// MUTE SETTINGS

// @route   POST /api/notifications/mute
// @desc    Rendre muet une conversation
// @access  Private
router.post('/mute', protect, muteConversation);

// @route   POST /api/notifications/unmute
// @desc    Activer le son
// @access  Private
router.post('/unmute', protect, unmuteConversation);

// @route   GET /api/notifications/mute/settings
// @desc    Récupérer les paramètres de sourdine
// @access  Private
router.get('/mute/settings', protect, getMuteSettings);

// @route   GET /api/notifications/mute/check
// @desc    Vérifier si une conversation est en sourdine
// @access  Private
router.get('/mute/check', protect, checkIfMuted);

module.exports = router;
