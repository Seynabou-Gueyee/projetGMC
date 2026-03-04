const mongoose = require('mongoose');

const muteSettingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Mute pour une conversation privée
  privateChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrivateChat',
    default: null
  },
  // Mute pour un groupe
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  // Mute pour un salon public
  chatRoom: {
    type: String,
    default: null
  },
  isMuted: {
    type: Boolean,
    default: true
  },
  mutedUntil: {
    type: Date,
    default: null // null = indefinitely muted
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

muteSettingSchema.index({ user: 1, isMuted: 1 });

module.exports = mongoose.model('MuteSetting', muteSettingSchema);
