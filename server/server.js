const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { protect } = require('./middleware/auth');

// Import security utilities
const logger = require('./utils/logger');
const RateLimiter = require('./utils/rateLimiter');
const { validateMessage, updateUserStats, addUserWarning, isUserBlocked } = require('./utils/messageValidator');
const MessageEncryption = require('./utils/encryption');
const InactivityManager = require('./utils/inactivityManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize security utilities
const rateLimiter = new RateLimiter(5, 1000); // 5 messages per second
const inactivityManager = new InactivityManager(1800000); // 30 minutes
let messageEncryption;

// Try to initialize encryption with environment variable or default
try {
  messageEncryption = new MessageEncryption(process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production');
  logger.info('Message encryption initialized');
} catch (error) {
  logger.warn('Encryption initialization warning', { error: error.message });
}

// Track user message history for validation
const userMessageHistory = new Map();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés comme fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware de gestion d'erreurs - DOIT être avant les routes
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err.message);
  const status = err.status || 500;
  const message = err.message || 'Erreur serveur';
  res.status(status).json({ message, error: err.message });
};

// MongoDB Connection avec options appropriées
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/talkme';
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('✓ MongoDB connecté');
    
    // Initialiser les utilisateurs et salons par défaut
    const User = require('./models/User');
    const ChatRoom = require('./models/ChatRoom');
    
    try {
      // Créer l'utilisateur Admin par défaut
      let adminUser = await User.findOne({ email: 'admin@talkme.com' });
      if (!adminUser) {
        adminUser = await User.create({
          username: 'Admin',
          email: 'admin@talkme.com',
          password: 'Admin@123456'
        });
        console.log('✓ Utilisateur Admin créé');
      }

      // Créer le contact Support par défaut
      let supportUser = await User.findOne({ username: 'Support' });
      if (!supportUser) {
        supportUser = await User.create({
          username: 'Support',
          email: 'support@talkme.com',
          password: 'support_default_password_change_me',
          status: 'online',
          statusMessage: '👋 Bienvenue! Comment puis-je t\'aider?',
          role: 'admin',
          avatar: '🤖',
          bio: 'Support TalkMe - Disponible 24/7'
        });
        console.log('✓ 📞 Contact Support créé');
      } else {
        console.log('✓ 📞 Contact Support trouvé');
      }
      
      // Créer le salon "Général" par défaut
      let generalRoom = await ChatRoom.findOne({ name: 'Général' });
      if (!generalRoom) {
        generalRoom = await ChatRoom.create({
          name: 'Général',
          description: 'Bienvenue dans le salon général! Posez vos questions ici.',
          createdBy: adminUser._id,
          members: [adminUser._id],
          isPublic: true
        });
        console.log('✓ Salon "Général" créé');
      }
    } catch (error) {
      console.log('Info: Initialisation par défaut:', error.message);
    }
  })
  .catch(err => {
    console.error('✗ Erreur MongoDB:', err.message);
    console.log('Assurez-vous que MongoDB est en fonctionnement ou utilisez MongoDB Atlas');
  });

// Socket.IO Events
const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token manquant'));
  }
  
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Token invalide'));
  }
};

// Pour stocker les utilisateurs connectés
const User = require('./models/User');
const Message = require('./models/Message');
const connectedUsers = new Map();

io.use(socketAuthMiddleware);

