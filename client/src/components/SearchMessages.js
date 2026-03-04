import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SearchMessages.css';

const SearchMessages = ({ token, room, onSearchResults, isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const debounceTimer = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    debounceTimer.current = setTimeout(async () => {
      try {
        const url = `http://localhost:5000/api/messages/search?query=${encodeURIComponent(searchQuery)}&room=${room._id}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setResults(response.data.messages);
        onSearchResults(response.data.messages);
      } catch (err) {
        setError('Erreur lors de la recherche');
        console.error('Erreur de recherche:', err);
      } finally {
        setLoading(false);
      }
    }, 500); // Attendre 500ms après que l'utilisateur arrête de taper
  }, [searchQuery, token, room._id, onSearchResults]);

  const handleSearch = async (e) => {
    e.preventDefault();
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="search-messages-overlay">
      <div className="search-messages-modal">
        <div className="search-header">
          <h3>Rechercher dans les messages</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Rechercher des messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? 'Recherche...' : 'Chercher'}
          </button>
        </form>

        {error && <div className="search-error">{error}</div>}

        <div className="search-results">
          {searchQuery && (
            <div className="search-stats">
              {loading ? (
                <p>Recherche en cours...</p>
              ) : (
                <p>
                  {results.length > 0
                    ? `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`
                    : 'Aucun résultat trouvé'}
                </p>
              )}
            </div>
          )}

          {results.length === 0 && searchQuery && !loading && (
            <p className="no-results">Aucun message ne correspond à votre recherche</p>
          )}

          {results.map((msg, index) => (
            <div key={index} className="search-result-item">
              <div className="result-header">
                <span className="result-user">{msg.senderName}</span>
                <span className="result-time">
                  {new Date(msg.createdAt).toLocaleString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
              </div>
              <p className="result-content">
                {highlightText(msg.content, searchQuery)}
              </p>
              {msg.isEdited && (
                <span className="result-edited">(édité)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchMessages;
