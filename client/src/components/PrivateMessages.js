import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './PrivateMessages.css';

const PrivateMessages = ({ token, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Initialiser Socket.IO et charger les utilisateurs
  useEffect(() => {
    if (!token) return;

    // Créer la connexion Socket.IO
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO (Private Messages)');
    });

    newSocket.on('user_came_online', (data) => {
      console.log('Utilisateur en ligne:', data);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === data.userId ? { ...user, isOnline: true } : user
        )
      );
    });

    newSocket.on('user_went_offline', (data) => {
      console.log('Utilisateur hors ligne:', data);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === data.userId
            ? { ...user, isOnline: false, lastSeen: data.lastSeen }
            : user
        )
      );
    });

    newSocket.on('user_typing', (data) => {
      if (data.userId !== currentUser?.id) {
        setTypingUser(data);
      }
    });

    newSocket.on('user_stopped_typing', (data) => {
      if (data.userId !== currentUser?.id) {
        setTypingUser(null);
      }
    });

    newSocket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token, currentUser?.id]);

  // Charger la liste des utilisateurs
  useEffect(() => {
    if (!token) return;
    
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/auth/users',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setUsers(response.data.users);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        setError('Erreur lors du chargement des utilisateurs');
      }
    };

    fetchUsers();
  }, [token]);

  // Fonction pour charger les messages
  const fetchMessages = async (userId) => {
    if (!userId || !token) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/private/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessages(response.data.messages || []);
      setError('');
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setError('Erreur lors du chargement des messages');
    }
  };

  // Charger les messages quand un utilisateur est sélectionné
  useEffect(() => {
    if (!selectedUser || !token) return;
    fetchMessages(selectedUser._id);
  }, [selectedUser, token]);

  // Auto-scroll vers les nouveaux messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setLoading(true);
    setError('');

    try {
      await axios.post(
        `http://localhost:5000/api/messages/private/${selectedUser._id}`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Recharger les messages après l'envoi
      setNewMessage('');
      await fetchMessages(selectedUser._id);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="private-messages-container">
      <div className="users-list">
        <h3>Conversations</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="users-scroll">
          {users.length === 0 ? (
            <p className="no-users">Aucun utilisateur disponible</p>
          ) : (
            users
              .filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(user => (
                <div
                  key={user._id}
                  className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="messages-area">
        {selectedUser ? (
          <>
            <div className="conversation-header">
              <h3>{selectedUser.username}</h3>
              <p className="conversation-email">{selectedUser.email}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="messages-display">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>Aucun message. Commencez la conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender._id === currentUser?.id ? 'own-message' : 'other-message'}`}
                  >
                    <div className="message-header">
                      <span className="message-user">{msg.sender.username}</span>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez un message privé..."
                disabled={loading}
                rows="2"
                maxLength="500"
              />
              <button type="submit" disabled={loading || !newMessage.trim()}>
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation">
            <p>Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateMessages;
