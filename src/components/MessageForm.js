import React, { useState } from 'react';
import './MessageForm.css';

const MessageForm = ({ onSendMessage, disabled = false, placeholder = "Écrivez un message..." }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || disabled) {
      return;
    }

    setLoading(true);

    try {
      if (onSendMessage) {
        await onSendMessage(message);
      }
      setMessage('');
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Envoyer avec Entrée (sans Shift)
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        maxLength="500"
        rows="3"
        className="message-input"
      />
      
      <div className="form-footer">
        <small className="char-count">
          {message.length}/500
        </small>
        <button 
          type="submit" 
          disabled={loading || disabled || !message.trim()}
          className="send-button"
        >
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