io.on('connection', async (socket) => {
  logger.info(`Utilisateur connecté: ${socket.userId}`, { socketId: socket.id });
  
  // Stocker les infos de l'utilisateur
  const user = await User.findById(socket.userId);
  if (user) {
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      username: user.username,
      userId: socket.userId
    });

    // Initialize inactivity timeout (30 minutes)
    inactivityManager.createSession(socket.userId, socket.id, {
      username: user.username,
      socketId: socket.id
    });

    // Mettre à jour le statut en ligne
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Log user action
    logger.userAction(socket.userId, 'CONNECT', { socketId: socket.id });

    // Notifier tous les clients que cet utilisateur est en ligne
    io.emit('user_came_online', {
      userId: socket.userId,
      username: user.username,
      isOnline: true
    });
  }

  // Rejoindre un salon
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.userId} a rejoint ${roomId}`);
    
    io.to(roomId).emit('user_joined', { 
      userId: socket.userId, 
      room: roomId,
      username: user ? user.username : 'Utilisateur'
    });
  });

  // Événement: utilisateur en train d'écrire
  socket.on('user_typing', (data) => {
    io.to(data.room || data.recipientId).emit('user_typing', {
      userId: socket.userId,
      username: user ? user.username : 'Utilisateur',
      room: data.room,
      recipientId: data.recipientId
    });
  });

  // Événement: utilisateur a arrêté d'écrire
  socket.on('user_stopped_typing', (data) => {
    io.to(data.room || data.recipientId).emit('user_stopped_typing', {
      userId: socket.userId,
      room: data.room,
      recipientId: data.recipientId
    });
  });

  // Envoyer un message
  socket.on('send_message', async (data) => {
    try {
      // 1. Check if user is blocked
      if (isUserBlocked(socket.userId, userMessageHistory)) {
        logger.security(socket.userId, 'SEND_MESSAGE_BLOCKED', { reason: 'USER_BLOCKED' });
        socket.emit('error', { 
          message: 'Votre compte a été bloqué en raison de violations répétées',
          code: 'USER_BLOCKED'
        });
        return;
      }

      // 2. Check rate limit
      const rateLimitCheck = rateLimiter.checkLimit(socket.userId, 1);
      if (!rateLimitCheck.allowed) {
        logger.warn(`Rate limit exceeded for user ${socket.userId}`, rateLimitCheck);
        logger.security(socket.userId, 'RATE_LIMIT_EXCEEDED', rateLimitCheck);
        
        if (rateLimitCheck.blocked) {
          addUserWarning(socket.userId, userMessageHistory);
        }
        
        socket.emit('error', { 
          message: `Vous envoyez trop de messages. Attendez ${Math.ceil(rateLimitCheck.resetInMs / 1000)} secondes`,
          code: 'RATE_LIMIT_EXCEEDED',
          resetInMs: rateLimitCheck.resetInMs
        });
        return;
      }

      // 3. Validate message content
      const userStats = userMessageHistory.get(socket.userId) || {};
      const validation = validateMessage(data.content, userStats);

      if (!validation.isValid) {
        logger.security(socket.userId, 'MESSAGE_VALIDATION_FAILED', { errors: validation.errors });
        
        // Add warning if contains blocked words
        if (validation.errors.includes('CONTAINS_BLOCKED_WORDS')) {
          addUserWarning(socket.userId, userMessageHistory);
        }
        
        socket.emit('error', { 
          message: 'Le message ne respecte pas les règles de modération',
          code: 'VALIDATION_FAILED',
          errors: validation.errors
        });
        return;
      }

      // 4. Update user message stats
      updateUserStats(socket.userId, validation.sanitized, userMessageHistory);
      
      // 5. Record activity for inactivity timeout
      inactivityManager.recordActivity(socket.userId);

      // 6. Sauvegarder le message dans la base de données
      const newMessage = await Message.create({
        content: validation.sanitized,
        sender: socket.userId,
        senderName: user ? user.username : 'Utilisateur',
        room: data.room,
        recipient: data.recipient || null,
        attachments: data.attachments || [],
        linkPreview: data.linkPreview || null,
        isDelivered: true,
        deliveredAt: new Date()
      });

      // Récupérer le message avec les informations du sender
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username email')
        .populate('recipient', 'username email')
        .populate('readBy.userId', 'username')
        .populate('reactions.userId', 'username');

      // Log message event
      logger.messageEvent('SEND', {
        _id: newMessage._id,
        sender: socket.userId,
        room: data.room,
        content: validation.sanitized
      });

      // Envoyer le message à tous les utilisateurs du salon
      const messageData = {
        _id: populatedMessage._id,
        userId: socket.userId,
        senderName: user ? user.username : 'Utilisateur',
        content: validation.sanitized,
        room: data.room,
        timestamp: populatedMessage.createdAt,
        createdAt: populatedMessage.createdAt,
        sender: populatedMessage.sender,
        attachments: populatedMessage.attachments || [],
        linkPreview: populatedMessage.linkPreview || null,
        emojiReactions: populatedMessage.emojiReactions || [],
        isDelivered: true,
        deliveredAt: populatedMessage.deliveredAt,
        readBy: populatedMessage.readBy,
        reactions: populatedMessage.reactions,
        isEdited: false,
        isPinned: false
      };

      io.to(data.room).emit('receive_message', messageData);

      // Envoyer une confirmation de livraison à l'expéditeur
      socket.emit('message_delivered', {
        _id: populatedMessage._id,
        isDelivered: true,
        deliveredAt: populatedMessage.deliveredAt
      });

      logger.info(`Message envoyé dans ${data.room} par ${socket.userId}`, { 
        messageId: newMessage._id,
        contentLength: validation.sanitized.length
      });
    } catch (error) {
      logger.error(`Erreur lors de l'envoi du message par ${socket.userId}`, { 
        error: error.message,
        stack: error.stack
      });
      socket.emit('error', { message: 'Erreur lors de l\'envoi du message', error: error.message });
    }
  });

  // Événement: Modifier un message
  socket.on('edit_message', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }

      if (message.sender.toString() !== socket.userId) {
        socket.emit('error', { message: 'Non autorisé à modifier ce message' });
        return;
      }

      message.editHistory.push({
        content: message.content,
        editedAt: new Date()
      });
      message.content = data.content;
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      const populatedMessage = await Message.findById(data.messageId)
        .populate('sender', 'username email')
        .populate('reactions.userId', 'username')
        .populate('readBy.userId', 'username');

      io.to(data.room).emit('message_edited', {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        isEdited: true,
        editedAt: populatedMessage.editedAt,
        room: data.room
      });
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de la modification du message', error: error.message });
    }
  });

  // Événement: Supprimer un message
  socket.on('delete_message', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }

      if (message.sender.toString() !== socket.userId) {
        socket.emit('error', { message: 'Non autorisé à supprimer ce message' });
        return;
      }

      message.isDeleted = true;
      message.deletedAt = new Date();
      await message.save();

      io.to(data.room).emit('message_deleted', {
        _id: data.messageId,
        room: data.room
      });
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de la suppression du message', error: error.message });
    }
  });

  // Événement: Ajouter une réaction
  socket.on('add_reaction', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }

      const existingReaction = message.reactions.find(
        r => r.userId.toString() === socket.userId && r.emoji === data.emoji
      );

      if (!existingReaction) {
        message.reactions.push({ userId: socket.userId, emoji: data.emoji });
        await message.save();
      }

      const populatedMessage = await Message.findById(data.messageId)
        .populate('reactions.userId', 'username');

      io.to(data.room).emit('reaction_added', {
        _id: data.messageId,
        reactions: populatedMessage.reactions,
        room: data.room
      });
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de l\'ajout de la réaction', error: error.message });
    }
  });

  // Événement: Retirer une réaction
  socket.on('remove_reaction', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }

      message.reactions = message.reactions.filter(
        r => !(r.userId.toString() === socket.userId && r.emoji === data.emoji)
      );
      await message.save();

      const populatedMessage = await Message.findById(data.messageId)
        .populate('reactions.userId', 'username');

      io.to(data.room).emit('reaction_removed', {
        _id: data.messageId,
        reactions: populatedMessage.reactions,
        room: data.room
      });
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de la suppression de la réaction', error: error.message });
    }
  });

  // Événement: Ajouter une réaction emoji
  socket.on('react_to_message', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }

      // Vérifier si la réaction existe déjà
      const existingReaction = message.emojiReactions.find(r => r.emoji === data.emoji);
      
      if (existingReaction) {
        // Ajouter l'utilisateur à la liste s'il n'est pas déjà dedans
        if (!existingReaction.users.includes(socket.userId)) {
          existingReaction.users.push(socket.userId);
        }
      } else {
        // Créer une nouvelle réaction
        message.emojiReactions.push({
          emoji: data.emoji,
          users: [socket.userId]
        });
      }
      
      await message.save();

      const populatedMessage = await Message.findById(data.messageId);

      io.to(data.room).emit('emoji_reaction_added', {
        _id: data.messageId,
        emojiReactions: populatedMessage.emojiReactions,
        room: data.room
      });
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de l\'ajout de la réaction emoji', error: error.message });
    }
  });

  // Événement: Retirer une réaction emoji
  socket.on('remove_emoji_reaction', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }

      // Trouver la réaction et retirer l'utilisateur
      const reactionIndex = message.emojiReactions.findIndex(r => r.emoji === data.emoji);
      
      if (reactionIndex !== -1) {
        const reaction = message.emojiReactions[reactionIndex];
        reaction.users = reaction.users.filter(userId => userId !== socket.userId);
        
        // Si personne n'a réagi, supprimer la réaction
        if (reaction.users.length === 0) {
          message.emojiReactions.splice(reactionIndex, 1);
        }
      }
      
      await message.save();

      const populatedMessage = await Message.findById(data.messageId);

      io.to(data.room).emit('emoji_reaction_removed', {
        _id: data.messageId,
        emojiReactions: populatedMessage.emojiReactions,
        room: data.room
      });
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de la suppression de la réaction emoji', error: error.message });
    }
  });

  // Événement: Marquer comme lu
  socket.on('mark_as_read', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) return;

      const alreadyRead = message.readBy.some(r => r.userId.toString() === socket.userId);
      if (!alreadyRead) {
        message.readBy.push({ userId: socket.userId, readAt: new Date() });
        await message.save();
      }

      const populatedMessage = await Message.findById(data.messageId)
        .populate('readBy.userId', 'username');

      io.to(data.room).emit('message_read', {
        _id: data.messageId,
        readBy: populatedMessage.readBy,
        room: data.room
      });
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  });

  // Événement: Épingler un message
  socket.on('pin_message', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }

      if (message.sender.toString() !== socket.userId) {
        socket.emit('error', { message: 'Non autorisé à épingler ce message' });
        return;
      }

      message.isPinned = true;
      message.pinnedAt = new Date();
      await message.save();

      io.to(data.room).emit('message_pinned', {
        _id: data.messageId,
        isPinned: true,
        pinnedAt: message.pinnedAt,
        room: data.room
      });
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de l\'épinglage du message', error: error.message });
    }
  });

  // Événement: Dépingler un message
  socket.on('unpin_message', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }

      if (message.sender.toString() !== socket.userId) {
        socket.emit('error', { message: 'Non autorisé à dépingler ce message' });
        return;
      }

      message.isPinned = false;
      message.pinnedAt = null;
      await message.save();

      io.to(data.room).emit('message_unpinned', {
        _id: data.messageId,
        isPinned: false,
        room: data.room
      });
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors du dépinglage du message', error: error.message });
    }
  });

  // Quitter un salon
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`${socket.userId} a quitté ${roomId}`);
    io.to(roomId).emit('user_left', { 
      userId: socket.userId, 
      room: roomId 
    });
  });

  // ============== ÉVÉNEMENTS GROUPES ==============
  
  // Envoyer un message de groupe
  socket.on('send_group_message', async (data) => {
    try {
      const Group = require('./models/Group');
      const group = await Group.findById(data.room);
      
      if (!group) {
        socket.emit('error', { message: 'Groupe non trouvé' });
        return;
      }

      const newMessage = await Message.create({
        content: data.content,
        sender: socket.userId,
        room: data.room,
        isDelivered: true,
        deliveredAt: new Date()
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username avatar');

      // Mettre à jour le dernier message du groupe
      group.lastMessage = newMessage._id;
      group.lastMessageAt = new Date();
      await group.save();

      io.to(data.room).emit('group_message', {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        sender: populatedMessage.sender,
        group: data.room,
        createdAt: populatedMessage.createdAt,
        isDelivered: true
      });

      console.log(`Message de groupe envoyé dans ${data.room}`);
    } catch (error) {
      socket.emit('error', { message: 'Erreur:', error: error.message });
    }
  });

  // Événements de frappe dans un groupe
  socket.on('typing_group', (data) => {
    io.to(data.groupId).emit('user_typing_group', {
      groupId: data.groupId,
      userId: socket.userId,
      userName: data.userName
    });
  });

  socket.on('stopped_typing_group', (data) => {
    io.to(data.groupId).emit('user_stopped_typing_group', {
      groupId: data.groupId,
      userId: socket.userId,
      userName: data.userName
    });
  });

  // Rejoindre un groupe
  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`${socket.userId} a rejoint le groupe ${groupId}`);
    io.to(groupId).emit('user_joined_group', {
      userId: socket.userId,
      groupId: groupId,
      username: user ? user.username : 'Utilisateur'
    });
  });

  // Quitter un groupe
  socket.on('leave_group', (groupId) => {
    socket.leave(groupId);
    console.log(`${socket.userId} a quitté le groupe ${groupId}`);
    io.to(groupId).emit('user_left_group', {
      userId: socket.userId,
      groupId: groupId
    });
  });

  // ============== ÉVÉNEMENTS MESSAGES PRIVÉS ==============

  // Envoyer un message privé
  socket.on('send_private_message', async (data) => {
    try {
      const PrivateChat = require('./models/PrivateChat');
      
      const newMessage = await Message.create({
        content: data.content,
        sender: socket.userId,
        recipient: data.recipientId,
        isDelivered: true,
        deliveredAt: new Date()
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username avatar')
        .populate('recipient', 'username avatar');

      // Mettre à jour ou créer la conversation privée
      let chat = await PrivateChat.findOne({
        participants: { $all: [socket.userId, data.recipientId] }
      });

      if (!chat) {
        chat = await PrivateChat.create({
          participants: [socket.userId, data.recipientId]
        });
      }

      chat.lastMessage = newMessage._id;
      chat.lastMessageAt = new Date();
      await chat.save();

      // Envoyer à l'expéditeur et au destinataire
      const recipientSocketData = connectedUsers.get(data.recipientId);
      if (recipientSocketData) {
        io.to(recipientSocketData.socketId).emit('private_message', {
          _id: populatedMessage._id,
          content: populatedMessage.content,
          sender: populatedMessage.sender,
          recipient: populatedMessage.recipient,
          createdAt: populatedMessage.createdAt,
          isDelivered: true
        });
      }

      socket.emit('private_message_sent', {
        _id: populatedMessage._id,
        isDelivered: true
      });

      console.log(`Message privé envoyé de ${socket.userId} à ${data.recipientId}`);
    } catch (error) {
      socket.emit('error', { message: 'Erreur:', error: error.message });
    }
  });

  // Événements de frappe dans un chat privé
  socket.on('typing', (data) => {
    const recipientSocket = connectedUsers.get(data.recipientId);
    if (recipientSocket) {
      io.to(recipientSocket.socketId).emit('user_typing', {
        userId: socket.userId,
        username: user ? user.username : 'Utilisateur'
      });
    }
  });

  socket.on('stopped_typing', (data) => {
    const recipientSocket = connectedUsers.get(data.recipientId);
    if (recipientSocket) {
      io.to(recipientSocket.socketId).emit('user_stopped_typing', {
        userId: socket.userId
      });
    }
  });

  // ============== ÉVÉNEMENTS NOTIFICATIONS ==============

  // Envoyer une notification
  socket.on('send_notification', async (data) => {
    try {
      const Notification = require('./models/Notification');
      
      const notification = await Notification.create({
        recipient: data.recipientId,
        sender: socket.userId,
        type: data.type || 'message',
        message: data.messageId || null,
        group: data.groupId || null,
        title: data.title,
        content: data.content
      });

      const recipientSocket = connectedUsers.get(data.recipientId);
      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit('new_notification', notification);
      }
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  });

  socket.on('disconnect', async () => {
    logger.info(`Utilisateur déconnecté: ${socket.userId}`, { socketId: socket.id });
    
    // End inactivity session
    inactivityManager.endSession(socket.userId);
    
    // Mettre à jour le statut hors ligne
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();

      // Log user action
      logger.userAction(socket.userId, 'DISCONNECT', { 
        socketId: socket.id,
        sessionDuration: Date.now() - (inactivityManager.getSession(socket.userId)?.createdAt || Date.now())
      });

      // Notifier tous les clients que cet utilisateur est hors ligne
      io.emit('user_went_offline', {
        userId: socket.userId,
        username: user.username,
        isOnline: false,
        lastSeen: user.lastSeen
      });
    }

    // Supprimer de la liste des utilisateurs connectés
    connectedUsers.delete(socket.userId);
  });
});

