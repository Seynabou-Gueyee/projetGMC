const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrCreatePrivateChat,
  getOrCreateSupportChat,
  getPrivateChats,
  getPrivateChatMessages,
  deletePrivateChat
} = require('../controllers/privateChatController');

// @route   POST /api/private-chats/create
// @desc    Créer ou récupérer une conversation privée
// @access  Private
router.post('/create', protect, getOrCreatePrivateChat);

// @route   GET /api/private-chats/support
// @desc    Créer ou récupérer la conversation avec Support
// @access  Private
router.get('/support/chat', protect, getOrCreateSupportChat);

// @route   GET /api/private-chats
// @desc    Récupérer tous les chats privés
// @access  Private
router.get('/', protect, getPrivateChats);

// @route   GET /api/private-chats/:chatId/messages
// @desc    Récupérer les messages d'un chat privé
// @access  Private
router.get('/:chatId/messages', protect, getPrivateChatMessages);

// @route   DELETE /api/private-chats/:chatId
// @desc    Supprimer une conversation privée
// @access  Private
router.delete('/:chatId', protect, deletePrivateChat);

module.exports = router;
