import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import RoomUsers from './RoomUsers';
import './ChatRoom.css';

const ChatRoom = ({ room, user, token }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialiser Socket.IO
  useEffect(() => {
    if (!room || !token) return;

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
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
    });

    newSocket.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
    });

    setSocket(newSocket);

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

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !socket) {
      return;
    }

    setLoading(true);

    try {
      socket.emit('send_message', {
        content: messageInput,
        room: room._id || room.id
      });

      setMessageInput('');
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

          <form className="message-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Écrivez un message..."
              disabled={loading || !socket}
              maxLength="500"
            />
            <button type="submit" disabled={loading || !socket || !messageInput.trim()}>
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </div>

        <aside className="sidebar">
          <RoomUsers room={room} socket={socket} currentUserId={user?.id} />
        </aside>
      </div>
    </div>
  );
};

export default ChatRoom;
