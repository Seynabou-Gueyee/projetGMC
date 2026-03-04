import React, { useEffect, useState } from 'react';
import './LastSeenIndicator.css';

const LastSeenIndicator = ({ user, currentUser, socket }) => {
  const [lastSeen, setLastSeen] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Écouter les mises à jour du statut
    if (socket) {
      socket.on('user_status_changed', (data) => {
        if (data.userId === user._id || data.userId === user.id) {
          if (data.status === 'online') {
            setIsOnline(true);
            setLastSeen(null);
          } else {
            setIsOnline(false);
            setLastSeen(data.lastSeen);
          }
        }
      });

      // Demander le statut initial
      socket.emit('get_user_status', { userId: user._id || user.id });

      return () => {
        socket.off('user_status_changed');
      };
    }
  }, [user, socket]);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Jamais vu';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return `${date.toLocaleDateString('fr-FR')}`;
  };

  if (user._id === currentUser?._id || user.id === currentUser?.id) {
    return null; // Ne pas afficher pour l'utilisateur actuel
  }

  return (
    <div className="last-seen-indicator">
      <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
      <span className="status-text">
        {isOnline ? (
          <>
            <span className="online-badge">● En ligne</span>
          </>
        ) : (
          <>
            <span className="offline-badge">Vu {formatLastSeen(lastSeen)}</span>
          </>
        )}
      </span>
    </div>
  );
};

export default LastSeenIndicator;
