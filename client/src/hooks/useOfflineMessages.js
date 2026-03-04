// Hook personnalisé pour gérer les messages hors-ligne
const offlineMessagesKey = 'offline_messages';

/**
 * Ajoute un message à la file d'attente hors-ligne
 * @param {object} message - Message à ajouter
 */
export const addOfflineMessage = (message) => {
  try {
    const messages = JSON.parse(localStorage.getItem(offlineMessagesKey) || '[]');
    messages.push({
      ...message,
      timestamp: Date.now(),
      offline: true
    });
    localStorage.setItem(offlineMessagesKey, JSON.stringify(messages));
    return true;
  } catch (err) {
    console.error('Erreur lors de l\'ajout du message hors-ligne:', err);
    return false;
  }
};

/**
 * Récupère tous les messages hors-ligne
 * @returns {array} Liste des messages hors-ligne
 */
export const getOfflineMessages = () => {
  try {
    return JSON.parse(localStorage.getItem(offlineMessagesKey) || '[]');
  } catch (err) {
    console.error('Erreur lors de la lecture des messages hors-ligne:', err);
    return [];
  }
};

/**
 * Efface tous les messages hors-ligne
 */
export const clearOfflineMessages = () => {
  localStorage.removeItem(offlineMessagesKey);
};

/**
 * Supprime un message hors-ligne spécifique
 * @param {number} index - Index du message
 */
export const removeOfflineMessage = (index) => {
  try {
    const messages = JSON.parse(localStorage.getItem(offlineMessagesKey) || '[]');
    messages.splice(index, 1);
    localStorage.setItem(offlineMessagesKey, JSON.stringify(messages));
  } catch (err) {
    console.error('Erreur lors de la suppression du message hors-ligne:', err);
  }
};

/**
 * Hook React pour gérer la synchronisation des messages hors-ligne
 */
export const useOfflineSync = (socket, isConnected) => {
  const syncOfflineMessages = async () => {
    if (!isConnected || !socket) return;

    const offlineMessages = getOfflineMessages();
    
    for (const message of offlineMessages) {
      try {
        socket.emit('send_message', {
          content: message.content,
          room: message.room,
          attachments: message.attachments || [],
          linkPreview: message.linkPreview || null,
          offline: true // Marquer comme envoyé depuis le mode hors-ligne
        });
        
        // Attendre un peu avant d'envoyer le prochain
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Erreur lors de l\'envoi du message hors-ligne:', err);
      }
    }
    
    // Effacer les messages hors-ligne une fois synchronisés
    if (offlineMessages.length > 0) {
      clearOfflineMessages();
    }
  };

  return { syncOfflineMessages };
};

// Détecter la connectivité
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
