import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BlockedUsers.css';

const BlockedUsers = ({ token, currentUser }) => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('blocked'); // 'blocked' ou 'unblock'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBlockedUsers();
    fetchAllUsers();
  }, [token]);

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users/blocked', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlockedUsers(response.data.blockedUsers || []);
      setError('');
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs bloqués:', err);
      setError('Erreur lors du chargement des utilisateurs bloqués');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data.users || []);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  };

  const handleBlockUser = async (userIdToBlock) => {
    if (!userIdToBlock) return;
    if (userIdToBlock === currentUser?._id) {
      setError('Vous ne pouvez pas vous bloquer vous-même');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/users/block',
        { userIdToBlock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchBlockedUsers();
      setError('');
      alert('✓ Utilisateur bloqué avec succès');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du blocage');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userIdToUnblock) => {
    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/users/unblock',
        { userIdToUnblock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchBlockedUsers();
      setError('');
      alert('✓ Utilisateur débloqué avec succès');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du déblocage');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Utilisateurs non bloqués (pour bloquer)
  const unBlockedUsers = allUsers.filter(user => 
    user._id !== currentUser?._id && 
    !blockedUsers.some(b => b._id === user._id)
  );

  // Filtre les résultats selon le tab actif
  const filteredBlockedUsers = blockedUsers.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUnBlockedUsers = unBlockedUsers.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="blocked-users-container">
      <div className="blocked-users-header">
        <h3>🚫 Gestion des utilisateurs bloqués</h3>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {/* Onglets */}
      <div className="blocked-users-tabs">
        <button
          className={`tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          🔒 Bloqués ({blockedUsers.length})
        </button>
        <button
          className={`tab ${activeTab === 'unblock' ? 'active' : ''}`}
          onClick={() => setActiveTab('unblock')}
        >
          🔓 À bloquer ({unBlockedUsers.length})
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="blocked-users-search">
        <input
          type="text"
          placeholder="🔍 Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Contenu selon l'onglet */}
      <div className="blocked-users-content">
        {loading && <div className="loading">Chargement...</div>}

        {activeTab === 'blocked' && (
          <div className="blocked-list">
            <h4>Utilisateurs bloqués</h4>
            {filteredBlockedUsers.length === 0 ? (
              <div className="empty-state">
                {blockedUsers.length === 0 
                  ? '✅ Vous n\'avez bloqué personne'
                  : 'Aucun résultat trouvé'}
              </div>
            ) : (
              <div className="users-grid">
                {filteredBlockedUsers.map(user => (
                  <div key={user._id} className="user-card blocked">
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="blocked-badge">🚫</span>
                    </div>
                    
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                      {user.status && <div className="user-status">{user.status}</div>}
                    </div>

                    <button
                      className="btn-unblock"
                      onClick={() => handleUnblockUser(user._id)}
                      disabled={loading}
                      title="Débloquer cet utilisateur"
                    >
                      🔓 Débloquer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'unblock' && (
          <div className="unblock-list">
            <h4>Bloquer un nouvel utilisateur</h4>
            {filteredUnBlockedUsers.length === 0 ? (
              <div className="empty-state">
                {unBlockedUsers.length === 0 
                  ? '✅ Vous avez bloqué tout le monde'
                  : 'Aucun résultat trouvé'}
              </div>
            ) : (
              <div className="users-grid">
                {filteredUnBlockedUsers.map(user => (
                  <div key={user._id} className="user-card unblock">
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="online-badge">
                        {user.isOnline ? '🟢' : '⚫'}
                      </span>
                    </div>
                    
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                      {user.status && <div className="user-status">{user.status}</div>}
                    </div>

                    <button
                      className="btn-block"
                      onClick={() => handleBlockUser(user._id)}
                      disabled={loading}
                      title="Bloquer cet utilisateur"
                    >
                      🚫 Bloquer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="blocked-users-info">
        <p>💡 Les utilisateurs bloqués ne pourront plus vous envoyer de messages privés</p>
        <p>💡 Vous ne verrez pas leurs messages dans les groupes</p>
      </div>
    </div>
  );
};

export default BlockedUsers;
