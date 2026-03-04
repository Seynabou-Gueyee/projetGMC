import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GroupMemberManager.css';

const GroupMemberManager = ({ group, token, onClose, onMembersUpdated }) => {
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    if (!group || !token) return;
    fetchGroupMembers();
    fetchAllUsers();
  }, [group, token]);

  const fetchGroupMembers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/groups/${group._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMembers(response.data.group.members || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des membres');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/auth/users',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setAllUsers(response.data.users || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des utilisateurs');
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      setError('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/api/groups/${group._id}/members`,
        { memberIds: selectedUsers },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccessMessage(`${selectedUsers.length} utilisateur(s) ajouté(s) avec succès`);
      setSelectedUsers([]);
      fetchGroupMembers();
      onMembersUpdated?.();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'ajout des membres');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) {
      try {
        setLoading(true);
        await axios.delete(
          `http://localhost:5000/api/groups/${group._id}/members`,
          {
            data: { memberIds: [memberId] },
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setSuccessMessage('Membre retiré avec succès');
        fetchGroupMembers();
        onMembersUpdated?.();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors de la suppression du membre');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Filtrer les utilisateurs qui ne sont pas déjà membres
  const memberIds = members.map(m => m.userId._id);
  const availableUsers = allUsers
    .filter(user => !memberIds.includes(user._id) && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 10);

  return (
    <div className="group-member-manager">
      <div className="manager-header">
        <h3>📋 Gestion des membres - {group.name}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Membres actuels ({members.length})
        </button>
        <button 
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Ajouter des membres
        </button>
      </div>

      <div className="manager-content">
        {activeTab === 'members' && (
          <div className="members-list">
            {members.length === 0 ? (
              <p className="no-data">Aucun membre pour le moment</p>
            ) : (
              members.map(member => (
                <div key={member.userId._id} className="member-item">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.userId.avatar ? (
                        <img src={member.userId.avatar} alt={member.userId.username} />
                      ) : (
                        <span>{member.userId.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="member-details">
                      <p className="member-name">{member.userId.username}</p>
                      <span className={`role-badge ${member.role}`}>{member.role}</span>
                    </div>
                  </div>
                  {member.role !== 'admin' && (
                    <button
                      className="btn-remove-member"
                      onClick={() => handleRemoveMember(member.userId._id)}
                      disabled={loading}
                      title="Retirer ce membre"
                    >
                      ✕ Retirer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="add-members-section">
            <div className="search-section">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="users-list">
              {availableUsers.length === 0 ? (
                <p className="no-data">
                  {searchTerm ? 'Aucun utilisateur trouvé' : 'Tous les utilisateurs sont déjà membres'}
                </p>
              ) : (
                availableUsers.map(user => (
                  <div key={user._id} className="user-item">
                    <input
                      type="checkbox"
                      id={`user-${user._id}`}
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserToggle(user._id)}
                      className="user-checkbox"
                    />
                    <label htmlFor={`user-${user._id}`} className="user-label">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} />
                        ) : (
                          <span>{user.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="user-details">
                        <p className="user-name">{user.username}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>

            {selectedUsers.length > 0 && (
              <div className="selected-count">
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </div>
            )}

            <div className="manager-actions">
              <button
                className="btn-add"
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || loading}
              >
                {loading ? 'Ajout en cours...' : `Ajouter ${selectedUsers.length} utilisateur(s)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMemberManager;
