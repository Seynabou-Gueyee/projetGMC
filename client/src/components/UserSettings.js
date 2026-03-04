import React, { useState } from 'react';
import BlockedUsers from './BlockedUsers';
import AudioTranscription from './AudioTranscription';
import RoleManager from './RoleManager';
import SearchMessages from './SearchMessages';
import './UserSettings.css';

const UserSettings = ({ token, currentUser, rooms }) => {
  const [activeTab, setActiveTab] = useState('blocked');
  const [transcribedText, setTranscribedText] = useState('');

  const handleTranscriptionComplete = (text) => {
    setTranscribedText(text);
    // Copier le texte dans le presse-papier
    navigator.clipboard.writeText(text).then(() => {
      alert('✓ Texte transcrit copié au presse-papier!');
    }).catch(err => {
      console.error('Erreur:', err);
    });
  };

  return (
    <div className="user-settings">
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
          title="Gérer les utilisateurs bloqués"
        >
          🚫 Utilisateurs bloqués
        </button>
        <button
          className={`settings-tab ${activeTab === 'transcription' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcription')}
          title="Transcrire du texte depuis la voix"
        >
          🎤 Transcription vocale
        </button>
        <button
          className={`settings-tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
          title="Gérer les rôles des utilisateurs"
        >
          👑 Gestion des rôles
        </button>
        <button
          className={`settings-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
          title="Rechercher dans les messages"
        >
          🔍 Recherche messages
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'blocked' && (
          <div className="settings-panel">
            <BlockedUsers token={token} currentUser={currentUser} />
          </div>
        )}

        {activeTab === 'transcription' && (
          <div className="settings-panel">
            <div className="transcription-container">
              <AudioTranscription 
                onTranscriptionComplete={handleTranscriptionComplete}
                language="fr-FR"
              />
              
              {transcribedText && (
                <div className="transcription-result-preview">
                  <h4>Texte transcrit:</h4>
                  <p>{transcribedText}</p>
                  <button
                    className="btn-clear-transcription"
                    onClick={() => setTranscribedText('')}
                  >
                    Effacer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="settings-panel">
            <RoleManager roomId="general" />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="settings-panel">
            {rooms && rooms.length > 0 ? (
              rooms.map(room => (
                <div key={room._id} className="search-room-section">
                  <h4>Rechercher dans: {room.name}</h4>
                  <SearchMessages 
                    token={token}
                    room={room}
                    onSearchResults={(results) => {
                      console.log('Résultats:', results);
                    }}
                    isOpen={true}
                    onClose={() => {}}
                  />
                </div>
              ))
            ) : (
              <div className="empty-state">
                Aucun salon disponible pour la recherche
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
