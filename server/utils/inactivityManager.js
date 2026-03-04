const logger = require('./logger');

/**
 * Manages user session timeouts based on inactivity
 * Automatically disconnects users after specified inactivity period
 */
class InactivityManager {
  constructor(inactivityTimeoutMs = 1800000) { // 30 minutes default
    this.inactivityTimeoutMs = inactivityTimeoutMs;
    this.userSessions = new Map();
    this.inactivityTimers = new Map();
  }

  /**
   * Create/update user session
   * @param {string} userId - User ID
   * @param {string} socketId - Socket ID
   * @param {object} sessionData - Additional session data
   */
  createSession(userId, socketId, sessionData = {}) {
    this.userSessions.set(userId, {
      socketId: socketId,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      sessionData: sessionData,
      warnings: 0
    });

    // Start inactivity timer
    this.resetInactivityTimer(userId);

    logger.info(`Session created for user ${userId}`);
  }

  /**
   * Record user activity
   * @param {string} userId - User ID
   */
  recordActivity(userId) {
    const session = this.userSessions.get(userId);
    if (session) {
      session.lastActivityAt = Date.now();
      
      // Reset the inactivity timer on activity
      this.resetInactivityTimer(userId);
    }
  }

  /**
   * Reset inactivity timer for user
   * @param {string} userId - User ID
   * @returns {void}
   */
  resetInactivityTimer(userId) {
    // Clear existing timer
    if (this.inactivityTimers.has(userId)) {
      clearTimeout(this.inactivityTimers.get(userId));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.handleUserTimeout(userId);
    }, this.inactivityTimeoutMs);

    this.inactivityTimers.set(userId, timer);

    // Optional: Warn user at 80% of inactivity period
    const warningTimer = setTimeout(() => {
      this.warnUserAboutInactivity(userId);
    }, this.inactivityTimeoutMs * 0.8);

    // Store warning timer separately
    if (!this.warningTimers) {
      this.warningTimers = new Map();
    }
    
    if (this.warningTimers.has(userId)) {
      clearTimeout(this.warningTimers.get(userId));
    }
    this.warningTimers.set(userId, warningTimer);
  }

  /**
   * Handle user session timeout
   * @param {string} userId - User ID
   * @returns {object} Timeout session data
   */
  handleUserTimeout(userId) {
    const session = this.userSessions.get(userId);
    
    if (!session) {
      return null;
    }

    const inactiveFor = Date.now() - session.lastActivityAt;

    logger.warn(`User ${userId} session timed out after ${inactiveFor}ms of inactivity`);

    // Store timeout info for reference
    const timeoutData = {
      userId: userId,
      socketId: session.socketId,
      timeoutAt: Date.now(),
      inactiveFor: inactiveFor,
      sessionDuration: Date.now() - session.createdAt,
      lastActivityAt: session.lastActivityAt
    };

    // Remove session
    this.endSession(userId);

    return timeoutData;
  }

  /**
   * Warn user about upcoming inactivity timeout
   * @param {string} userId - User ID
   */
  warnUserAboutInactivity(userId) {
    const session = this.userSessions.get(userId);
    
    if (session) {
      session.warnings = (session.warnings || 0) + 1;
      
      const remainingTime = this.inactivityTimeoutMs - 
        (Date.now() - session.lastActivityAt);
      
      logger.info(`Warning sent to user ${userId}: session will timeout in ${remainingTime}ms`);

      // Return warning info that can be emitted to client
      return {
        userId: userId,
        warning: 'INACTIVITY_WARNING',
        remainingTimeMs: Math.max(0, remainingTime),
        message: `Your session will be disconnected due to inactivity in ${Math.ceil(remainingTime / 1000)} seconds. Click to stay connected.`
      };
    }

    return null;
  }

  /**
   * End user session
   * @param {string} userId - User ID
   */
  endSession(userId) {
    // Clear timers
    if (this.inactivityTimers.has(userId)) {
      clearTimeout(this.inactivityTimers.get(userId));
      this.inactivityTimers.delete(userId);
    }

    if (this.warningTimers && this.warningTimers.has(userId)) {
      clearTimeout(this.warningTimers.get(userId));
      this.warningTimers.delete(userId);
    }

    // Remove session
    this.userSessions.delete(userId);

    logger.info(`Session ended for user ${userId}`);
  }

  /**
   * Get user session info
   * @param {string} userId - User ID
   * @returns {object|null} Session data or null if not found
   */
  getSession(userId) {
    return this.userSessions.get(userId) || null;
  }

  /**
   * Get all active sessions
   * @returns {object} Map of active sessions
   */
  getAllSessions() {
    return this.userSessions;
  }

  /**
   * Extend user session timeout (when user becomes active again)
   * @param {string} userId - User ID
   */
  extendSession(userId) {
    this.recordActivity(userId);
  }

  /**
   * Set new inactivity timeout duration
   * @param {number} timeoutMs - Timeout duration in milliseconds
   */
  setInactivityTimeout(timeoutMs) {
    this.inactivityTimeoutMs = timeoutMs;
    logger.info(`Inactivity timeout set to ${timeoutMs}ms`);
  }

  /**
   * Clear all sessions and timers (cleanup)
   */
  clear() {
    // Clear all timers
    this.inactivityTimers.forEach(timer => clearTimeout(timer));
    this.inactivityTimers.clear();

    if (this.warningTimers) {
      this.warningTimers.forEach(timer => clearTimeout(timer));
      this.warningTimers.clear();
    }

    // Clear sessions
    this.userSessions.clear();

    logger.info('All inactivity sessions cleared');
  }

  /**
   * Get stats about active sessions
   * @returns {object} Statistics
   */
  getStats() {
    const now = Date.now();
    const stats = {
      totalActiveSessions: this.userSessions.size,
      sessions: Array.from(this.userSessions.entries()).map(([userId, session]) => ({
        userId: userId,
        lastActivityAgoMs: now - session.lastActivityAt,
        sessionDurationMs: now - session.createdAt,
        warnings: session.warnings || 0
      }))
    };

    return stats;
  }
}

module.exports = InactivityManager;
