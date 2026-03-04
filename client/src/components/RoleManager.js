import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RoleManager.css';

const RoleManager = ({ roomId }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('user');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Récupérer le profil actuel
      const currentProfileRes = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUserRole(currentProfileRes.data.user.role);

      // Récupérer les utilisateurs connectés
      const usersRes = await axios.get('/api/users/connected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Erreur fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteToModerator = async (userId) => {
    if (currentUserRole !== 'admin') {
      alert('Vous n\'avez pas les droits pour promouvoir');
      return;
    }

    try {
      const response = await axios.put(
        `/api/users/${userId}/promote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u =>
        u._id === userId ? { ...u, role: 'moderator' } : u
      ));
      alert('Utilisateur promu modérateur ✓');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la promotion');
    }
  };

  const handleDemoteFromModerator = async (userId) => {
    if (currentUserRole !== 'admin') {
      alert('Vous n\'avez pas les droits pour rétrograder');
      return;
    }

    try {
      const response = await axios.put(
        `/api/users/${userId}/demote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u =>
        u._id === userId ? { ...u, role: 'user' } : u
      ));
      alert('Utilisateur rétrogradé ✓');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la rétrogradation');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#f44336',
      moderator: '#2196f3',
      user: '#4caf50'
    };
    return colors[role] || '#757575';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: '👑 Admin',
      moderator: '🛡️ Modérateur',
      user: '👤 Utilisateur'
    };
    return labels[role] || role;
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUserRole || currentUserRole !== 'admin') {
    return (
      <div className="role-manager">
        <div className="access-denied">
          🔐 Vous n'avez pas accès à cette section (Admin requis)
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="role-manager">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="role-manager">
      <div className="role-manager-header">
        <h3>👑 Gestion des rôles</h3>
        <button className="refresh-btn" onClick={fetchUsers}>
          🔄
        </button>
      </div>

      {/* Recherche */}
      <div className="role-manager-search">
        <input
          type="text"
          placeholder="🔍 Chercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Stats */}
      <div className="role-stats">
        <div className="stat-box admin-stat">
          <span className="stat-icon">👑</span>
          <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
          <span className="stat-label">Admins</span>
        </div>
        <div className="stat-box moderator-stat">
          <span className="stat-icon">🛡️</span>
          <span className="stat-value">{users.filter(u => u.role === 'moderator').length}</span>
          <span className="stat-label">Modérateurs</span>
        </div>
        <div className="stat-box user-stat">
          <span className="stat-icon">👤</span>
          <span className="stat-value">{users.filter(u => u.role === 'user').length}</span>
          <span className="stat-label">Utilisateurs</span>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="users-role-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">Aucun utilisateur trouvé</div>
        ) : (
          filteredUsers.map(user => (
            <div key={user._id} className="user-role-item">
              {/* Avatar */}
              <div className="user-role-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Infos user */}
              <div className="user-role-info">
                <div className="user-role-name">
                  {user.username}
                  {user._id === currentUserId && ' (Vous)'}
                </div>
                <div className="user-role-email">{user.email}</div>
              </div>

              {/* Rôle actuel */}
              <div
                className="current-role"
                style={{ backgroundColor: getRoleColor(user.role) }}
              >
                {getRoleLabel(user.role)}
              </div>

              {/* Actions */}
              {user._id !== currentUserId && (
                <div className="role-actions">
                  {user.role === 'user' ? (
                    <button
                      className="btn-promote"
                      onClick={() => handlePromoteToModerator(user._id)}
                      title="Promouvoir en modérateur"
                    >
                      ⬆️
                    </button>
                  ) : user.role === 'moderator' ? (
                    <button
                      className="btn-demote"
                      onClick={() => handleDemoteFromModerator(user._id)}
                      title="Rétrograder en utilisateur"
                    >
                      ⬇️
                    </button>
                  ) : (
                    <span className="admin-badge">ADMIN</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="role-manager-info">
        <p>💡 Cliquez sur ⬆️ pour promouvoir un utilisateur en modérateur</p>
        <p>💡 Cliquez sur ⬇️ pour rétrograder un modérateur en utilisateur</p>
      </div>
    </div>
  );
};

export default RoleManager;
