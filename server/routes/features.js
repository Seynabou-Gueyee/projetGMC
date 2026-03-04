const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const featureController = require('../controllers/featureController');

// Statistiques
router.get('/statistics/messages', protect, featureController.getMessageStatistics);

// Bot - Suggestions IA
router.post('/bot/suggestions', featureController.getResponseSuggestions);
router.post('/bot/command', protect, featureController.executeBotCommand);
router.get('/bot/commands', featureController.getBotCommands);

// Statut utilisateur
router.put('/users/status', protect, featureController.updateUserStatus);
router.get('/users/:userId/status', protect, featureController.getUserStatus);

module.exports = router;
