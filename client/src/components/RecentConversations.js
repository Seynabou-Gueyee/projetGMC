import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './RecentConversations.css';

const RecentConversations = ({ token, currentUser, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [muteStatus, setMuteStatus] = useState({});

  // Initialiser Socket.IO
  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connecté (RecentConversations)');
    });

    newSocket.on('conversation_updated', (data) => {
      setConversations(prev =>
        prev.map(conv =>
          conv._id === data.conversationId
            ? {
              ...conv,
              lastMessage: data.lastMessage,
              lastMessageAt: data.lastMessageAt
            }
            : conv
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token]);

  // Charger les conversations
  useEffect(() => {
    if (!token) return;
    fetchConversations();
  }, [token]);

  const fetchConversations = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [privateChats, groups, supportChat] = await Promise.all([
        axios.get('http://localhost:5000/api/private-chats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/groups', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/private-chats/support/chat', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null) // Support peut ne pas être disponible
      ]);

      // Combiner et formater les conversations
      const privateConversations = (privateChats.data.chats || []).map(chat => ({
        _id: chat._id,
        type: 'private',
        name: chat.participants?.find(p => p._id !== currentUser?.id)?.username || 'Conversation',
        avatar: chat.participants?.find(p => p._id !== currentUser?.id)?.avatar,
        statusMessage: chat.participants?.find(p => p._id !== currentUser?.id)?.statusMessage,
        bio: chat.participants?.find(p => p._id !== currentUser?.id)?.bio,
        status: chat.participants?.find(p => p._id !== currentUser?.id)?.status,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt || new Date(),
        participants: chat.participants,
        unreadCount: 0,
        isSupport: false
      }));

      // Ajouter Support en premier si disponible
      if (supportChat?.data?.chat) {
        const support = supportChat.data.chat;
        const supportConversation = {
          _id: support._id,
          type: 'private',
          name: '📞 Support',
          avatar: '🤖',
          statusMessage: support.participants?.find(p => p.username === 'Support')?.statusMessage,
          bio: support.participants?.find(p => p.username === 'Support')?.bio,
          status: 'online',
          lastMessage: support.lastMessage,
          lastMessageAt: support.lastMessageAt || new Date(),
          participants: support.participants,
          unreadCount: 0,
          isSupport: true
        };
        privateConversations.unshift(supportConversation);
      }

      const groupConversations = (groups.data.groups || []).map(group => ({
        _id: group._id,
        type: 'group',
        name: group.name,
        avatar: group.avatar,
        lastMessage: group.lastMessage,
        lastMessageAt: group.lastMessageAt || new Date(),
        membersCount: group.members?.length || 0,
        unreadCount: 0
      }));

      // Combiner et trier par date
      const allConversations = [...privateConversations, ...groupConversations]
        .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

      setConversations(allConversations);
      fetchMuteSettings();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMuteSettings = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/notifications/mute/settings',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const muted = {};
      response.data.muteSettings?.forEach(setting => {
        const key = setting.privateChat ? `private-${setting.privateChat}` : `group-${setting.group}`;
        muted[key] = true;
      });
      setMuteStatus(muted);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleToggleMute = async (conversation) => {
    const key = conversation.type === 'private'
      ? `private-${conversation._id}`
      : `group-${conversation._id}`;

    const isMuted = muteStatus[key];

    try {
      const endpoint = isMuted ? '/unmute' : '/mute';
      const data = {
        conversationType: conversation.type === 'private' ? 'private' : 'group',
        conversationId: conversation._id
      };

      await axios.post(
        `http://localhost:5000/api/notifications${endpoint}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMuteStatus(prev => ({
        ...prev,
        [key]: !isMuted
      }));
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="recent-conversations">
      <div className="recent-header">
        <h2>🗂️ Conversations</h2>
        <button className="refresh-btn" onClick={fetchConversations} title="Actualiser">
          🔄
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Rechercher une conversation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="conversations-list">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <p>Aucune conversation pour le moment</p>
            <small>Commencez une nouvelle conversation ou rejoignez un groupe</small>
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const muteKey = conversation.type === 'private'
              ? `private-${conversation._id}`
              : `group-${conversation._id}`;
            const isMuted = muteStatus[muteKey];

            return (
              <div
                key={`${conversation.type}-${conversation._id}`}
                className="conversation-item"
                onClick={() => onSelectConversation?.(conversation)}
              >
                <div className="conversation-avatar">
                  {conversation.avatar ? (
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      onError={(e) => {
                        e.target.parentElement.innerHTML = `<span style="font-weight: bold; font-size: 18px; color: white;">${conversation.name.charAt(0).toUpperCase()}</span>`;
                      }}
                    />
                  ) : (
                    <span>{conversation.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="conversation-content">
                  <div className="conversation-header-row">
                    <h4 className="conversation-name">
                      {conversation.type === 'group' ? '👥' : '💬'} {conversation.name}
                    </h4>
                    {conversation.type === 'group' && (
                      <span className="members-count">{conversation.membersCount}</span>
                    )}
                  </div>

                  {conversation.lastMessage ? (
                    <p className="last-message">
                      {conversation.lastMessage.content?.substring(0, 40) || 'Message...'}
                    </p>
                  ) : (
                    <p className="no-message">Aucun message</p>
                  )}

                  <div className="conversation-footer">
                    <span className="last-message-time">
                      {new Date(conversation.lastMessageAt).toLocaleDateString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>

                <div className="conversation-actions">
                  <button
                    className={`btn-mute ${isMuted ? 'muted' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMute(conversation);
                    }}
                    title={isMuted ? 'Son désactivé' : 'Activer le son'}
                  >
                    {isMuted ? '🔕' : '🔔'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentConversations;
