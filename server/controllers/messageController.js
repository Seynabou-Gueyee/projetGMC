const Message = require('../models/Message');

// @desc    Créer et sauvegarder un nouveau message
const sendMessage = async (req, res) => {
  try {
    const { content, room, recipient } = req.body;
    const senderId = req.user.id;

    if (!content || !room) {
      return res.status(400).json({ message: 'Contenu et salon requis' });
    }

    // Créer le message
    const message = await Message.create({
      content,
      sender: senderId,
      senderName: req.user.username,
      room,
      recipient: recipient || null,
      isDelivered: true,
      deliveredAt: new Date()
    });

    // Peupler les informations du sender
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email')
      .populate('recipient', 'username email')
      .populate('readBy.userId', 'username')
      .populate('reactions.userId', 'username');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les messages d'une salle
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({ room: roomId, isDeleted: false })
      .populate('sender', 'username email avatar')
      .populate('recipient', 'username email')
      .populate('readBy.userId', 'username')
      .populate('reactions.userId', 'username')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Message.countDocuments({ room: roomId, isDeleted: false });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      messages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les messages privés entre deux utilisateurs
const getPrivateMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ],
      isDeleted: false
    })
      .populate('sender', 'username email avatar')
      .populate('recipient', 'username email')
      .populate('readBy.userId', 'username')
      .populate('reactions.userId', 'username')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Message.countDocuments({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ],
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      messages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Envoyer un message privé
const sendPrivateMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { recipientId } = req.params;
    const senderId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Contenu du message requis' });
    }

    if (senderId === recipientId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas envoyer un message à vous-même' });
    }

    // Récupérer l'utilisateur pour obtenir son username
    const User = require('../models/User');
    const sender = await User.findById(senderId);
    
    if (!sender) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Créer le message privé
    const message = await Message.create({
      content,
      sender: senderId,
      senderName: sender.username,
      recipient: recipientId,
      room: null,
      isDelivered: true,
      deliveredAt: new Date()
    });

    // Peupler les informations
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email avatar')
      .populate('recipient', 'username email avatar')
      .populate('readBy.userId', 'username')
      .populate('reactions.userId', 'username');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce message' });
    }

    // Soft delete: marquer comme supprimé au lieu de le supprimer
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message supprimé'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Modifier un message
const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Contenu du message requis' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce message' });
    }

    // Ajouter à l'historique d'édition
    if (!message.editHistory) {
      message.editHistory = [];
    }
    message.editHistory.push({
      content: message.content,
      editedAt: new Date()
    });

    // Mettre à jour le contenu
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('sender', 'username email')
      .populate('recipient', 'username email')
      .populate('readBy.userId', 'username')
      .populate('reactions.userId', 'username');

    res.status(200).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ajouter une réaction au message
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji requis' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà mis cette réaction
    const existingReaction = message.reactions.find(
      r => r.userId.toString() === userId && r.emoji === emoji
    );

    if (existingReaction) {
      return res.status(400).json({ message: 'Réaction déjà ajoutée' });
    }

    message.reactions.push({ userId, emoji });
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('reactions.userId', 'username');

    res.status(200).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Retirer une réaction du message
const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    message.reactions = message.reactions.filter(
      r => !(r.userId.toString() === userId && r.emoji === emoji)
    );
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('reactions.userId', 'username');

    res.status(200).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marquer un message comme lu
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà marqué comme lu
    const alreadyRead = message.readBy.some(r => r.userId.toString() === userId);
    if (!alreadyRead) {
      message.readBy.push({ userId, readAt: new Date() });
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message marqué comme lu'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Épingler un message
const pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est l'auteur ou un modérateur
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé à épingler ce message' });
    }

    message.isPinned = true;
    message.pinnedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('sender', 'username email')
      .populate('recipient', 'username email');

    res.status(200).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dépingler un message
const unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est l'auteur ou un modérateur
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé à dépingler ce message' });
    }

    message.isPinned = false;
    message.pinnedAt = null;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message désépinglé'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rechercher des messages
const searchMessages = async (req, res) => {
  try {
    const { query, room } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Terme de recherche requis' });
    }

    const searchFilter = {
      isDeleted: false,
      content: { $regex: query, $options: 'i' } // Case-insensitive
    };

    if (room) {
      searchFilter.room = room;
    }

    const messages = await Message.find(searchFilter)
      .populate('sender', 'username email avatar')
      .populate('recipient', 'username email')
      .populate('readBy.userId', 'username')
      .populate('reactions.userId', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
