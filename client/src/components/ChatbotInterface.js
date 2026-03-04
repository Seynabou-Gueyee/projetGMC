import React, { useState, useEffect, useRef } from 'react';
import './ChatbotInterface.css';

const ChatbotInterface = ({ token, currentRoom, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [commands, setCommands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const messagesEndRef = useRef(null);

  // Charger les commandes disponibles au montage
  useEffect(() => {
    fetchBotCommands();
    // Message initial
    setMessages([
      {
        id: 'initial',
        content: 'Bonjour! 👋 Je suis TalkMeBot. Comment puis-je vous aider? Tapez / pour voir les commandes.',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Récupérer les commandes disponibles
  const fetchBotCommands = async () => {
    try {
      const response = await fetch('/api/bot/commands');
      const data = await response.json();
      if (data.success) {
        setCommands(data.commands);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  // Envoyer un message au bot
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Sauvegarder le message avant de vider l'input
    const messageContent = inputValue;

    const userMessage = {
      id: Date.now(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch('/api/bot/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          command: messageContent,
          room: currentRoom
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const botMessage = {
          id: `bot_${Date.now()}`,
          content: data.response.content,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);

        // Obtenir les suggestions pour la réponse du bot
        if (messageContent.trim()) {
          fetchSuggestions(messageContent);
        }
      } else if (response.ok && data.response) {
        // Réponse valide du bot même sans success flag
        const botMessage = {
          id: `bot_${Date.now()}`,
          content: data.response.content || data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Si ce n'est pas une commande, c'est un message normal
        const fallbackMessage = {
          id: `bot_${Date.now()}`,
          content: '🤖 Je n\'ai pas reconnu cette commande. Tapez / pour voir les commandes disponibles.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      const errorMessage = {
        id: `bot_${Date.now()}`,
        content: '❌ Erreur de connexion avec le bot: ' + error.message,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir les suggestions de réponse
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

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Erreur suggestions:', error);
    }
  };

  // Exécuter une commande depuis la liste
  const executeCommand = (command) => {
    setInputValue(command);
    setShowCommands(false);
    // Déclencher l'envoi immédiatement
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true });
      const form = document.querySelector('.chatbot-input-form');
      if (form) {
        form.dispatchEvent(event);
      }
    }, 0);
  };

  // Utiliser une suggestion (pas un hook React, juste une fonction)
  const applySuggestion = (suggestion) => {
    setInputValue(suggestion);
    setSuggestions([]);
  };

  if (!isOpen) {
    return (
      <button 
        className="chatbot-toggle-btn"
        onClick={() => setIsOpen(true)}
        title="Ouvrir le chatbot"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>TalkMeBot 🤖</h3>
        <button 
          className="chatbot-close-btn"
          onClick={() => setIsOpen(false)}
          title="Fermer"
        >
          ✕
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chatbot-message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}
          >
            <div className="message-content">
              <p>{msg.content}</p>
            </div>
            <span className="message-time">
              {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="chatbot-message bot-message loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions-container">
          <p className="suggestions-label">💡 Suggestions:</p>
          <div className="suggestions-list">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="suggestion-btn"
                onClick={() => applySuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCommands && (
        <div className="commands-container">
          <p className="commands-label">📋 Commandes disponibles:</p>
          <div className="commands-list">
            {commands.map((cmd, idx) => (
              <button
                key={idx}
                className="command-btn"
                onClick={() => executeCommand(cmd.command)}
                title={cmd.description}
              >
                <span className="command-name">{cmd.command}</span>
                <span className="command-desc">{cmd.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="chatbot-input-form" onSubmit={handleSendMessage}>
        <button
          type="button"
          className="command-toggle-btn"
          onClick={() => setShowCommands(!showCommands)}
          title="Afficher les commandes"
        >
          /
        </button>
        <input
          type="text"
          className="chatbot-input"
          placeholder="Tapez votre message ou / pour les commandes..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chatbot-send-btn"
          disabled={isLoading || !inputValue.trim()}
          title="Envoyer"
        >
          📤
        </button>
      </form>
    </div>
  );
};

export default ChatbotInterface;
