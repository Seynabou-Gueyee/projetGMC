const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  sendMessage, 
  sendPrivateMessage,
  getRoomMessages, 
  getPrivateMessages, 
  deleteMessage,
  updateMessage,
  addReaction,
  removeReaction,
  markAsRead,
  pinMessage,
  unpinMessage,
  searchMessages
} = require('../controllers/messageController');

// @route   POST /api/messages
// @desc    Envoyer un nouveau message
// @access  Private
router.post('/', protect, sendMessage);

// @route   GET /api/messages/search
// @desc    Rechercher des messages
// @access  Private
router.get('/search', protect, searchMessages);

// @route   POST /api/messages/private/:recipientId
// @desc    Envoyer un message privé
// @access  Private
router.post('/private/:recipientId', protect, sendPrivateMessage);

// @route   GET /api/messages/room/:roomId
// @desc    Récupérer les messages d'une salle
// @access  Private
router.get('/room/:roomId', protect, getRoomMessages);

// @route   GET /api/messages/private/:userId
// @desc    Récupérer les messages privés avec un utilisateur
// @access  Private
router.get('/private/:userId', protect, getPrivateMessages);

// @route   PUT /api/messages/:messageId
// @desc    Modifier un message
// @access  Private
router.put('/:messageId', protect, updateMessage);

// @route   DELETE /api/messages/:messageId
// @desc    Supprimer un message
// @access  Private
router.delete('/:messageId', protect, deleteMessage);

// @route   POST /api/messages/:messageId/read
// @desc    Marquer un message comme lu
// @access  Private
router.post('/:messageId/read', protect, markAsRead);

// @route   POST /api/messages/:messageId/reactions
// @desc    Ajouter une réaction au message
// @access  Private
router.post('/:messageId/reactions', protect, addReaction);

// @route   DELETE /api/messages/:messageId/reactions
// @desc    Retirer une réaction du message
// @access  Private
router.delete('/:messageId/reactions', protect, removeReaction);

// @route   POST /api/messages/:messageId/pin
// @desc    Épingler un message
// @access  Private
router.post('/:messageId/pin', protect, pinMessage);

// @route   POST /api/messages/:messageId/unpin
// @desc    Dépingler un message
// @access  Private
router.post('/:messageId/unpin', protect, unpinMessage);

module.exports = router;
