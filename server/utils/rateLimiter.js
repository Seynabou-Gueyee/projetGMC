const logger = require('./logger');

/**
 * Rate limiter implementation using sliding window approach
 * Tracks messages per second per user
 */
class RateLimiter {
  constructor(maxMessagesPerSecond = 5, windowSizeMs = 1000) {
    this.maxMessagesPerSecond = maxMessagesPerSecond;
    this.windowSizeMs = windowSizeMs;
    this.userLimits = new Map();
    this.blockedUsers = new Set();
    this.blockDurationMs = 60000; // 1 minute default
  }

  /**
   * Check if user has exceeded rate limit
   * @param {string} userId - User ID
   * @param {number} weight - Message weight (1 = normal, 5 = file upload, etc)
   * @returns {object} { allowed: boolean, remainingAllowed: number, resetAt: timestamp }
   */
  checkLimit(userId, weight = 1) {
    const now = Date.now();

    // Check if user is blocked
    if (this.isUserBlocked(userId)) {
      return {
        allowed: false,
        remainingAllowed: 0,
        blocked: true,
        resetAt: this.userLimits.get(userId)?.blockedUntil || now + this.blockDurationMs,
        reason: 'USER_BLOCKED'
      };
    }

    // Initialize user data if not present
    if (!this.userLimits.has(userId)) {
      this.userLimits.set(userId, {
        messages: [],
        violations: 0,
        blockedUntil: null
      });
    }

    const userData = this.userLimits.get(userId);
    const messages = userData.messages;

    // Remove old messages outside the window
    while (messages.length > 0 && messages[0].timestamp < now - this.windowSizeMs) {
      messages.shift();
    }

    // Calculate current message count weighted
    const currentWeight = messages.reduce((sum, msg) => sum + msg.weight, 0);
    const allowedWeight = this.maxMessagesPerSecond;

    // Check if adding this message would exceed limit
    if (currentWeight + weight > allowedWeight) {
      userData.violations += 1;

      // Auto-block after 5 violations
      if (userData.violations >= 5) {
        this.blockUser(userId);
        logger.warn(`User ${userId} rate-limit blocked after 5 violations`);
        
        return {
          allowed: false,
          remainingAllowed: 0,
          blocked: true,
          resetAt: userData.blockedUntil,
          reason: 'RATE_LIMIT_EXCEEDED_USER_BLOCKED'
        };
      }

      const remainingTime = messages.length > 0 
        ? this.windowSizeMs - (now - messages[0].timestamp)
        : this.windowSizeMs;

      return {
        allowed: false,
        remainingAllowed: Math.max(0, allowedWeight - currentWeight),
        resetAt: now + remainingTime,
        resetInMs: remainingTime,
        reason: 'RATE_LIMIT_EXCEEDED',
        violations: userData.violations
      };
    }

    // Add message to tracking
    messages.push({
      timestamp: now,
      weight: weight
    });

    return {
      allowed: true,
      remainingAllowed: Math.floor(allowedWeight - currentWeight - weight),
      resetAt: now + this.windowSizeMs
    };
  }

  /**
   * Block a user from sending messages
   * @param {string} userId - User ID
   * @param {number} durationMs - Block duration in milliseconds
   */
  blockUser(userId, durationMs = undefined) {
    const duration = durationMs || this.blockDurationMs;
    const blockedUntil = Date.now() + duration;

    if (this.userLimits.has(userId)) {
      this.userLimits.get(userId).blockedUntil = blockedUntil;
    }

    this.blockedUsers.add(userId);

    // Auto-unblock after duration
    setTimeout(() => {
      this.unblockUser(userId);
    }, duration);

    logger.warn(`User ${userId} blocked for ${duration}ms`);
  }

  /**
   * Unblock a user
   * @param {string} userId - User ID
   */
  unblockUser(userId) {
    this.blockedUsers.delete(userId);

    if (this.userLimits.has(userId)) {
      const userData = this.userLimits.get(userId);
      userData.blockedUntil = null;
      userData.violations = 0; // Reset violations on unblock
    }

    logger.info(`User ${userId} unblocked`);
  }

  /**
   * Check if user is currently blocked
   * @param {string} userId - User ID
   * @returns {boolean}
   */
  isUserBlocked(userId) {
    if (!this.blockedUsers.has(userId)) {
      return false;
    }

    // Check if block duration has expired
    if (this.userLimits.has(userId)) {
      const userData = this.userLimits.get(userId);
      if (userData.blockedUntil && Date.now() >= userData.blockedUntil) {
        this.unblockUser(userId);
        return false;
      }
    }

    return true;
  }

  /**
   * Get user rate limit stats
   * @param {string} userId - User ID
   * @returns {object}
   */
  getUserStats(userId) {
    if (!this.userLimits.has(userId)) {
      return null;
    }

    const userData = this.userLimits.get(userId);
    return {
      messageCount: userData.messages.length,
      violations: userData.violations,
      blocked: this.isUserBlocked(userId),
      blockedUntil: userData.blockedUntil,
      allowedPerSecond: this.maxMessagesPerSecond
    };
  }

  /**
   * Reset specific user
   * @param {string} userId - User ID
   */
  resetUser(userId) {
    this.userLimits.delete(userId);
    this.blockedUsers.delete(userId);
  }

  /**
   * Clear all data (for testing/maintenance)
   */
  clear() {
    this.userLimits.clear();
    this.blockedUsers.clear();
  }
}

// Export singleton instance for app-wide use
module.exports = RateLimiter;
