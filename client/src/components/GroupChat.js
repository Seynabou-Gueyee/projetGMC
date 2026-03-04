import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './GroupChat.css';

const GroupChat = ({ token, currentUser }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', description: '', isPublic: true });
  const [groupMembers, setGroupMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialiser Socket.IO
  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO (GroupChat)');
    });

    newSocket.on('group_message', (data) => {
      if (selectedGroup && data.group === selectedGroup._id) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      }
    });

    newSocket.on('user_typing_group', (data) => {
      if (selectedGroup && data.groupId === selectedGroup._id) {
        if (data.userId !== currentUser?.id) {
          setTypingUsers(prev => [...prev, data.userName]);
        }
      }
    });

    newSocket.on('user_stopped_typing_group', (data) => {
      if (selectedGroup && data.groupId === selectedGroup._id) {
        setTypingUsers(prev => prev.filter(name => name !== data.userName));
      }
    });

    newSocket.on('member_joined', (data) => {
      if (selectedGroup && data.groupId === selectedGroup._id) {
        setGroupMembers(prev => [...prev, data.member]);
      }
    });

    newSocket.on('member_left', (data) => {
      if (selectedGroup && data.groupId === selectedGroup._id) {
        setGroupMembers(prev => prev.filter(m => m.userId._id !== data.memberId));
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token, currentUser?.id, selectedGroup?._id]);

  // Charger les groupes de l'utilisateur
  useEffect(() => {
    if (!token) return;

    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/groups',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setGroups(response.data.groups);
      } catch (err) {
        console.error('Erreur lors du chargement des groupes:', err);
        setError('Erreur lors du chargement des groupes');
      }
    };

    fetchGroups();
  }, [token]);

  // Charger les messages d'un groupe
  useEffect(() => {
    if (!selectedGroup || !token) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/messages?room=${selectedGroup._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setMessages(response.data.messages);
        setGroupMembers(selectedGroup.members || []);
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
        setError('Erreur lors du chargement des messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedGroup, token]);

  // Créer un nouveau groupe
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupData.name.trim()) {
      setError('Le nom du groupe est requis');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/groups',
        newGroupData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setGroups(prev => [...prev, response.data.group]);
      setNewGroupData({ name: '', description: '', isPublic: true });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Erreur lors de la création du groupe:', err);
      setError('Erreur lors de la création du groupe');
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const messageData = {
        content: newMessage,
        room: selectedGroup._id,
        sender: currentUser?.id
      };

      socket?.emit('send_group_message', messageData);

      const response = await axios.post(
        'http://localhost:5000/api/messages',
        messageData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  // Gestion de la frappe
  const handleTyping = () => {
    if (socket && selectedGroup) {
      socket.emit('typing_group', {
        groupId: selectedGroup._id,
        userId: currentUser?.id,
        userName: currentUser?.username
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && selectedGroup) {
      socket.emit('stopped_typing_group', {
        groupId: selectedGroup._id,
        userId: currentUser?.id,
        userName: currentUser?.username
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="group-chat-container">
      <div className="groups-sidebar">
        <div className="groups-header">
          <h2>👥 Groupes</h2>
          <button 
            className="btn-create-group"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            ➕ Nouveau
          </button>
        </div>

        {showCreateForm && (
          <form className="create-group-form" onSubmit={handleCreateGroup}>
            <input
              type="text"
              placeholder="Nom du groupe"
              value={newGroupData.name}
              onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
              required
            />
            <textarea
              placeholder="Description (optionnel)"
              value={newGroupData.description}
              onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
            />
            <label>
              <input
                type="checkbox"
                checked={newGroupData.isPublic}
                onChange={(e) => setNewGroupData({...newGroupData, isPublic: e.target.checked})}
              />
              Public
            </label>
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>Annuler</button>
          </form>
        )}

        <div className="groups-list">
          {groups.map(group => (
            <div
              key={group._id}
              className={`group-item ${selectedGroup?._id === group._id ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group)}
            >
              <div className="group-avatar">{group.name.charAt(0).toUpperCase()}</div>
              <div className="group-info">
                <h4>{group.name}</h4>
                <p className="group-members-count">{group.members?.length || 0} membres</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="group-chat-main">
        {selectedGroup ? (
          <>
            <div className="group-header">
              <div className="group-title">
                <h2>{selectedGroup.name}</h2>
                <p>{selectedGroup.description}</p>
              </div>
              <div className="group-members-preview">
                {groupMembers.slice(0, 3).map(member => (
                  <div key={member.userId._id} className="member-avatar" title={member.userId.username}>
                    {member.userId.avatar ? (
                      <img src={member.userId.avatar} alt={member.userId.username} />
                    ) : (
                      <span>{member.userId.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                ))}
                {groupMembers.length > 3 && (
                  <div className="member-avatar more">+{groupMembers.length - 3}</div>
                )}
              </div>
            </div>

            <div className="messages-container">
              {loading ? (
                <p className="loading">Chargement des messages...</p>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <p className="no-messages">Aucun message pour l'instant</p>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg._id}
                        className={`message-wrapper ${msg.sender._id === currentUser?.id ? 'own' : ''}`}
                      >
                        <div className="message">
                          {msg.sender._id !== currentUser?.id && (
                            <p className="message-sender">{msg.sender.username}</p>
                          )}
                          <p className="message-content">{msg.content}</p>
                          <span className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  {typingUsers.length > 0 && (
                    <p className="typing-indicator">
                      {typingUsers.join(', ')} est en train d'écrire...
                    </p>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleTyping}
                onKeyUp={handleStopTyping}
                placeholder="Votre message..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !newMessage.trim()}>
                Envoyer
              </button>
            </form>
          </>
        ) : (
          <div className="no-group-selected">
            <p>Sélectionnez ou créez un groupe</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default GroupChat;
