import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = ({ userId, onClose, isCurrentUser = false }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newStatusMessage, setNewStatusMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUserProfile();
    checkIfBlocked();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        isCurrentUser
          ? '/api/users/profile'
          : `/api/users/${userId}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUser(response.data.user);
      setNewStatus(response.data.user.status);
      setNewStatusMessage(response.data.user.statusMessage);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfBlocked = async () => {
    if (!isCurrentUser) {
      try {
        const response = await axios.get('/api/users/blocked', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const blocked = response.data.blockedUsers.some(
          b => b.userId._id === userId
        );
        setIsBlocked(blocked);
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      const response = await axios.post('/api/users/avatar', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors du téléchargement');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await axios.put(
        '/api/users/status',
        { status: newStatus, statusMessage: newStatusMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user);
      setEditingStatus(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleBlockUser = async () => {
    try {
      await axios.post(
        '/api/users/block',
        { userIdToBlock: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsBlocked(true);
      alert('Utilisateur bloqué');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du blocage');
    }
  };

  const handleUnblockUser = async () => {
    try {
      await axios.post(
        '/api/users/unblock',
        { userIdToUnblock: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsBlocked(false);
      alert('Utilisateur débloqué');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du déblocage');
    }
  };

  if (isLoading) {
    return (
      <div className="user-profile-modal">
        <div className="profile-content">
          <button className="close-btn" onClick={onClose}>✕</button>
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-modal">
        <div className="profile-content">
          <button className="close-btn" onClick={onClose}>✕</button>
          <div className="error">Utilisateur non trouvé</div>
        </div>
      </div>
    );
  }

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

  const getStatusLabel = (status) => {
    const labels = {
      online: 'En ligne',
      away: 'Absent',
      busy: 'Occupé',
      in_meeting: 'En réunion',
      offline: 'Hors ligne'
    };
    return labels[status] || status;
  };

  const getRoleLabel = (role) => {
    const labels = {
      user: '👤 Utilisateur',
      moderator: '🛡️ Modérateur',
      admin: '👑 Admin'
    };
    return labels[role] || role;
  };

  return (
    <div className="user-profile-modal" onClick={onClose}>
      <div className="profile-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        {/* Header avec avatar */}
        <div className="profile-header">
          <div className="avatar-container">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="avatar-large" />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(user.status) }}
              title={getStatusLabel(user.status)}
            ></div>
          </div>

          {isCurrentUser && (
            <label className="avatar-upload-label">
              📸 Changer la photo
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          )}
        </div>

        {/* Informations utilisateur */}
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p className="user-email">📧 {user.email}</p>

          {/* Statut */}
          <div className="status-container">
            <div className="status-badge" style={{ backgroundColor: getStatusColor(user.status) }}>
              {getStatusLabel(user.status)}
            </div>
            {user.statusMessage && (
              <p className="status-message">💬 {user.statusMessage}</p>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="user-bio">📝 {user.bio}</p>
          )}

          {/* Rôle */}
          <p className="user-role">{getRoleLabel(user.role)}</p>
        </div>

        {/* Édition du statut (utilisateur actuel) */}
        {isCurrentUser && (
          <div className="edit-status-section">
            {!editingStatus ? (
              <button className="edit-status-btn" onClick={() => setEditingStatus(true)}>
                ✏️ Modifier mon statut
              </button>
            ) : (
              <div className="status-edit-form">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="online">🟢 En ligne</option>
                  <option value="away">🟡 Absent</option>
                  <option value="busy">🔴 Occupé</option>
                  <option value="in_meeting">🔵 En réunion</option>
                  <option value="offline">⚫ Hors ligne</option>
                </select>

                <input
                  type="text"
                  placeholder="Message personnalisé (optionnel)"
                  value={newStatusMessage}
                  onChange={(e) => setNewStatusMessage(e.target.value)}
                  maxLength="100"
                  className="status-message-input"
                />

                <div className="status-edit-buttons">
                  <button
                    className="btn-save"
                    onClick={handleStatusUpdate}
                  >
                    ✓ Enregistrer
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setEditingStatus(false)}
                  >
                    ✕ Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions (pour autres utilisateurs) */}
        {!isCurrentUser && (
          <div className="profile-actions">
            {!isBlocked ? (
              <button className="btn-block" onClick={handleBlockUser}>
                🚫 Bloquer cet utilisateur
              </button>
            ) : (
              <button className="btn-unblock" onClick={handleUnblockUser}>
                ✓ Débloquer cet utilisateur
              </button>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="profile-timestamps">
          <p className="last-seen">
            Dernière activité: {new Date(user.lastSeen).toLocaleString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
