const Group = require('../models/Group');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Créer un groupe
const createGroup = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;

    const group = await Group.create({
      name,
      description,
      isPublic,
      createdBy: userId,
      members: {
        userId,
        role: 'admin',
        joinedAt: new Date()
      }
    });

    await group.populate('members.userId', 'username avatar');
    await group.populate('createdBy', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Groupe créé',
      group
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les groupes de l'utilisateur
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      'members.userId': userId
    })
      .populate('members.userId', 'username avatar status')
      .populate('createdBy', 'username avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      groups
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les détails d'un groupe
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId)
      .populate('members.userId', 'username avatar status statusMessage')
      .populate('createdBy', 'username avatar')
      .populate('lastMessage');

    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé' });
    }

    // Vérifier que l'utilisateur est membre
    const isMember = group.members.some(m => m.userId._id.toString() === userId);
    if (!group.isPublic && !isMember) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ajouter un membre au groupe
const addMembersToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé' });
    }

    // Vérifier que l'utilisateur est admin
    const userRole = group.members.find(m => m.userId.toString() === userId)?.role;
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Ajouter les membres
    for (const memberId of memberIds) {
      const alreadyMember = group.members.some(m => m.userId.toString() === memberId);
      if (!alreadyMember) {
        group.members.push({
          userId: memberId,
          role: 'member'
        });

        // Créer une notification
        await Notification.create({
          recipient: memberId,
          sender: userId,
          type: 'group_invite',
          group: groupId,
          title: `Invité dans "${group.name}"`,
          content: `Vous avez été ajouté au groupe ${group.name}`
        });
      }
    }

    await group.save();
    await group.populate('members.userId', 'username avatar status');

    res.status(200).json({
      success: true,
      message: 'Membres ajoutés',
      group
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Retirer un membre du groupe
const removeMembersFromGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé' });
    }

    // Vérifier que l'utilisateur est admin
    const userRole = group.members.find(m => m.userId.toString() === userId)?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Retirer les membres
    group.members = group.members.filter(
      m => !memberIds.includes(m.userId.toString())
    );

    await group.save();
    await group.populate('members.userId', 'username avatar status');

    res.status(200).json({
      success: true,
      message: 'Membres retirés',
      group
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Quitter un groupe
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé' });
    }

    group.members = group.members.filter(m => m.userId.toString() !== userId);

    // Si l'admin quitte et il n'y a plus de membres, supprimer le groupe
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({
        success: true,
        message: 'Groupe supprimé (aucun membre restant)'
      });
    }

    // Si l'admin quitte, promouvoir le premier membre en admin
    const wasAdmin = group.createdBy.toString() === userId;
    if (wasAdmin) {
      group.members[0].role = 'admin';
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Groupe quitté'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le groupe
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé' });
    }

    // Vérifier que l'utilisateur est admin
    const userRole = group.members.find(m => m.userId.toString() === userId)?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatar) group.avatar = avatar;
    group.updatedAt = new Date();

    await group.save();
    await group.populate('members.userId', 'username avatar');

    res.status(200).json({
      success: true,
      message: 'Groupe mis à jour',
      group
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMembersToGroup,
  removeMembersFromGroup,
  leaveGroup,
  updateGroup
};
