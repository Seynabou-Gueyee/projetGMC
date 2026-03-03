const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ChatRoom = require('../models/ChatRoom');

// @route   POST /api/chat-rooms
// @desc    Créer un nouveau salon de discussion
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom du salon est requis' });
    }

    // Vérifier si le salon existe déjà
    const roomExists = await ChatRoom.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ message: 'Ce salon existe déjà' });
    }

    // Créer le nouveau salon
    const newRoom = await ChatRoom.create({
      name,
      description: description || '',
      createdBy: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json({
      success: true,
      message: 'Salon créé avec succès',
      room: newRoom
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/chat-rooms
// @desc    Récupérer tous les salons de discussion
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ isPublic: true })
      .populate('createdBy', 'username')
      .select('-members');

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/chat-rooms/:roomId
// @desc    Récupérer les détails d'un salon spécifique
// @access  Private
router.get('/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await ChatRoom.findById(roomId)
      .populate('createdBy', 'username')
      .populate('members', 'username email');

    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/chat-rooms/:roomId/join
// @desc    Rejoindre un salon de discussion
// @access  Private
router.post('/:roomId/join', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    // Vérifier si l'utilisateur est déjà membre
    if (room.members.includes(userId)) {
      return res.status(400).json({ message: 'Vous êtes déjà membre de ce salon' });
    }

    // Ajouter l'utilisateur au salon
    room.members.push(userId);
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Vous avez rejoint le salon',
      room
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/chat-rooms/:roomId/leave
// @desc    Quitter un salon de discussion
// @access  Private
router.post('/:roomId/leave', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    // Vérifier si l'utilisateur est membre
    if (!room.members.includes(userId)) {
      return res.status(400).json({ message: 'Vous n\'êtes pas membre de ce salon' });
    }

    // Retirer l'utilisateur du salon
    room.members = room.members.filter(memberId => memberId.toString() !== userId);
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Vous avez quitté le salon',
      room
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/chat-rooms/:roomId
// @desc    Supprimer un salon de discussion
// @access  Private
router.delete('/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    // Vérifier que l'utilisateur est le créateur
    if (room.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Seul le créateur peut supprimer ce salon' });
    }

    // Supprimer le salon
    await ChatRoom.findByIdAndDelete(roomId);

    res.status(200).json({
      success: true,
      message: 'Salon supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