// Importer les routes
const authRoutes = require('./routes/auth');
const chatRoomsRoutes = require('./routes/chatRooms');
const messagesRoutes = require('./routes/messages');
const usersRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const privateChatsRoutes = require('./routes/privateChats');
const notificationsRoutes = require('./routes/notifications');
const uploadsRoutes = require('./routes/uploads');
const featuresRoutes = require('./routes/features');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat-rooms', chatRoomsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/private-chats', privateChatsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api', featuresRoutes);

// Endpoint pour extraire les métadonnées d'un lien
app.get('/api/link-preview', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ message: 'URL requise' });
    }

    // Validation d'URL simple
    let validatedUrl;
    try {
      validatedUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ message: 'URL invalide' });
    }

    // Récupérer le contenu HTML
    const axios = require('axios');
    const response = await axios.get(url, {
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    
    // Extraire les métadonnées Open Graph
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const ogDescriptionMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    
    // Fallback sur les métadonnées standard
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);

    const preview = {
      url: url,
      title: ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : validatedUrl.hostname),
      description: ogDescriptionMatch ? ogDescriptionMatch[1] : (descriptionMatch ? descriptionMatch[1] : ''),
      image: ogImageMatch ? ogImageMatch[1] : null,
      domain: validatedUrl.hostname
    };

    res.status(200).json(preview);
  } catch (error) {
    console.error('Erreur lors de la récupération du lien:', error.message);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du lien',
      error: error.message 
    });
  }
});

