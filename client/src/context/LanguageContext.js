import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Traductions
const translations = {
  fr: {
    // Navigation
    'nav.conversations': 'Conversations',
    'nav.rooms': 'Salons',
    'nav.groups': 'Groupes',
    'nav.messages': 'Messages',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    
    // Messages
    'message.send': 'Envoyer',
    'message.typing': 'tape...',
    'message.edited': '(édité)',
    'message.deleted': 'Message supprimé',
    'message.pinned': 'Message épinglé',
    'message.delivered': 'Livré',
    'message.read': 'Lu',
    
    // Statut
    'status.online': 'En ligne',
    'status.offline': 'Hors ligne',
    'status.away': 'Absent',
    'status.last_seen': 'Vu pour la dernière fois',
    
    // Auth
    'auth.login': 'Connexion',
    'auth.register': 'Inscription',
    'auth.username': 'Nom d\'utilisateur',
    'auth.password': 'Mot de passe',
    'auth.email': 'Email',
    
    // Errors
    'error.required_field': 'Champ requis',
    'error.invalid_email': 'Email invalide',
    'error.password_short': 'Le mot de passe doit contenir au moins 6 caractères',
    'error.connection_failed': 'Erreur de connexion',
    
    // Bot
    'bot.help': 'Aide',
    'bot.commands': 'Commandes disponibles',
    'bot.auto_reply': 'Réponse automatique',
    
    // Statistiques
    'stats.messages_today': 'Messages aujourd\'hui',
    'stats.active_users': 'Utilisateurs actifs',
    'stats.message_count': 'Total de messages',
  },
  
  en: {
    // Navigation
    'nav.conversations': 'Conversations',
    'nav.rooms': 'Rooms', 
    'nav.groups': 'Groups',
    'nav.messages': 'Messages',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Messages
    'message.send': 'Send',
    'message.typing': 'typing...',
    'message.edited': '(edited)',
    'message.deleted': 'Message deleted',
    'message.pinned': 'Pinned message',
    'message.delivered': 'Delivered',
    'message.read': 'Read',
    
    // Status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.away': 'Away',
    'status.last_seen': 'Last seen',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.email': 'Email',
    
    // Errors
    'error.required_field': 'Required field',
    'error.invalid_email': 'Invalid email',
    'error.password_short': 'Password must be at least 6 characters',
    'error.connection_failed': 'Connection error',
    
    // Bot
    'bot.help': 'Help',
    'bot.commands': 'Available commands',
    'bot.auto_reply': 'Auto-reply',
    
    // Statistics
    'stats.messages_today': 'Messages today',
    'stats.active_users': 'Active users',
    'stats.message_count': 'Total messages',
  },
  
  es: {
    // Navigation
    'nav.conversations': 'Conversaciones',
    'nav.rooms': 'Salas',
    'nav.groups': 'Grupos',
    'nav.messages': 'Mensajes',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',
    
    // Messages
    'message.send': 'Enviar',
    'message.typing': 'escribiendo...',
    'message.edited': '(editado)',
    'message.deleted': 'Mensaje eliminado',
    'message.pinned': 'Mensaje fijado',
    'message.delivered': 'Entregado',
    'message.read': 'Leído',
    
    // Status
    'status.online': 'En línea',
    'status.offline': 'Desconectado',
    'status.away': 'Ausente',
    'status.last_seen': 'Visto por última vez',
    
    // Auth
    'auth.login': 'Iniciar sesión',
    'auth.register': 'Registrarse',
    'auth.username': 'Nombre de usuario',
    'auth.password': 'Contraseña',
    'auth.email': 'Correo electrónico',
    
    // Errors
    'error.required_field': 'Campo requerido',
    'error.invalid_email': 'Email inválido',
    'error.password_short': 'La contraseña debe tener al menos 6 caracteres',
    'error.connection_failed': 'Error de conexión',
    
    // Bot
    'bot.help': 'Ayuda',
    'bot.commands': 'Comandos disponibles',
    'bot.auto_reply': 'Respuesta automática',
    
    // Statistics
    'stats.messages_today': 'Mensajes hoy',
    'stats.active_users': 'Usuarios activos',
    'stats.message_count': 'Total de mensajes',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key, fallback = key) => {
    return translations[language]?.[key] || translations['fr']?.[key] || fallback;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    t,
    changeLanguage,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
