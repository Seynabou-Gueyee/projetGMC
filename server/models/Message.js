const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Veuillez entrer un message'],
    trim: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  room: {
    type: String,
    default: 'general'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Statut "vu/non vu"
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Édition de message
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Suppression de message
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  // Réactions aux messages
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String
  }],
  // Message épinglé
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: {
    type: Date,
    default: null
  },
  // Confirmé d'envoi
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  // Attachements (images, vidéos, audio, fichiers)
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file'],
      required: true
    },
    fileName: String,
    fileSize: Number,
    mimeType: String,
    url: {
      type: String,
      required: true
    },
    duration: Number, // Pour audio et vidéo
    thumbnail: String, // Pour images et vidéos
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Emojis et réactions (extension)
  emojiReactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  // Lien aperçu automatique
  linkPreview: {
    url: String,
    title: String,
    description: String,
    image: String,
    domain: String
  }
});

module.exports = mongoose.model('Message', messageSchema);
