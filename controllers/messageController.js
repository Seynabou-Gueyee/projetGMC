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
      recipient: recipient || null
    });

    // Peupler les informations du sender
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email')
      .populate('recipient', 'username email');

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

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username email avatar')
      .populate('recipient', 'username email')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Message.countDocuments({ room: roomId });

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
      ]
    })
      .populate('sender', 'username email avatar')
      .populate('recipient', 'username email')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Message.countDocuments({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
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

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message supprimé'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getRoomMessages,
  getPrivateMessages,
  deleteMessage
};
