import React, { useState, useEffect } from 'react';
import './ResponseSuggestions.css';

const ResponseSuggestions = ({ lastMessage, onSuggestionSelected }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (lastMessage && lastMessage.senderName !== 'Vous') {
      // Appeler le serveur pour obtenir les suggestions
      fetchSuggestions(lastMessage.content);
    }
  }, [lastMessage]);

  const fetchSuggestions = async (messageContent) => {
    try {
      const response = await fetch('/api/bot/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageContent: messageContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setIsVisible(true);

        // Masquer automatiquement après 10 secondes
        setTimeout(() => setIsVisible(false), 10000);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des suggestions:', err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelected(suggestion);
    setIsVisible(false);
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="response-suggestions">
      <div className="suggestions-header">
        <span className="suggestions-title">🧠 Suggestions IA</span>
        <button 
          className="suggestions-close"
          onClick={() => setIsVisible(false)}
        >
          ✕
        </button>
      </div>
      <div className="suggestions-list">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            className="suggestion-item"
            onClick={() => handleSuggestionClick(suggestion)}
            title="Cliquer pour utiliser cette réponse"
          >
            <span className="suggestion-text">{suggestion}</span>
            <span className="suggestion-icon">→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResponseSuggestions;
