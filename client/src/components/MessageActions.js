import React, { useState } from 'react';
import './MessageActions.css';

const MessageActions = ({
  message,
  currentUserId,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  socket,
  room
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showHistory, setShowHistory] = useState(false);

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  const handleEdit = async () => {
    if (editedContent.trim() && editedContent !== message.content) {
      if (socket) {
        socket.emit('edit_message', {
          messageId: message._id,
          content: editedContent,
          room: room._id || room.id
        });
      }
      setIsEditing(false);
      setShowActions(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      if (socket) {
        socket.emit('delete_message', {
          messageId: message._id,
          room: room._id || room.id
        });
      }
      setShowActions(false);
    }
  };

  const handleReaction = (emoji) => {
    if (socket) {
      const hasReaction = message.reactions?.some(
        r => r.userId._id === currentUserId && r.emoji === emoji
      );

      if (hasReaction) {
        socket.emit('remove_reaction', {
          messageId: message._id,
          emoji,
          room: room._id || room.id
        });
      } else {
        socket.emit('add_reaction', {
          messageId: message._id,
          emoji,
          room: room._id || room.id
        });
      }
    }
    setShowReactions(false);
  };

  const handlePin = () => {
    if (socket) {
      if (message.isPinned) {
        socket.emit('unpin_message', {
          messageId: message._id,
          room: room._id || room.id
        });
      } else {
        socket.emit('pin_message', {
          messageId: message._id,
          room: room._id || room.id
        });
      }
    }
    setShowActions(false);
  };

  const isOwnMessage = message.sender?._id === currentUserId || message.userId === currentUserId;

  const getReactionCount = (emoji) => {
    return message.reactions?.filter(r => r.emoji === emoji).length || 0;
  };

  const hasReaction = (emoji) => {
    return message.reactions?.some(
      r => r.userId._id === currentUserId && r.emoji === emoji
    ) || false;
  };

  const formatEditTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getReactionUsers = (emoji) => {
    return message.reactions
      ?.filter(r => r.emoji === emoji)
      .map(r => r.userId?.username || 'User')
      .join(', ') || '';
  };

  return (
    <div className="message-actions-container">
      <div className="message-actions-menu">
        <button
          className="action-btn emoji-btn"
          onClick={() => setShowReactions(!showReactions)}
          title="Ajouter une réaction"
        >
          😊
        </button>

        {showReactions && (
          <div className="reactions-popup">
            {emojis.map(emoji => (
              <button
                key={emoji}
                className={`reaction-opt ${hasReaction(emoji) ? 'active' : ''}`}
                onClick={() => handleReaction(emoji)}
                title={`${getReactionCount(emoji)} personne(s)`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {isOwnMessage && (
          <>
            <button
              className="action-btn"
              onClick={() => setShowActions(!showActions)}
              title="Plus d'options"
            >
              ⋮
            </button>

            {showActions && (
              <div className="actions-popup">
                {!isEditing && (
                  <>
                    <button
                      className="action-item edit-action"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Éditer
                    </button>
                    <button
                      className="action-item pin-action"
                      onClick={handlePin}
                    >
                      {message.isPinned ? '📌 Dépingler' : '📌 Épingler'}
                    </button>
                    {message.editHistory && message.editHistory.length > 0 && (
                      <button
                        className="action-item history-action"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        📜 Historique ({message.editHistory.length})
                      </button>
                    )}
                    <button
                      className="action-item delete-action"
                      onClick={handleDelete}
                    >
                      🗑️ Supprimer
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <div className="reactions-display">
            {[...new Set(message.reactions.map(r => r.emoji))].map(emoji => (
              <span 
                key={emoji} 
                className={`reaction-badge ${hasReaction(emoji) ? 'user-reacted' : ''}`}
                title={`Réaction des utilisateurs: ${getReactionUsers(emoji)}`}
              >
                {emoji}
                {getReactionCount(emoji) > 1 && (
                  <span className="reaction-count">{getReactionCount(emoji)}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {message.isEdited && (
          <span className="edited-badge">(édité)</span>
        )}
      </div>

      {isEditing && isOwnMessage && (
        <div className="edit-form">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="edit-input"
            rows="2"
          />
          <div className="edit-actions">
            <button
              className="save-btn"
              onClick={handleEdit}
              disabled={!editedContent.trim() || editedContent === message.content}
            >
              Enregistrer
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setEditedContent(message.content);
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {showHistory && message.editHistory && message.editHistory.length > 0 && (
        <div className="edit-history-panel">
          <div className="history-header">
            <h4>Historique des modifications</h4>
            <button 
              className="close-history-btn"
              onClick={() => setShowHistory(false)}
            >
              ✕
            </button>
          </div>
          <div className="history-content">
            {message.editHistory.map((edit, index) => (
              <div key={index} className="history-item">
                <div className="history-item-time">
                  {formatEditTime(edit.editedAt)}
                </div>
                <div className="history-item-content">
                  {edit.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageActions;
