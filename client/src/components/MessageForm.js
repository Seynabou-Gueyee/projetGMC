import React, { useState, useEffect, useRef } from 'react';
import FileUploader from './FileUploader';
import EmojiPicker from './EmojiPicker';
import LinkPreview from './LinkPreview';
import './MessageForm.css';

const MessageForm = ({ onSendMessage, disabled = false, placeholder = "Écrivez un message...", socket, room }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [linkPreview, setLinkPreview] = useState(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Détecter les URLs dans le message
  const extractLinkPreview = async (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    
    if (matches && matches.length > 0) {
      const url = matches[0];
      try {
        // Appel à un service pour récupérer les métadonnées
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const preview = await response.json();
          setLinkPreview(preview);
        }
      } catch (err) {
        console.error('Erreur récupération aperçu:', err);
      }
    } else {
      setLinkPreview(null);
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    
    // Chercher les URLs
    extractLinkPreview(text);
    
    // Émettre l'événement typing
    if (socket && room) {
      socket.emit('user_typing', { room: room._id || room.id });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('user_stopped_typing', { room: room._id || room.id });
      }, 2000);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((!message.trim() && selectedFiles.length === 0) || disabled) {
      return;
    }

    setLoading(true);
    
    if (socket && room) {
      socket.emit('user_stopped_typing', { room: room._id || room.id });
    }

    try {
      const messageData = {
        content: message,
        attachments: selectedFiles,
        linkPreview: linkPreview
      };

      if (onSendMessage) {
        await onSendMessage(messageData);
      }
      
      setMessage('');
      setSelectedFiles([]);
      setLinkPreview(null);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !loading) {
      handleSubmit(e);
    }
  };

  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      {/* Aperçu du lien */}
      {linkPreview && (
        <LinkPreview 
          preview={linkPreview} 
          onRemove={() => setLinkPreview(null)}
        />
      )}

      {/* Fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="selected-files-preview">
          <div className="files-preview-header">
            <span>📎 {selectedFiles.length} fichier(s) sélectionné(s)</span>
            <button 
              type="button" 
              className="clear-files-btn"
              onClick={() => setSelectedFiles([])}
            >
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* Upload de fichiers */}
      {showFileUploader && (
        <FileUploader 
          onFilesSelected={handleFilesSelected}
          maxSize={50 * 1024 * 1024}
        />
      )}

      {/* Zone de saisie et actions */}
      <div className="form-content">
        <textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          maxLength="5000"
          rows="3"
          className="message-input"
        />
        
        <div className="form-actions">
          <div className="action-buttons">
            <button
              type="button"
              className="action-btn emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled || loading}
              title="Ajouter un emoji"
            >
              😀
            </button>

            <button
              type="button"
              className="action-btn file-btn"
              onClick={() => setShowFileUploader(!showFileUploader)}
              disabled={disabled || loading}
              title="Ajouter des fichiers"
            >
              📎
            </button>

            {showEmojiPicker && (
              <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
                <EmojiPicker 
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          <div className="form-footer">
            <small className="char-count">
              {message.length}/5000
            </small>
            <button 
              type="submit" 
              disabled={loading || disabled || (message.trim().length === 0 && selectedFiles.length === 0)}
              className="send-button"
            >
              {loading ? '⏳' : '📤'} {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default MessageForm;
