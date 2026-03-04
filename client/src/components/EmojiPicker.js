import React, { useState, useRef, useEffect } from 'react';
import './EmojiPicker.css';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [searchTerm, setSearchTerm] = useState('');
  const pickerRef = useRef(null);

  const emojiCategories = {
    smileys: {
      name: '😀 Smileys',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤮', '🤧', '🤬', '🤡', '😈', '👿', '💀', '☠️', '💩', '🤓', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤓', '😈', '👿', '💀']
    },
    nature: {
      name: '🌿 Nature',
      emojis: ['🌳', '🌲', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🎍', '🎎', '🍃', '🍂', '🍁', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑', '🦐', '🐙', '🦐', '🐠', '🐟', '🐡', '🦈', '🐢', '🐙', '🦐', '🦞', '🦀', '🐡', '🐬', '🐳', '🐋', '🦭', '🦀', '🦞', '🦐', '🦑', '🦐', '🐸', '🐢', '🐙', '🦗', '🦟', '🦠']
    },
    food: {
      name: '🍔 Aliments',
      emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍞', '🥐', '🥖', '🥨', '🥯', '🧀', '🥞', '🧈', '🥚', '🍳', '🧆', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥠', '🥮', '🍡', '🥟', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃']
    },
    sports: {
      name: '⚽ Sports',
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🏒', '🏑', '⛳', '🥅', '🪃', '🏏', '🛝', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎣', '🎽', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎯', '🪀', '🪃', '🎣', '🎪', '🎨', '🎭', '🎬']
    },
    objects: {
      name: '💡 Objets',
      emojis: ['🎀', '🎁', '🎂', '🎄', '🎆', '🎇', '✨', '🎉', '🎊', '🎈', '🎌', '🏮', '🎏', '🎎', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🧷', '🧷', '🧷', '🔖', '🧷', '💰', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '🏷️']
    },
    symbols: {
      name: '❤️ Symboles',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🤜', '🤛', '🦾', '🦿', '👂', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👅']
    }
  };

  const stickers = [
    '🔥', '💯', '✅', '❌', '⭐', '🌟', '✨', '⚡', '💥', '🎯', '🚀', '💪', '🙌', '👏', '🤝', '😂', '🤔', '😍', '😱', '🤯', '😈', '👻', '💀', '🤡', '😜', '😎', '🥳', '🤗', '😘', '💋'
  ];

  const allEmojis = Object.values(emojiCategories).flatMap(cat => cat.emojis);

  const filteredEmojis = searchTerm
    ? allEmojis.filter((emoji, index, arr) => arr.indexOf(emoji) === index)
    : selectedCategory === 'stickers'
      ? stickers
      : emojiCategories[selectedCategory]?.emojis || [];

  const handleClickOutside = (e) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="emoji-picker" ref={pickerRef}>
      <div className="emoji-picker-header">
        <input
          type="text"
          placeholder="Rechercher un emoji..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="emoji-search"
          autoFocus
        />
        <button className="close-picker" onClick={() => onClose?.()}>✕</button>
      </div>

      <div className="emoji-categories">
        {Object.entries(emojiCategories).map(([key, category]) => (
          <button
            key={key}
            className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(key);
              setSearchTerm('');
            }}
            title={category.name}
          >
            {category.name.charAt(0)}
          </button>
        ))}
        <button
          className={`category-tab ${selectedCategory === 'stickers' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('stickers');
            setSearchTerm('');
          }}
          title="Stickers"
        >
          🎫
        </button>
      </div>

      <div className="emoji-grid">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={index}
            className="emoji-item"
            onClick={() => {
              onEmojiSelect?.(emoji);
              onClose?.();
            }}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {filteredEmojis.length === 0 && (
        <div className="no-emojis">Aucun emoji trouvé</div>
      )}
    </div>
  );
};

export default EmojiPicker;
