const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// Générer un JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si tous les champs sont remplis
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs' });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // Créer l'utilisateur
    const user = await User.create({ username, email, password });

    // Ajouter automatiquement au salon "Général"
    try {
      const generalRoom = await ChatRoom.findOne({ name: 'Général' });
      if (generalRoom && !generalRoom.members.includes(user._id)) {
        generalRoom.members.push(user._id);
        await generalRoom.save();
      }
    } catch (err) {
      console.log('Erreur lors de l\'ajout au salon général:', err.message);
    }

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Connecter un utilisateur
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si tous les champs sont remplis
    if (!email || !password) {
      return res.status(400).json({ message: 'Veuillez entrer email et mot de passe' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Générer le token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Déconnecter un utilisateur
// @access  Private
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Déconnecté' });
});

// @route   GET /api/auth/me
// @desc    Obtenir le profil de l'utilisateur actuel
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/users
// @desc    Obtenir la liste de tous les utilisateurs (sauf soi-même)
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('_id username email avatar');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