// Route protégée pour tester le middleware
app.get('/api/protected', protect, (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Route protégée accessible',
    userId: req.user.id 
  });
});

// ======== ADMIN SECURITY & LOGGING ENDPOINTS ========

// Get security logs (admin only)
app.get('/api/admin/logs/security', protect, async (req, res) => {
  try {
    // TODO: Add admin role check
    const limit = req.query.limit || 100;
    const logs = logger.readLogFile('security', parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: logs.length,
      logs: logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get moderation logs (admin only)
app.get('/api/admin/logs/moderation', protect, async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const logs = logger.readLogFile('moderation', parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: logs.length,
      logs: logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get error logs (admin only)
app.get('/api/admin/logs/errors', protect, async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const logs = logger.readLogFile('errors', parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: logs.length,
      logs: logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rate limiter stats (admin only)
app.get('/api/admin/security/rate-limit-stats', protect, async (req, res) => {
  try {
    const userId = req.query.userId;
    
    let stats;
    if (userId) {
      stats = rateLimiter.getUserStats(userId);
    } else {
      stats = {
        message: 'Provide userId query parameter to get specific user stats'
      };
    }
    
    res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inactivity manager stats (admin only)
app.get('/api/admin/security/inactivity-stats', protect, async (req, res) => {
  try {
    const stats = inactivityManager.getStats();
    
    res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block/unblock user (admin only)
app.post('/api/admin/security/block-user', protect, async (req, res) => {
  try {
    const { userId, block, durationMs } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId requis' });
    }
    
    if (block) {
      rateLimiter.blockUser(userId, durationMs || 3600000); // 1 hour default
      logger.moderation('BLOCK_USER', {
        moderator: req.user.id,
        targetUserId: userId,
        durationMs: durationMs || 3600000
      });
      
      res.status(200).json({
        success: true,
        message: `User ${userId} blocked`
      });
    } else {
      rateLimiter.unblockUser(userId);
      logger.moderation('UNBLOCK_USER', {
        moderator: req.user.id,
        targetUserId: userId
      });
      
      res.status(200).json({
        success: true,
        message: `User ${userId} unblocked`
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all active sessions (admin only)
app.get('/api/admin/security/active-sessions', protect, async (req, res) => {
  try {
    const sessions = inactivityManager.getAllSessions();
    const formattedSessions = Array.from(sessions.entries()).map(([userId, session]) => ({
      userId: userId,
      socketId: session.socketId,
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt,
      inactiveFor: Date.now() - session.lastActivityAt
    }));
    
    res.status(200).json({
      success: true,
      totalActiveSessions: formattedSessions.length,
      sessions: formattedSessions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear logs (admin only)
app.post('/api/admin/logs/clear', protect, async (req, res) => {
  try {
    const { logType } = req.body;
    
    if (!logType) {
      return res.status(400).json({ message: 'logType requis (general, errors, security, moderation, performance)' });
    }
    
    logger.clearLog(logType);
    logger.moderation('CLEAR_LOGS', {
      moderator: req.user.id,
      logType: logType
    });
    
    res.status(200).json({
      success: true,
      message: `Log ${logType} cleared`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get log file sizes (admin only)
app.get('/api/admin/logs/sizes', protect, async (req, res) => {
  try {
    const sizes = logger.getAllLogSizes();
    
    res.status(200).json({
      success: true,
      sizes: sizes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route de base
app.get('/', (req, res) => {
  res.send('Serveur TalkMe est en ligne');
});

// Middleware de gestion d'erreurs global
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Serveur TalkMe démarré`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Backend: http://localhost:${PORT}`);
  console.log(`⚠️  IMPORTANT: Avez-vous configuré MongoDB Atlas?\n`);
});

module.exports = { app, io };

