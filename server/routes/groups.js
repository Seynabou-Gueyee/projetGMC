const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMembersToGroup,
  removeMembersFromGroup,
  leaveGroup,
  updateGroup
} = require('../controllers/groupController');

// @route   POST /api/groups
// @desc    Créer un groupe
// @access  Private
router.post('/', protect, createGroup);

// @route   GET /api/groups
// @desc    Récupérer les groupes de l'utilisateur
// @access  Private
router.get('/', protect, getUserGroups);

// @route   GET /api/groups/:groupId
// @desc    Récupérer les détails d'un groupe
// @access  Private
router.get('/:groupId', protect, getGroupDetails);

// @route   PUT /api/groups/:groupId
// @desc    Mettre à jour un groupe
// @access  Private
router.put('/:groupId', protect, updateGroup);

// @route   POST /api/groups/:groupId/members
// @desc    Ajouter des membres au groupe
// @access  Private
router.post('/:groupId/members', protect, addMembersToGroup);

// @route   DELETE /api/groups/:groupId/members
// @desc    Retirer des membres du groupe
// @access  Private
router.delete('/:groupId/members', protect, removeMembersFromGroup);

// @route   POST /api/groups/:groupId/leave
// @desc    Quitter un groupe
// @access  Private
router.post('/:groupId/leave', protect, leaveGroup);

module.exports = router;
