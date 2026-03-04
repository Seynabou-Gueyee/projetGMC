const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// @desc    Récupérer le profil de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('blockedUsers.userId', 'username email avatar');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le profil utilisateur
const updateProfile = async (req, res) => {
  try {
    const { username, bio, statusMessage } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (statusMessage !== undefined) user.statusMessage = statusMessage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Uploader une photo de profil
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'ancienne photo si elle existe
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldFilePath = path.join(__dirname, '../..', user.avatar);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'ancienne photo:', err);
      }
    }

    // Enregistrer le chemin de la nouvelle photo
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Photo de profil mise à jour',
      avatar: avatarPath,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le statut de l'utilisateur
const updateStatus = async (req, res) => {
  try {
    const { status, statusMessage } = req.body;

    if (!status || !['online', 'away', 'busy', 'in_meeting', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const user = await User.findById(req.user.id);
    user.status = status;
    if (statusMessage !== undefined) user.statusMessage = statusMessage;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour',
      user: {
        id: user._id,
        username: user.username,
        status: user.status,
        statusMessage: user.statusMessage,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bloquer un utilisateur
const blockUser = async (req, res) => {
  try {
    const { userIdToBlock } = req.body;
    const currentUserId = req.user.id;

    if (currentUserId === userIdToBlock) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous bloquer vous-même' });
    }

    const user = await User.findById(currentUserId);
    const userToBlock = await User.findById(userIdToBlock);

    if (!userToBlock) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si déjà bloqué
    if (user.isUserBlocked(userIdToBlock)) {
      return res.status(400).json({ message: 'Utilisateur déjà bloqué' });
    }

    user.blockedUsers.push({ userId: userIdToBlock });
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur bloqué',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Débloquer un utilisateur
const unblockUser = async (req, res) => {
  try {
    const { userIdToUnblock } = req.body;
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId);

    if (!user.isUserBlocked(userIdToUnblock)) {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas bloqué' });
    }

    user.blockedUsers = user.blockedUsers.filter(
      blocked => blocked.userId.toString() !== userIdToUnblock
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur débloqué',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer la liste des utilisateurs bloqués
const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('blockedUsers.userId', 'username email avatar status statusMessage isOnline');

    // Transformer blockedUsers pour retourner directement les utilisateurs avec l'ID
    const blockedUsers = user.blockedUsers.map(blocked => ({
      _id: blocked.userId._id,
      username: blocked.userId.username,
      email: blocked.userId.email,
      avatar: blocked.userId.avatar,
      status: blocked.userId.status,
      statusMessage: blocked.userId.statusMessage,
      isOnline: blocked.userId.isOnline,
      blockedAt: blocked.blockedAt
    }));

    res.status(200).json({
      success: true,
      blockedUsers: blockedUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer le profil public d'un utilisateur
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.id);

    const user = await User.findById(userId)
      .select('-password -blockedUsers -email');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est bloqué
    if (currentUser.isUserBlocked(userId)) {
      return res.status(403).json({ message: 'Vous ne pouvez pas voir ce profil' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les informations publiques des utilisateurs connectés
const getConnectedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    const users = await User.find({ isOnline: true })
      .select('-password -blockedUsers')
      .sort({ lastSeen: -1 });

    // Filtrer les utilisateurs bloqués
    const filteredUsers = users.filter(u => !currentUser.isUserBlocked(u._id));

    res.status(200).json({
      success: true,
      count: filteredUsers.length,
      users: filteredUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chercher un utilisateur
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUser = await User.findById(req.user.id);

    if (!query) {
      return res.status(400).json({ message: 'Terme de recherche requis' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('-password -blockedUsers')
      .limit(10);

    // Filtrer les utilisateurs bloqués et l'utilisateur actuel
    const filteredUsers = users.filter(u => 
      u._id.toString() !== currentUser._id.toString() && 
      !currentUser.isUserBlocked(u._id)
    );

    res.status(200).json({
      success: true,
      count: filteredUsers.length,
      users: filteredUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Promouvoir un utilisateur à modérateur (admin only)
const promoteToModerator = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { role: 'moderator' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur promu modérateur',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Retirer le rôle de modérateur (admin only)
const demoteFromModerator = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { role: 'user' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur rétrogradé',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateStatus,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getPublicProfile,
  getConnectedUsers,
  searchUsers,
  promoteToModerator,
  demoteFromModerator
};
