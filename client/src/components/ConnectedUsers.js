import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfile from './UserProfile';
import './ConnectedUsers.css';

const ConnectedUsers = ({ roomId }) => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchConnectedUsers();
    const interval = setInterval(fetchConnectedUsers, 5000); // Actualiser toutes les 5s
    return () => clearInterval(interval);
  }, []);

  const fetchConnectedUsers = async () => {
    try {
      const response = await axios.get('/api/users/connected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectedUsers(response.data.users);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur fetch users:', error);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      online: '#4caf50',
      away: '#ff9800',
      busy: '#f44336',
      in_meeting: '#2196f3',
      offline: '#757575'
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status) => {
    const icons = {
      online: '🟢',
      away: '🟡',
      busy: '🔴',
      in_meeting: '🔵',
      offline: '⚫'
    };
    return icons[status] || '⚫';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑',
      moderator: '🛡️',
      user: '👤'
    };
    return icons[role] || '👤';
  };

  // Filtrer et trier les utilisateurs
  const filteredUsers = connectedUsers
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.lastSeen) - new Date(a.lastSeen);
      } else if (sortBy === 'status') {
        const statusOrder = { online: 0, away: 1, busy: 2, in_meeting: 3, offline: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      } else if (sortBy === 'role') {
        const roleOrder = { admin: 0, moderator: 1, user: 2 };
        return roleOrder[a.role] - roleOrder[b.role];
      } else if (sortBy === 'name') {
        return a.username.localeCompare(b.username);
      }
    });

  if (isLoading) {
    return (
      <div className="connected-users">
        <div className="loading">Chargement des utilisateurs...</div>
      </div>
    );
  }

  return (
    <div className="connected-users">
      <div className="users-header">
        <h3>👥 Membres connectés ({connectedUsers.length})</h3>
        <button className="refresh-btn" onClick={fetchConnectedUsers}>
          🔄
        </button>
      </div>

      {/* Recherche et tri */}
      <div className="users-controls">
        <input
          type="text"
          placeholder="🔍 Chercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="recent">⏰ Récent</option>
          <option value="status">🟢 Statut</option>
          <option value="role">👑 Rôle</option>
          <option value="name">A-Z Nom</option>
        </select>
      </div>

      {/* Liste des utilisateurs */}
      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            Aucun utilisateur trouvé
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user._id}
              className={`user-item ${user._id === currentUserId ? 'current-user' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              {/* Avatar */}
              <div className="user-avatar-small">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <div className="avatar-initial">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className="status-dot"
                  style={{ backgroundColor: getStatusColor(user.status) }}
                  title={user.statusMessage || ''}
                ></div>
              </div>

              {/* Infos utilisateur */}
              <div className="user-info">
                <div className="user-line-1">
                  <span className="username">
                    {user.username}
                    {user._id === currentUserId && ' (Vous)'}
                  </span>
                  <span className="role-badge">
                    {getRoleIcon(user.role)}
                  </span>
                </div>

                <div className="user-line-2">
                  <span className="status-text">
                    {getStatusIcon(user.status)} 
                  </span>
                  {user.statusMessage && (
                    <span className="status-message-small">
                      {user.statusMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* Chevron */}
              <div className="user-chevron">→</div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-label">🟢 Actifs:</span>
          <span className="stat-value">
            {connectedUsers.filter(u => u.status === 'online').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">👑 Admins:</span>
          <span className="stat-value">
            {connectedUsers.filter(u => u.role === 'admin').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🛡️ Modos:</span>
          <span className="stat-value">
            {connectedUsers.filter(u => u.role === 'moderator').length}
          </span>
        </div>
      </div>

      {/* Modal profil */}
      {selectedUser && (
        <UserProfile
          userId={selectedUser._id}
          isCurrentUser={selectedUser._id === currentUserId}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default ConnectedUsers;
