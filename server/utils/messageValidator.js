const logger = require('./logger');

// List of profanity/blocked words (can be expanded)
const BLOCKED_WORDS = [
  'badword1', 'badword2', 'spam', 'scam'
];

// Message validation rules
const VALIDATION_RULES = {
  minLength: 1,
  maxLength: 5000,
  maxConsecutiveRepeats: 3,
  maxCapitalLettersRatio: 0.8, // 80% capitals = spam
  minTimeBetweenMessages: 500 // milliseconds
};

/**
 * Validates message content against spam and content rules
 * @param {string} content - Message content to validate
 * @param {object} userStats - User's message statistics
 * @returns {object} { isValid, errors: [] }
 */
const validateMessage = (content, userStats = {}) => {
  const errors = [];

  // 1. Check content length
  if (!content || content.trim().length === 0) {
    errors.push('MESSAGE_EMPTY');
  }
  
  if (content.length < VALIDATION_RULES.minLength) {
    errors.push('MESSAGE_TOO_SHORT');
  }
  
  if (content.length > VALIDATION_RULES.maxLength) {
    errors.push(`MESSAGE_TOO_LONG_MAX_${VALIDATION_RULES.maxLength}`);
  }

  // 2. Check for profanity/blocked words
  const hasBlockedWords = BLOCKED_WORDS.some(word => 
    content.toLowerCase().includes(word.toLowerCase())
  );
  
  if (hasBlockedWords) {
    errors.push('CONTAINS_BLOCKED_WORDS');
  }

  // 3. Check for excessive capital letters (SPAM INDICATION)
  const capitalLetters = (content.match(/[A-Z]/g) || []).length;
  const totalLetters = (content.match(/[a-zA-Z]/g) || []).length;
  
  if (totalLetters > 0) {
    const capitalRatio = capitalLetters / totalLetters;
    if (capitalRatio > VALIDATION_RULES.maxCapitalLettersRatio) {
      errors.push('EXCESSIVE_CAPITALS');
    }
  }

  // 4. Check for consecutive character repeats (aaaaaaa)
  const hasExcessiveRepeats = /(.)\1{3,}/.test(content);
  if (hasExcessiveRepeats) {
    errors.push('EXCESSIVE_REPEATS');
  }

  // 5. Check for URL spam patterns
  const urlCount = (content.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) {
    errors.push('TOO_MANY_URLS');
  }

  // 6. Check for duplicate messages (user spam)
  if (userStats.lastMessage === content.trim()) {
    errors.push('DUPLICATE_MESSAGE');
  }

  // 7. Check for rapid-fire messages
  if (userStats.lastMessageTime) {
    const timeDiff = Date.now() - userStats.lastMessageTime;
    if (timeDiff < VALIDATION_RULES.minTimeBetweenMessages) {
      errors.push(`MESSAGE_TOO_FREQUENT_WAIT_${VALIDATION_RULES.minTimeBetweenMessages}ms`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    sanitized: sanitizeContent(content)
  };
};

/**
 * Sanitizes message content (removes potentially harmful content)
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
const sanitizeContent = (content) => {
  let sanitized = content;

  // Remove script tags
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '');

  // Remove HTML tags (basic)
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Gets user's message stats for rate limiting checks
 * @param {string} userId - User ID
 * @param {object} messageHistory - Message history object
 * @returns {object} User statistics
 */
const getUserMessageStats = (userId, messageHistory = {}) => {
  if (!messageHistory[userId]) {
    messageHistory[userId] = {
      messages: [],
      lastMessage: null,
      lastMessageTime: null,
      messageCount: 0,
      warnings: 0,
      blocked: false
    };
  }

  return messageHistory[userId];
};

/**
 * Updates user message stats
 * @param {string} userId - User ID
 * @param {string} content - Message content
 * @param {object} messageHistory - Message history object
 */
const updateUserStats = (userId, content, messageHistory = {}) => {
  const stats = getUserMessageStats(userId, messageHistory);
  
  stats.lastMessage = content.trim();
  stats.lastMessageTime = Date.now();
  stats.messages.push({
    content: content,
    timestamp: Date.now()
  });
  
  // Keep only last 100 messages for memory efficiency
  if (stats.messages.length > 100) {
    stats.messages.shift();
  }
  
  stats.messageCount++;
};

/**
 * Add warning to user (for repeated violations)
 * @param {string} userId - User ID
 * @param {object} messageHistory - Message history object
 * @returns {object} Updated user stats
 */
const addUserWarning = (userId, messageHistory = {}) => {
  const stats = getUserMessageStats(userId, messageHistory);
  stats.warnings += 1;
  
  // Auto-block after 3 warnings
  if (stats.warnings >= 3) {
    stats.blocked = true;
    logger.warn(`User ${userId} blocked after 3 warnings`);
  }
  
  return stats;
};

/**
 * Check if user is blocked
 * @param {string} userId - User ID
 * @param {object} messageHistory - Message history object
 * @returns {boolean}
 */
const isUserBlocked = (userId, messageHistory = {}) => {
  const stats = getUserMessageStats(userId, messageHistory);
  return stats.blocked;
};

module.exports = {
  validateMessage,
  sanitizeContent,
  getUserMessageStats,
  updateUserStats,
  addUserWarning,
  isUserBlocked,
  BLOCKED_WORDS,
  VALIDATION_RULES
};
