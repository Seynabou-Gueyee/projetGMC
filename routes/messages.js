const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  sendMessage, 
  getRoomMessages, 
  getPrivateMessages, 
  deleteMessage 
} = require('../controllers/messageController');

// @route   POST /api/messages
// @desc    Envoyer un nouveau message
// @access  Private
router.post('/', protect, sendMessage);

// @route   GET /api/messages/room/:roomId
// @desc    Récupérer les messages d'une salle
// @access  Private
router.get('/room/:roomId', protect, getRoomMessages);

// @route   GET /api/messages/private/:userId
// @desc    Récupérer les messages privés avec un utilisateur
// @access  Private
router.get('/private/:userId', protect, getPrivateMessages);

// @route   DELETE /api/messages/:messageId
// @desc    Supprimer un message
// @access  Private
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
