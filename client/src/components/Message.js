import React, { useEffect, useState } from 'react';
import MessageActions from './MessageActions';
import MediaAttachment from './MediaAttachment';
import LinkPreview from './LinkPreview';
import './Message.css';

const Message = ({
  message,
  currentUserId,
  socket,
  room,
  onMessageUpdate
}) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [isVisible, setIsVisible] = useState(true);
  const [readByUsers, setReadByUsers] = useState([]);
  const [showReadBy, setShowReadBy] = useState(false);

  const isOwnMessage = message.sender?._id === currentUserId || message.userId === currentUserId;
  const readByCount = displayMessage.readBy?.length || 0;
  const hasBeenRead = readByCount > 0;

  // All hooks must be called unconditionally and before any returns
  useEffect(() => {
    setDisplayMessage(message);
    if (message.readBy) {
      const users = message.readBy
        .map(r => r.userId?.username || r.userId)
        .filter(u => u !== message.senderName);
      setReadByUsers(users);
    }
  }, [message, message.readBy, message.senderName]);

  useEffect(() => {
    if (!isOwnMessage && socket && room && !hasBeenRead) {
      setTimeout(() => {
        socket.emit('mark_as_read', {
          messageId: displayMessage._id,
          room: room._id || room.id
        });
      }, 500);
    }
  }, [displayMessage._id, socket, room, isOwnMessage, hasBeenRead]);

  if (!isVisible) {
    return (
      <div className="message-deleted-wrapper">
        <div className="message-deleted-placeholder">
          🗑️ Message supprimé {isOwnMessage && ' (par vous)'}
        </div>
      </div>
    );
  }

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleEmojiReaction = (emoji) => {
    socket?.emit('react_to_message', {
      messageId: displayMessage._id,
      emoji: emoji,
      room: room._id || room.id
    });
  };

  const handleRemoveReaction = (emoji) => {
    socket?.emit('remove_emoji_reaction', {
      messageId: displayMessage._id,
      emoji: emoji,
      room: room._id || room.id
    });
  };

  return (
    <div
      className={`message ${isOwnMessage ? 'own-message' : ''}`}
      onMouseEnter={() => {
        // Afficher les actions au survol
      }}
    >
      <div className="message-header">
        <span className="message-user">
          {displayMessage.senderName || 'Utilisateur'}
        </span>
        <span className="message-time">
          {formatTime(displayMessage.timestamp || displayMessage.createdAt)}
        </span>
      </div>

      <div className="message-meta">
        {displayMessage.isPinned && (
          <span className="pinned-badge">📌 Épinglé</span>
        )}
        {isOwnMessage && displayMessage.isDelivered && (
          <span className="delivered-badge" title={`Livré le ${new Date(displayMessage.deliveredAt).toLocaleTimeString('fr-FR')}`}>
            ✓ Livré
          </span>
        )}
        {hasBeenRead && !isOwnMessage && (
          <span className="read-badge">👁️ Lu</span>
        )}
        {isOwnMessage && readByUsers.length > 0 && (
          <span 
            className="read-by-users"
            onMouseEnter={() => setShowReadBy(true)}
            onMouseLeave={() => setShowReadBy(false)}
            title={`Lu par: ${readByUsers.join(', ')}`}
          >
            👁️ {readByUsers.length} {readByUsers.length === 1 ? 'personne' : 'personnes'}
            {showReadBy && (
              <div className="read-by-tooltip">
                {readByUsers.map((user, idx) => (
                  <div key={idx} className="read-by-item">{user}</div>
                ))}
              </div>
            )}
          </span>
        )}
      </div>

      {displayMessage.isPinned && (
        <div className="pinned-indicator">📌 Message épinglé</div>
      )}

      <div className="message-content">
        {displayMessage.content}
        {displayMessage.isEdited && (
          <span className="edited-label">(édité)</span>
        )}
      </div>

      {/* Aperçu du lien si présent */}
      {displayMessage.linkPreview && (
        <div className="message-link-preview">
          <LinkPreview preview={displayMessage.linkPreview} />
        </div>
      )}

      {/* Section des pièces jointes */}
      {displayMessage.attachments && displayMessage.attachments.length > 0 && (
        <div className="message-attachments">
          <div className="attachments-label">📎 Pièces jointes ({displayMessage.attachments.length})</div>
          <div className="attachments-grid">
            {displayMessage.attachments.map((attachment, idx) => (
              <MediaAttachment 
                key={idx}
                attachment={attachment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section des réactions emoji */}
      {displayMessage.emojiReactions && displayMessage.emojiReactions.length > 0 && (
        <div className="message-reactions">
          <div className="reactions-list">
            {displayMessage.emojiReactions.map((reaction, idx) => (
              <button
                key={idx}
                className={`reaction-button ${reaction.users?.includes(currentUserId) ? 'user-reacted' : ''}`}
                onClick={() => {
                  if (reaction.users?.includes(currentUserId)) {
                    handleRemoveReaction(reaction.emoji);
                  } else {
                    handleEmojiReaction(reaction.emoji);
                  }
                }}
                title={`${reaction.emoji} - ${reaction.users?.length || 0} réaction(s)`}
              >
                <span className="reaction-emoji">{reaction.emoji}</span>
                <span className="reaction-count">{reaction.users?.length || 0}</span>
              </button>
            ))}
          </div>
          <button
            className="add-reaction-btn"
            onClick={() => {
              // Ouvrir le sélecteur d'emoji
              handleEmojiReaction('👍');
            }}
            title="Ajouter une réaction"
          >
            +
          </button>
        </div>
      )}

      <MessageActions
        message={displayMessage}
        currentUserId={currentUserId}
        socket={socket}
        room={room}
        onEdit={(content) => {
          setDisplayMessage({ ...displayMessage, content });
        }}
        onDelete={() => {
          setIsVisible(false);
        }}
      />
    </div>
  );
};

export default Message;
