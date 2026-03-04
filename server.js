const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { protect } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/talkme';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB:', err));

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
  console.log('Utilisateur connecté:', socket.userId, socket.id);
  
  // Stocker les infos de l'utilisateur
  const user = await User.findById(socket.userId);
  if (user) {
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      username: user.username,
      userId: socket.userId
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

  // Envoyer un message
  socket.on('send_message', async (data) => {
    try {
      // Sauvegarder le message dans la base de données
      const newMessage = await Message.create({
        content: data.content,
        sender: socket.userId,
        senderName: user ? user.username : 'Utilisateur',
        room: data.room,
        recipient: data.recipient || null
      });

      // Récupérer le message avec les informations du sender
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username email')
        .populate('recipient', 'username email');

      // Envoyer le message à tous les utilisateurs du salon
      io.to(data.room).emit('receive_message', {
        _id: populatedMessage._id,
        userId: socket.userId,
        senderName: user ? user.username : 'Utilisateur',
        content: data.content,
        room: data.room,
        timestamp: new Date(),
        sender: populatedMessage.sender
      });

      console.log(`Message envoyé dans ${data.room} par ${socket.userId}`);
    } catch (error) {
      socket.emit('error', { message: 'Erreur lors de l\'envoi du message', error: error.message });
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

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.userId);
    connectedUsers.delete(socket.userId);
  });
});

// --- ROUTES API ---
// Importer les routes
const authRoutes = require('./routes/auth');
const chatRoomsRoutes = require('./routes/chatRooms');
const messagesRoutes = require('./routes/messages');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat-rooms', chatRoomsRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/api/protected', protect, (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Route protégée accessible',
    userId: req.user.id 
  });
});

// --- CONFIGURATION FRONTEND (POUR LE DÉPLOIEMENT) ---
const path = require('path');

// 1. On sert les fichiers statiques du dossier 'dist' (ou 'build')
app.use(express.static(path.join(__dirname, '../client/dist')));

// 2. Pour toutes les autres routes (/, /auth, /chat), on renvoie l'index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// --- DÉMARRAGE ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur écoute sur le port ${PORT}`);
});

module.exports = { app, io };

