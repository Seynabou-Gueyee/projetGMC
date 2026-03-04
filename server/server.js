const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { protect } = require('./middleware/auth');

// =======================
// INITIALISATION
// =======================
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // IMPORTANT POUR RENDER
    methods: ["GET", "POST"]
  }
});

// =======================
// MIDDLEWARES
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// =======================
// MONGODB
// =======================
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/talkme';

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// =======================
// SOCKET.IO AUTH
// =======================
const User = require('./models/User');
const Message = require('./models/Message');
const connectedUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Token manquant'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Token invalide'));
  }
});

// =======================
// SOCKET.IO EVENTS
// =======================
io.on('connection', async (socket) => {
  console.log('🔌 Utilisateur connecté:', socket.userId);

  const user = await User.findById(socket.userId);
  if (user) {
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      username: user.username
    });
  }

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit('user_joined', {
      userId: socket.userId,
      username: user?.username || 'Utilisateur'
    });
  });

  socket.on('send_message', async (data) => {
    try {
      const msg = await Message.create({
        content: data.content,
        sender: socket.userId,
        senderName: user?.username || 'Utilisateur',
        room: data.room,
        recipient: data.recipient || null
      });

      io.to(data.room).emit('receive_message', {
        _id: msg._id,
        userId: socket.userId,
        senderName: msg.senderName,
        content: msg.content,
        room: msg.room,
        createdAt: msg.createdAt
      });
    } catch (err) {
      socket.emit('error', { message: 'Erreur envoi message' });
    }
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    io.to(roomId).emit('user_left', {
      userId: socket.userId
    });
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.userId);
    console.log('❌ Utilisateur déconnecté:', socket.userId);
  });
});

// =======================
// ROUTES API
// =======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat-rooms', require('./routes/chatRooms'));
app.use('/api/messages', require('./routes/messages'));

app.get('/api/protected', protect, (req, res) => {
  res.json({
    success: true,
    userId: req.user.id
  });
});

// =======================
// FRONTEND (PRODUCTION)
// =======================
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// =======================
// ERROR HANDLER (TOUJOURS À LA FIN)
// =======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erreur serveur'
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur TalkMe lancé sur le port ${PORT}`);
});

module.exports = { app, io };