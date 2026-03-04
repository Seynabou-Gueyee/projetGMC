const Message = require('../models/Message');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const bot = require('../utils/bot');
const logger = require('../utils/logger');

/**
 * @desc Récupérer les statistiques des messages
 * @route GET /api/statistics/messages
 * @access Private
 */
exports.getMessageStatistics = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    const userId = req.user.id;

    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    // Messages du jour/période
    const messagesToday = await Message.countDocuments({
      createdAt: { $gte: startDate },
      isDeleted: false
    });

    // Utilisateurs actifs
    const activeUsers = await User.countDocuments({
      lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      isOnline: true
    });

    // Total de messages
    const totalMessages = await Message.countDocuments({ isDeleted: false });

    // Messages par heure (pour le jour)
    let messagesByHour = [];
    if (period === 'today') {
      const hourly = await Message.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      messagesByHour = hourly.map(h => ({
        hour: h._id,
        count: h.count
      }));
    }

    // Utilisateurs les plus actifs
    const topSenders = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$senderName',
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { messageCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      messagesToday,
      activeUsers,
      totalMessages,
      messagesByHour,
      topSenders: topSenders.map(s => ({
        username: s._id,
        messageCount: s.messageCount
      }))
    });
  } catch (error) {
    logger.error('Erreur récupération statistiques:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Obtenir les suggestions IA pour une réponse
 * @route POST /api/bot/suggestions
 * @access Public
 */
exports.getResponseSuggestions = async (req, res) => {
  try {
    const { messageContent } = req.body;

    if (!messageContent) {
      return res.status(400).json({ message: 'Message content required' });
    }

    const suggestions = bot.suggestResponse(messageContent);

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    logger.error('Erreur suggestions bot:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Traiter une commande bot
 * @route POST /api/bot/command
 * @access Private
 */
exports.executeBotCommand = async (req, res) => {
  try {
    const { command, room } = req.body;
    const user = req.user;

    if (!command) {
      return res.status(400).json({ message: 'Command required' });
    }

    const botResponse = await bot.processMessage(command, user, room, []);

    if (!botResponse) {
      return res.status(404).json({ message: 'Command not found' });
    }

    res.status(200).json({
      success: true,
      response: botResponse
    });
  } catch (error) {
    logger.error('Erreur commande bot:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Obtenir l'état des commandes bot
 * @route GET /api/bot/commands
 * @access Public
 */
exports.getBotCommands = async (req, res) => {
  try {
    const commands = bot.getCommandsList();

    res.status(200).json({
      success: true,
      commands,
      botName: 'TalkMeBot'
    });
  } catch (error) {
    logger.error('Erreur liste commandes bot:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Mettre à jour le statut de l'utilisateur
 * @route PUT /api/users/status
 * @access Private
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'online', 'away', 'offline'
    const userId = req.user.id;

    if (!['online', 'away', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isOnline: status === 'online',
        status: status,
        lastSeen: new Date()
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        status: user.status,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    logger.error('Erreur mise à jour statut:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Obtenir le statut d'un utilisateur
 * @route GET /api/users/:userId/status
 * @access Private
 */
exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('status isOnline lastSeen username');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      status: user.status,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      username: user.username
    });
  } catch (error) {
    logger.error('Erreur récupération statut utilisateur:', error);
    res.status(500).json({ message: error.message });
  }
};
