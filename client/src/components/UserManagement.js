import React, { useState } from 'react';
import ConnectedUsers from './ConnectedUsers';
import RoleManager from './RoleManager';
import './UserManagement.css';

const UserManagement = ({ roomId }) => {
  const [activeTab, setActiveTab] = useState('connected');
  const currentUserRole = localStorage.getItem('userRole');

  return (
    <div className="user-management">
      {/* Onglets */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'connected' ? 'active' : ''}`}
          onClick={() => setActiveTab('connected')}
        >
          👥 Membres connectés
        </button>
        {currentUserRole === 'admin' && (
          <button
            className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            👑 Gestion des rôles
          </button>
        )}
      </div>

      {/* Contenu des onglets */}
      <div className="tabs-content">
        {activeTab === 'connected' && (
          <ConnectedUsers roomId={roomId} />
        )}
        {activeTab === 'roles' && currentUserRole === 'admin' && (
          <RoleManager roomId={roomId} />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
