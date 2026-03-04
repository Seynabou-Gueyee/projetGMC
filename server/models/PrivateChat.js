const mongoose = require('mongoose');

const privateChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour récupérer rapidement une conversation entre deux users
privateChatSchema.index({ participants: 1 });

module.exports = mongoose.model('PrivateChat', privateChatSchema);
