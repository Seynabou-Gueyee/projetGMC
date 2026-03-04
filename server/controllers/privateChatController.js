const PrivateChat = require('../models/PrivateChat');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Obtenir ou créer une conversation privée
const getOrCreatePrivateChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    if (userId === recipientId) {
      return res.status(400).json({ message: 'Impossible de discuter avec vous-même' });
    }

    // Vérifier si la conversation existe
    let chat = await PrivateChat.findOne({
      participants: { $all: [userId, recipientId] }
    })
      .populate('participants', 'username avatar status')
      .populate('lastMessage');

    if (!chat) {
      // Créer une nouvelle conversation
      chat = await PrivateChat.create({
        participants: [userId, recipientId]
      });
      await chat.populate('participants', 'username avatar status');
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer tous les chats privés
const getPrivateChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await PrivateChat.find({
      participants: userId
    })
      .populate('participants', 'username avatar status statusMessage')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les messages d'une conversation privée
const getPrivateChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Vérifier que l'utilisateur est participant
    const chat = await PrivateChat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { room: chatId, recipient: null },
        { recipient: { $in: chat.participants }, room: null }
      ],
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
      .populate('sender', 'username avatar')
      .populate('readBy.userId', 'username')
      .populate('reactions.userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      $or: [
        { room: chatId, recipient: null },
        { recipient: { $in: chat.participants }, room: null }
      ],
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      messages: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir ou créer un chat avec Support
const getOrCreateSupportChat = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Trouver l'utilisateur Support
    const supportUser = await User.findOne({ username: 'Support' });
    if (!supportUser) {
      return res.status(404).json({ message: 'Contact Support non disponible' });
    }

    if (userId === supportUser._id.toString()) {
      return res.status(400).json({ message: 'Support ne peut pas discuter avec lui-même' });
    }

    // Vérifier si la conversation existe
    let chat = await PrivateChat.findOne({
      participants: { $all: [userId, supportUser._id] }
    })
      .populate('participants', 'username avatar status statusMessage bio')
      .populate('lastMessage');

    if (!chat) {
      // Créer une nouvelle conversation
      chat = await PrivateChat.create({
        participants: [userId, supportUser._id]
      });
      await chat.populate('participants', 'username avatar status statusMessage bio');
    }

    res.status(200).json({
      success: true,
      chat,
      isSupport: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer une conversation privée
const deletePrivateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await PrivateChat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Supprimer tous les messages de cette conversation pour l'utilisateur
    // Option 1: Soft delete (marqués comme supprimés)
    // Option 2: Vraie suppression

    // Ici soft delete:
    await Message.updateMany(
      {
        $or: [
          { room: chatId, recipient: null },
          { recipient: { $in: chat.participants }, room: null }
        ]
      },
      { isDeleted: true, deletedAt: new Date() }
    );

    await PrivateChat.findByIdAndDelete(chatId);

    res.status(200).json({
      success: true,
      message: 'Conversation supprimée'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrCreatePrivateChat,
  getOrCreateSupportChat,
  getPrivateChats,
  getPrivateChatMessages,
  deletePrivateChat
};
