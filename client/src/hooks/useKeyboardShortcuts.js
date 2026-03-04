import { useEffect, useCallback } from 'react';

// Définir les raccourcis disponibles
const KEYBOARD_SHORTCUTS = {
  'send_message': {
    keys: ['control', 'enter'], // Ctrl+Enter
    description: 'Envoyer le message',
    action: 'SEND_MESSAGE'
  },
  'new_line': {
    keys: ['shift', 'enter'], // Shift+Enter
    description: 'Nouvelle ligne',
    action: 'NEW_LINE'
  },
  'focus_search': {
    keys: ['control', 'f'], // Ctrl+F
    description: 'Rechercher',
    action: 'FOCUS_SEARCH'
  },
  'focus_input': {
    keys: ['control', 'shift', 'm'], // Ctrl+Shift+M
    description: 'Focus sur l\'input de message',
    action: 'FOCUS_INPUT'
  },
  'escape': {
    keys: ['escape'],
    description: 'Fermer',
    action: 'CLOSE'
  },
  'next_conversation': {
    keys: ['control', 'tab'],
    description: 'Conversation suivante',
    action: 'NEXT_CONVERSATION'
  },
  'previous_conversation': {
    keys: ['control', 'shift', 'tab'],
    description: 'Conversation précédente',
    action: 'PREVIOUS_CONVERSATION'
  },
  'toggle_sidebar': {
    keys: ['control', 'b'],
    description: 'Afficher/masquer la barre latérale',
    action: 'TOGGLE_SIDEBAR'
  },
  'emoji_picker': {
    keys: ['control', 'e'],
    description: 'Ouvrir le sélecteur d\'emoji',
    action: 'TOGGLE_EMOJI_PICKER'
  },
  'file_upload': {
    keys: ['control', 'shift', 'u'],
    description: 'Uploader un fichier',
    action: 'TOGGLE_FILE_UPLOADER'
  }
};

/**
 * Hook pour gérer les raccourcis clavier
 * @param {function} onShortcut - Callback quand un raccourci est détecté
 * @param {boolean} enabled - Activer/désactiver les raccourcis
 */
export const useKeyboardShortcuts = (onShortcut, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const pressedKeys = [];
      
      if (event.ctrlKey || event.metaKey) pressedKeys.push('control');
      if (event.shiftKey) pressedKeys.push('shift');
      if (event.altKey) pressedKeys.push('alt');
      
      // Ajouter la clé pressée
      const key = event.key.toLowerCase();
      pressedKeys.push(key);

      // Vérifier chaque raccourci
      for (const [shortcutName, shortcut] of Object.entries(KEYBOARD_SHORTCUTS)) {
        if (keysMatch(pressedKeys, shortcut.keys)) {
          event.preventDefault();
          onShortcut({
            action: shortcut.action,
            name: shortcutName,
            keys: shortcut.keys
          });
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onShortcut, enabled]);
};

/**
 * Vérifier si les touches pressées correspondent aux touches du raccourci
 */
const keysMatch = (pressed, shortcutKeys) => {
  if (pressed.length !== shortcutKeys.length) return false;
  return shortcutKeys.every(key => pressed.includes(key));
};

/**
 * Obtenir la liste de tous les raccourcis
 */
export const getShortcutsList = () => {
  return Object.entries(KEYBOARD_SHORTCUTS).map(([name, data]) => ({
    name,
    keys: data.keys,
    description: data.description,
    action: data.action,
    display: formatKeys(data.keys)
  }));
};

/**
 * Formater les touches pour l'affichage
 */
export const formatKeys = (keys) => {
  const keyMap = {
    'control': 'Ctrl',
    'shift': 'Shift',
    'alt': 'Alt',
    'meta': 'Cmd',
    'enter': 'Enter',
    'escape': 'Esc',
    'tab': 'Tab',
    'e': 'E',
    'f': 'F',
    'm': 'M',
    'b': 'B',
    'u': 'U'
  };

  return keys.map(key => keyMap[key] || key.toUpperCase()).join('+');
};

/**
 * Composant pour afficher la liste des raccourcis
 */
export const KeyboardShortcutsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = getShortcutsList();

  return (
    <div className="keyboard-shortcuts-overlay" onClick={onClose}>
      <div className="keyboard-shortcuts-panel" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h3>⌨️ Raccourcis clavier</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="shortcuts-list">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.name} className="shortcut-item">
              <div className="shortcut-description">{shortcut.description}</div>
              <div className="shortcut-keys">{shortcut.display}</div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <small>💡 Conseil: Utilisez ? pour afficher cette aide</small>
        </div>
      </div>
    </div>
  );
};

export default KEYBOARD_SHORTCUTS;
