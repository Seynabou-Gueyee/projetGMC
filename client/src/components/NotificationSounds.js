import React, { useState, useEffect, useRef } from 'react';
import './NotificationSounds.css';

/**
 * Sons de notification prédéfinis
 */
export const NOTIFICATION_SOUNDS = [
  {
    id: 'notification_1',
    name: 'Bip classique',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAABiYWRkBAAAAAA=',
    duration: 0.5
  },
  {
    id: 'notification_2',
    name: 'Ping doux',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAABiYWRkBAAAAAA=',
    duration: 0.5
  },
  {
    id: 'notification_3',
    name: 'Cloche',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAABiYWRkBAAAAAA=',
    duration: 0.8
  },
  {
    id: 'notification_4',
    name: 'Message',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAABiYWRkBAAAAAA=',
    duration: 0.6
  },
  {
    id: 'notification_5',
    name: 'Succès',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAABiYWRkBAAAAAA=',
    duration: 0.5
  }
];

/**
 * Hook pour gérer les sons de notification
 */
export const useNotificationSounds = () => {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0.8);
  const [selectedSound, setSelectedSound] = useState('notification_1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSound = localStorage.getItem('selectedNotificationSound');
    const savedVolume = parseFloat(localStorage.getItem('notificationVolume') || '0.8');
    const savedEnabled = localStorage.getItem('notificationSoundsEnabled') !== 'false';

    if (savedSound) setSelectedSound(savedSound);
    setVolume(savedVolume);
    setSoundsEnabled(savedEnabled);
  }, []);

  // Sauvegarder les paramètres
  useEffect(() => {
    localStorage.setItem('selectedNotificationSound', selectedSound);
    localStorage.setItem('notificationVolume', volume.toString());
    localStorage.setItem('notificationSoundsEnabled', soundsEnabled.toString());
  }, [selectedSound, volume, soundsEnabled]);

  const playSound = (soundId = selectedSound, customUrl = null) => {
    if (!soundsEnabled || isPlaying) return;

    const sound = NOTIFICATION_SOUNDS.find(s => s.id === soundId);
    if (!sound && !customUrl) return;

    const url = customUrl || sound.url;
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = url;
    audio.volume = volume;

    setIsPlaying(true);
    audio.play()
      .then(() => {
        audio.onended = () => setIsPlaying(false);
      })
      .catch(err => {
        console.error('Error playing notification sound:', err);
        setIsPlaying(false);
      });
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return {
    playSound,
    stopSound,
    volume,
    setVolume,
    selectedSound,
    setSelectedSound,
    soundsEnabled,
    setSoundsEnabled,
    isPlaying
  };
};

/**
 * Composant pour les paramètres de sons
 */
export const NotificationSoundsSettings = () => {
  const {
    playSound,
    stopSound,
    volume,
    setVolume,
    selectedSound,
    setSelectedSound,
    soundsEnabled,
    setSoundsEnabled,
    isPlaying
  } = useNotificationSounds();

  const [uploadedSound, setUploadedSound] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('audio/')) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }

    // Créer une URL pour le fichier
    const url = URL.createObjectURL(file);
    setUploadedSound({
      id: 'custom_' + Date.now(),
      name: file.name,
      url,
      duration: 1.0
    });

    // Sauvegarder dans localStorage
    localStorage.setItem('customNotificationSound', url);
  };

  const handlePlayTest = (soundId) => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound(soundId);
    }
  };

  return (
    <div className="notification-sounds-settings">
      <div className="settings-section">
        <h3>Sons de notification</h3>

        {/* Enable/Disable */}
        <div className="setting-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={soundsEnabled}
              onChange={(e) => setSoundsEnabled(e.target.checked)}
            />
            <span className="toggle-text">
              {soundsEnabled ? '🔊 Sons activés' : '🔇 Sons désactivés'}
            </span>
          </label>
        </div>

        {/* Volume Control */}
        <div className="setting-group">
          <label>Volume</label>
          <div className="volume-control">
            <span className="volume-icon">🔇</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
            <span className="volume-icon">🔊</span>
            <span className="volume-value">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Sound Selection */}
        <div className="setting-group">
          <label>Son de notification</label>
          <div className="sounds-grid">
            {NOTIFICATION_SOUNDS.map(sound => (
              <div
                key={sound.id}
                className={`sound-item ${selectedSound === sound.id ? 'active' : ''}`}
                onClick={() => setSelectedSound(sound.id)}
              >
                <button
                  className="play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTest(sound.id);
                  }}
                  disabled={!soundsEnabled}
                  title={isPlaying ? 'Arrêter' : 'Écouter'}
                >
                  {isPlaying && selectedSound === sound.id ? '⏸' : '▶'}
                </button>
                <span className="sound-name">{sound.name}</span>
                <span className="selection-indicator">✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Sound Upload */}
        <div className="setting-group">
          <label>Sound personnalisé</label>
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📤 Télécharger un son personnalisé
            </button>

            {uploadedSound && (
              <div className="uploaded-sound">
                <div className="sound-item active">
                  <button
                    className="play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTest(uploadedSound.id);
                    }}
                    disabled={!soundsEnabled}
                  >
                    {isPlaying && selectedSound === uploadedSound.id ? '⏸' : '▶'}
                  </button>
                  <span className="sound-name">{uploadedSound.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div className="setting-group">
          <label>Types de notifications</label>
          <div className="notification-types">
            <label className="type-label">
              <input
                type="checkbox"
                defaultChecked
              />
              <span>Messages privés</span>
            </label>
            <label className="type-label">
              <input
                type="checkbox"
                defaultChecked
              />
              <span>Mentions</span>
            </label>
            <label className="type-label">
              <input
                type="checkbox"
                defaultChecked
              />
              <span>Réactions</span>
            </label>
            <label className="type-label">
              <input
                type="checkbox"
                defaultChecked
              />
              <span>Messages de groupe</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="settings-section">
        <h3>Aperçu</h3>
        <div className="preview-notification">
          <div className="preview-content">
            <span className="preview-icon">💬</span>
            <div className="preview-text">
              <div className="preview-title">Notification de test</div>
              <div className="preview-message">Ceci est un exemple de notification</div>
            </div>
          </div>
          <button
            className="test-notification-btn"
            onClick={() => playSound(selectedSound)}
            disabled={!soundsEnabled || isPlaying}
          >
            {isPlaying ? '⏸ En cours...' : '🔊 Tester'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSoundsSettings;
