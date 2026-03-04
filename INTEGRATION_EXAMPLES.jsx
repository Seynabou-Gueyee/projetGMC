/**
 * EXEMPLE D'INTÉGRATION DES 4 FONCTIONNALITÉS COMPLÉTÉES
 * 
 * Ce fichier montre comment intégrer les nouveaux composants
 * dans votre application TalkMe
 */

import React, { useState } from 'react';
import UserSettings from './components/UserSettings';
import BlockedUsers from './components/BlockedUsers';
import AudioTranscription from './components/AudioTranscription';

/**
 * Exemple 1: Afficher le panneau complet UserSettings
 */
export const ExampleComplete = ({ token, currentUser, rooms }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="chat-layout">
      <header>
        <h1>TalkMe Chat</h1>
        
        {/* Bouton pour ouvrir les paramètres */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="settings-toggle"
        >
          ⚙️ Paramètres
        </button>
      </header>

      <main>
        {/* Contenu principal du chat */}
        <div className="chat-content">
          {/* Votre contenu de chat existant */}
        </div>

        {/* Panneau des paramètres */}
        {showSettings && (
          <aside className="settings-sidebar">
            <UserSettings 
              token={token}
              currentUser={currentUser}
              rooms={rooms}
            />
          </aside>
        )}
      </main>
    </div>
  );
};

/**
 * Exemple 2: Utiliser la transcription seule dans MessageForm
 */
export const ExampleWithTranscription = ({ token, currentUser }) => {
  const [message, setMessage] = useState('');

  const handleTranscriptionComplete = (transcribedText) => {
    // Ajouter le texte transcrit au message
    setMessage(prev => prev + (prev ? ' ' : '') + transcribedText);
  };

  return (
    <div className="message-form">
      {/* TextArea du message */}
      <textarea 
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Écrivez votre message..."
      />

      {/* Bouton transcription optionnel */}
      <button className="btn-transcription-toggle">
        🎤 Transcription
      </button>

      {/* Composant transcription */}
      <AudioTranscription 
        onTranscriptionComplete={handleTranscriptionComplete}
        language="fr-FR"
      />

      {/* Bouton d'envoi */}
      <button onClick={() => {
        // Envoyer le message
        console.log('Envoyer:', message);
        setMessage('');
      }}>
        Envoyer
      </button>
    </div>
  );
};

/**
 * Exemple 3: Utiliser le composant BlockedUsers seul
 */
export const ExampleBlockedUsers = ({ token, currentUser }) => {
  return (
    <div className="modal">
      <h2>Gestion des contacts</h2>
      
      <BlockedUsers 
        token={token} 
        currentUser={currentUser} 
      />
    </div>
  );
};

/**
 * Exemple 4: Utiliser le hook useAudioTranscription seul
 */
import { useAudioTranscription } from './hooks/useAudioTranscription';

export const ExampleUseHook = () => {
  const {
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    reset
  } = useAudioTranscription('fr-FR');

  return (
    <div className="custom-transcription">
      <h3>Transcription personnalisée</h3>

      {/* Afficher l'erreur */}
      {error && <p className="error">{error}</p>}

      {/* Afficher la transcription en cours */}
      {transcript && (
        <div className="transcript">
          <p>{transcript}</p>
          <span class="confidence">{confidence}%</span>
        </div>
      )}

      {/* Boutons de contrôle */}
      <div className="controls">
        {!isListening ? (
          <button onClick={startListening}>🎤 Écouter</button>
        ) : (
          <button onClick={stopListening}>⏹️ Arrêter</button>
        )}
        
        <button onClick={reset}>Réinitialiser</button>
      </div>
    </div>
  );
};

/**
 * Exemple 5: Configuration utilisateur avec accès par modal
 */
export const ExampleUserProfile = ({ token, currentUser, rooms }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="user-profile">
      <div className="profile-card">
        {/* Avatar */}
        <img src={currentUser.avatar} alt={currentUser.username} />
        <h2>{currentUser.username}</h2>
        <p>{currentUser.email}</p>

        {/* Boutons d'action */}
        <button onClick={() => setShowSettings(true)}>
          ⚙️ Mes paramètres
        </button>
      </div>

      {/* Modal des paramètres */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="close-btn"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>

            <UserSettings 
              token={token}
              currentUser={currentUser}
              rooms={rooms}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * GUIDE D'INTÉGRATION COMPLET
 * 
 * 1. IMPORTER LES COMPOSANTS:
 * 
 *    import UserSettings from './components/UserSettings';
 *    import BlockedUsers from './components/BlockedUsers';
 *    import AudioTranscription from './components/AudioTranscription';
 *    import { useAudioTranscription } from './hooks/useAudioTranscription';
 *
 * 2. UTILISER DANS VOTRE COMPOSANT:
 * 
 *    <UserSettings token={token} currentUser={currentUser} rooms={rooms} />
 *
 * 3. PASSER LES BONNES PROPS:
 * 
 *    - token: string (JWT token)
 *    - currentUser: { _id, username, email, avatar, ... }
 *    - rooms: Array<{ _id, name, ... }>
 *
 * 4. TRAITER LES CALLBACKS:
 * 
 *    onTranscriptionComplete: (text: string) => void
 *    onSearchResults: (results: array) => void
 *
 * 5. VÉRIFIER LES ENDPOINTS:
 * 
 *    GET  /api/users/blocked
 *    POST /api/users/block
 *    POST /api/users/unblock
 *    GET  /api/messages/search
 *    POST /api/users/:userId/promote
 *    POST /api/users/:userId/demote
 *    GET  /api/users/connected
 *
 * ✅ C'EST TOUT! Les 4 fonctionnalités sont maintenant intégrées!
 */

export default ExampleComplete;
