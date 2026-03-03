import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import MessageForm from './MessageForm';
import RoomUsers from './RoomUsers';
import './ChatRoom.css';

const ChatRoom = ({ room, user, token }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialiser Socket.IO et charger les messages historiques
  useEffect(() => {
    if (!room || !token) return;

    // Créer la connexion Socket.IO
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      // Rejoindre le salon
      newSocket.emit('join_room', room._id || room.id);
    });

    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, {
        _id: data._id,
        userId: data.userId,
        senderName: data.senderName,
        content: data.content,
        room: data.room,
        timestamp: data.timestamp,
        sender: data.sender
      }]);
    });

    newSocket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
    });

    newSocket.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
    });

    setSocket(newSocket);

    // Charger les messages historiques
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/room/${room._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
      }
    };

    fetchMessages();

    return () => {
      if (newSocket) {
        newSocket.emit('leave_room', room._id || room.id);
        newSocket.disconnect();
      }
    };
  }, [room, token]);

  // Auto-scroll vers les nouveaux messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Envoyer un message via Socket.IO
  const handleSendMessage = async (messageContent) => {
    if (!socket) {
      console.error('Socket.IO non connecté');
      return;
    }

    setLoading(true);

    try {
      socket.emit('send_message', {
        content: messageContent,
        room: room._id || room.id
      });
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <h2>{room.name}</h2>
        {room.description && <p>{room.description}</p>}
      </div>

      <div className="chat-content">
        <div className="messages-section">
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>Aucun message. Soyez le premier à écrire!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.userId === user?.id ? 'own-message' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-user">
                      {msg.senderName || 'Utilisateur'}
                    </span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <MessageForm 
            onSendMessage={handleSendMessage}
            disabled={loading || !socket}
            placeholder="Écrivez un message..."
          />
        </div>

        <aside className="sidebar">
          <RoomUsers room={room} socket={socket} currentUserId={user?.id} />
        </aside>
      </div>
    </div>
  );
};

export default ChatRoom;
