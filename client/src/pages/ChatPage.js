import React, { useState, useEffect } from 'react';
import CreateChatRoomForm from '../components/CreateChatRoomForm';
import ChatRoomList from '../components/ChatRoomList';
import JoinedChatRooms from '../components/JoinedChatRooms';
import ChatRoom from '../components/ChatRoom';
import PrivateMessages from '../components/PrivateMessages';
import UserManagement from '../components/UserManagement';
import UserProfile from '../components/UserProfile';
import GroupChat from '../components/GroupChat';
import GroupMemberManager from '../components/GroupMemberManager';
import NotificationsPanel from '../components/NotificationsPanel';
import RecentConversations from '../components/RecentConversations';
import ChatbotInterface from '../components/ChatbotInterface';
import './ChatPage.css';

const ChatPage = ({ user, token, onLogout }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joinedRoomsIds, setJoinedRoomsIds] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations', 'rooms', 'messages', 'groups' ou 'users'
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupMemberManager, setShowGroupMemberManager] = useState(false);

  const handleRoomCreated = (newRoom) => {
    // Ajouter le nouveau salon à la liste des salons rejoints
    setJoinedRoomsIds([...joinedRoomsIds, newRoom._id]);
    setSelectedRoom(newRoom);
    setShowCreateForm(false);
  };

  const handleRoomJoined = (room) => {
    if (!joinedRoomsIds.includes(room._id)) {
      setJoinedRoomsIds([...joinedRoomsIds, room._id]);
    }
  };

  const handleRoomLeft = (roomId) => {
    setJoinedRoomsIds(joinedRoomsIds.filter(id => id !== roomId));
    if (selectedRoom?._id === roomId) {
      setSelectedRoom(null);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setActiveTab('rooms');
  };

  const handleSelectConversation = (conversation) => {
    if (conversation.type === 'private') {
      setActiveTab('messages');
    } else if (conversation.type === 'group') {
      setSelectedGroup(conversation);
      setActiveTab('groups');
    }
  };

  return (
    <div className="chat-page-container">
      <div className="chat-header">
        <div className="header-left">
          <h1>TalkMe</h1>
        </div>
        <div className="header-right">
          <NotificationsPanel token={token} currentUser={user} />
          <button 
            className="profile-btn"
            onClick={() => setShowUserProfile(true)}
            title="Mon profil"
          >
            👤
          </button>
          <button 
            className="logout-btn"
            onClick={onLogout}
            title="Déconnexion"
          >
            ⬅️
          </button>
        </div>
      </div>

      <div className="chat-content-wrapper">
        <div className="chat-sidebar">
        <div className="sidebar-tabs">
          <button 
            className={`tab-button ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversations')}
            title="Toutes les conversations"
          >
            🗂️ Conversations
          </button>
          <button 
            className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
            title="Salons"
          >
            💬 Salons
          </button>
          <button 
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
            title="Groupes"
          >
            👥 Groupes
          </button>
          <button 
            className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
            title="Messages privés"
          >
            ✉️ Messages
          </button>
        </div>

        {activeTab === 'conversations' ? (
          <RecentConversations
            token={token}
            currentUser={user}
            onSelectConversation={handleSelectConversation}
          />
        ) : activeTab === 'rooms' ? (
          <>
            {showCreateForm && (
              <CreateChatRoomForm 
                onRoomCreated={handleRoomCreated}
                token={token}
              />
            )}

            <div className="sidebar-actions">
              <button 
                className="create-room-btn"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                ➕ Nouveau salon
              </button>
            </div>

            <JoinedChatRooms 
              token={token}
              joinedRoomsIds={joinedRoomsIds}
              onSelectRoom={handleSelectRoom}
              onRoomLeft={handleRoomLeft}
            />

            <ChatRoomList 
              token={token}
              onRoomSelect={handleSelectRoom}
              onRoomJoined={handleRoomJoined}
            />
          </>
        ) : activeTab === 'groups' ? (
          <div className="groups-sidebar-content">
            {/* Le contenu des groupes s'affiche dans le panneau principal */}
            <p className="sidebar-placeholder">Les groupes s'affichent à droite →</p>
          </div>
        ) : (
          <div className="sidebar-messages-placeholder">
            Les messages privés s'affichent à droite →
          </div>
        )}
      </div>

      <div className="chat-main">
        {activeTab === 'rooms' ? (
          selectedRoom ? (
            <ChatRoom 
              room={selectedRoom}
              user={user}
              token={token}
            />
          ) : (
            <div className="no-room-selected">
              <div className="welcome-message">
                <h2>Bienvenue, {user?.username}! 👋</h2>
                <p>Sélectionnez un salon pour commencer à discuter</p>
                <div className="welcome-tips">
                  <h3>Comment commencer :</h3>
                  <ul>
                    <li>📝 Créez un nouveau salon en cliquant sur le bouton <strong>➕ Nouveau salon</strong></li>
                    <li>🔍 Explorez les salons disponibles dans la liste</li>
                    <li>💬 Rejoignez un salon et commencez à discuter</li>
                    <li>👥 Invitez vos amis à rejoindre TalkMe</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        ) : activeTab === 'conversations' ? (
          <div className="no-room-selected">
            <div className="welcome-message">
              <h2>Vos Conversations 🗂️</h2>
              <p>Sélectionnez une conversation pour continuer</p>
            </div>
          </div>
        ) : activeTab === 'groups' ? (
          <GroupChat 
            token={token}
            currentUser={user}
          />
        ) : (
          <PrivateMessages 
            token={token}
            currentUser={user}
          />
        )}
      </div>

      {/* Modal profil utilisateur */}
      {showUserProfile && (
        <UserProfile
          userId={user?._id || localStorage.getItem('userId')}
          isCurrentUser={true}
          onClose={() => setShowUserProfile(false)}
        />
      )}

      {/* Modal gestionnaire de membres du groupe */}
      {showGroupMemberManager && selectedGroup && (
        <div className="modal-overlay" onClick={() => setShowGroupMemberManager(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <GroupMemberManager
              group={selectedGroup}
              token={token}
              onClose={() => setShowGroupMemberManager(false)}
              onMembersUpdated={() => {
                // Rafraîchir les données du groupe
              }}
            />
          </div>
        </div>
      )}

      {/* Chatbot Interface */}
      <ChatbotInterface 
        token={token}
        currentRoom={selectedRoom?._id}
        currentUser={user}
      />
      </div>
    </div>
  );
};

export default ChatPage;
