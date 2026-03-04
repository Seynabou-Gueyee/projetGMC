import React, { useState, useEffect } from 'react';
import './PinnedMessages.css';

const PinnedMessages = ({ messages, isOpen, onClose, socket, room, currentUserId }) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'oldest'

  useEffect(() => {
    let pinned = messages.filter(msg => msg.isPinned && !msg.isDeleted);
    
    // Tri
    if (sortBy === 'oldest') {
      pinned = pinned.reverse();
    }
    
    setPinnedMessages(pinned);
  }, [messages, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="pinned-messages-overlay">
      <div className="pinned-messages-panel">
        <div className="pinned-header">
          <h3>📌 Messages épinglés ({pinnedMessages.length})</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="pinned-content">
          {pinnedMessages.length === 0 ? (
            <p className="no-pinned">Aucun message épinglé</p>
          ) : (
            pinnedMessages.map((msg) => (
              <div key={msg._id} className="pinned-item">
                <div className="pinned-item-header">
                  <span className="pinned-user">{msg.senderName}</span>
                  <span className="pinned-time">
                    {new Date(msg.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="pinned-item-content">{msg.content}</p>
                {msg.isEdited && (
                  <span className="edited-badge">(édité)</span>
                )}
                {msg.sender?._id === currentUserId && (
                  <button
                    className="unpin-btn"
                    onClick={() => {
                      if (socket) {
                        socket.emit('unpin_message', {
                          messageId: msg._id,
                          room: room._id || room.id
                        });
                      }
                    }}
                  >
                    Dépingler
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PinnedMessages;
