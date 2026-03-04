import React, { useState, useEffect, useRef } from 'react';
import './Mentions.css';

/**
 * Composant pour les autocomplétions de mentions
 */
export const MentionAutoComplete = ({ 
  users, 
  onSelect, 
  isOpen,
  searchTerm,
  position 
}) => {
  if (!isOpen || !searchTerm) return null;

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredUsers.length === 0) {
    return (
      <div className="mention-suggestions" style={position}>
        <div className="no-results">Aucun utilisateur trouvé</div>
      </div>
    );
  }

  return (
    <div className="mention-suggestions" style={position}>
      {filteredUsers.slice(0, 5).map(user => (
        <div
          key={user._id || user.id}
          className="mention-item"
          onClick={() => onSelect(user)}
        >
          <span className="mention-avatar">👤</span>
          <div className="mention-info">
            <div className="mention-username">@{user.username}</div>
            {user.email && <div className="mention-email">{user.email}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Hook pour gérer les mentions dans un textarea
 */
export const useMentions = (users = []) => {
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const { value, selectionStart } = e.target;
    
    // Chercher le dernier @
    const lastAtIndex = value.lastIndexOf('@', selectionStart - 1);
    
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1, selectionStart);
      
      // Si c'est juste des caractères valides après @
      if (!afterAt.includes(' ') && !afterAt.includes('@')) {
        setMentionSearch(afterAt);
        setShowMentions(true);
        
        // Calculer la position
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setMentionPosition({
            top: rect.bottom,
            left: rect.left
          });
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    if (!inputRef.current) return;

    const textarea = inputRef.current;
    const { value, selectionStart } = textarea;
    
    // Trouver le dernier @
    const lastAtIndex = value.lastIndexOf('@', selectionStart - 1);
    
    if (lastAtIndex !== -1) {
      const before = value.substring(0, lastAtIndex);
      const after = value.substring(selectionStart);
      const mention = `@${user.username}`;
      
      const newValue = before + mention + ' ' + after;
      textarea.value = newValue;
      
      // Déclencher un changement
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Focus et positionner le curseur
      const newCursorPos = before.length + mention.length + 1;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      
      setShowMentions(false);
      setMentionSearch('');
    }
  };

  return {
    mentionSearch,
    showMentions,
    setShowMentions,
    mentionPosition,
    inputRef,
    handleInputChange,
    insertMention
  };
};

/**
 * Extraire les mentions d'un texte
 */
export const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  return mentions;
};

/**
 * Remplacer les mentions par des tags HTML
 */
export const renderMentionedText = (text) => {
  const mentions = extractMentions(text);
  
  if (mentions.length === 0) return text;

  let result = [];
  let lastIndex = 0;

  mentions.forEach(mention => {
    // Ajouter le texte avant la mention
    if (mention.startIndex > lastIndex) {
      result.push(text.substring(lastIndex, mention.startIndex));
    }

    // Ajouter la mention en tant que tag
    result.push(
      <span key={mention.startIndex} className="mention-tag">
        @{mention.username}
      </span>
    );

    lastIndex = mention.endIndex;
  });

  // Ajouter le texte restant
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
};

export default MentionAutoComplete;
