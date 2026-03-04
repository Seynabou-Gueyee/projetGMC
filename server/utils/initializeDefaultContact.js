/**
 * Initialiser le contact par défaut "Support"
 * Exécuté au démarrage du serveur
 */

const User = require('../models/User');
const logger = require('./logger');

const DEFAULT_CONTACT = {
  username: 'Support',
  email: 'support@talkme.local',
  password: 'support_default_password_change_me',
  status: 'online',
  statusMessage: '👋 Bienvenue! Comment puis-je t\'aider?',
  role: 'admin',
  avatar: '🤖',
  bio: 'Support TalkMe - Disponible 24/7'
};

/**
 * Créer ou vérifier l'existence du contact par défaut
 */
async function initializeDefaultContact() {
  try {
    // Vérifier si le contact existe déjà
    let supportUser = await User.findOne({ username: 'Support' });
    
    if (!supportUser) {
      // Créer le contact par défaut
      supportUser = await User.create(DEFAULT_CONTACT);
      logger.info(`📞 Contact Support créé avec succès | {"userId":"${supportUser._id}"}`);
      return { created: true, user: supportUser };
    } else {
      logger.info(`✓ Contact Support trouvé | {"userId":"${supportUser._id}"}`);
      return { created: false, user: supportUser };
    }
  } catch (error) {
    // Si erreur d'unicité (email/username déjà utilisé)
    if (error.code === 11000) {
      logger.warn('⚠️ Contact Support existe déjà');
      const supportUser = await User.findOne({ username: 'Support' });
      return { created: false, user: supportUser };
    }
    logger.error('❌ Erreur création contact Support', { error: error.message });
    throw error;
  }
}

module.exports = { initializeDefaultContact, DEFAULT_CONTACT };
