const Notification = require('../models/Notification');
const MuteSetting = require('../models/MuteSetting');

// NOTIFICATIONS

// @desc    Récupérer les notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false } = req.query;

    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username avatar')
      .populate('message')
      .populate('group', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marquer une notification comme lue
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification || notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marquer toutes les notifications comme lues
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Toutes notifications marquées comme lues'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification || notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MUTE SETTINGS

// @desc    Rendre muet une conversation/groupe/room
const muteConversation = async (req, res) => {
  try {
    const { conversationType, conversationId, mutedUntil } = req.body;
    const userId = req.user.id;

    const query = { user: userId };
    const updateData = { isMuted: true };

    if (conversationType === 'private') {
      query.privateChat = conversationId;
    } else if (conversationType === 'group') {
      query.group = conversationId;
    } else if (conversationType === 'room') {
      query.chatRoom = conversationId;
    }

    if (mutedUntil) {
      updateData.mutedUntil = new Date(mutedUntil);
    }

    let muteSetting = await MuteSetting.findOne(query);
    if (muteSetting) {
      muteSetting.isMuted = true;
      muteSetting.mutedUntil = updateData.mutedUntil || null;
      await muteSetting.save();
    } else {
      muteSetting = await MuteSetting.create({
        user: userId,
        ...query,
        ...updateData
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation rendue muette',
      muteSetting
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activer le son d'une conversation
const unmuteConversation = async (req, res) => {
  try {
    const { conversationType, conversationId } = req.body;
    const userId = req.user.id;

    const query = { user: userId };

    if (conversationType === 'private') {
      query.privateChat = conversationId;
    } else if (conversationType === 'group') {
      query.group = conversationId;
    } else if (conversationType === 'room') {
      query.chatRoom = conversationId;
    }

    const muteSetting = await MuteSetting.findOne(query);
    if (muteSetting) {
      muteSetting.isMuted = false;
      muteSetting.mutedUntil = null;
      await muteSetting.save();
    }

    res.status(200).json({
      success: true,
      message: 'Son activé',
      muteSetting
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les paramètres de sourdine
const getMuteSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const muteSettings = await MuteSetting.find({
      user: userId,
      isMuted: true
    })
      .populate('privateChat', 'participants')
      .populate('group', 'name')
      .populate('chatRoom');

    res.status(200).json({
      success: true,
      muteSettings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Vérifier si une conversation est en sourdine
const checkIfMuted = async (req, res) => {
  try {
    const { conversationType, conversationId } = req.query;
    const userId = req.user.id;

    const query = { user: userId, isMuted: true };

    if (conversationType === 'private') {
      query.privateChat = conversationId;
    } else if (conversationType === 'group') {
      query.group = conversationId;
    } else if (conversationType === 'room') {
      query.chatRoom = conversationId;
    }

    const muteSetting = await MuteSetting.findOne(query);

    res.status(200).json({
      success: true,
      isMuted: !!muteSetting,
      mutedUntil: muteSetting?.mutedUntil || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  muteConversation,
  unmuteConversation,
  getMuteSettings,
  checkIfMuted
};
