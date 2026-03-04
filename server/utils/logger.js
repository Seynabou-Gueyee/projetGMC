const fs = require('fs');
const path = require('path');

/**
 * Comprehensive logging system for debugging and moderation
 */
class Logger {
  constructor(logDir = './logs') {
    this.logDir = logDir;
    this.logsPath = {
      general: path.join(logDir, 'general.log'),
      errors: path.join(logDir, 'errors.log'),
      security: path.join(logDir, 'security.log'),
      moderation: path.join(logDir, 'moderation.log'),
      performance: path.join(logDir, 'performance.log')
    };

    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };

    this.currentLogLevel = this.logLevels.INFO;
    
    // Create log directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Initialize log files
    this.initializeLogFiles();
  }

  /**
   * Initialize log files
   */
  initializeLogFiles() {
    Object.values(this.logsPath).forEach(filePath => {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
      }
    });
  }

  /**
   * Get formatted timestamp
   * @returns {string}
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} data - Additional data
   * @returns {string}
   */
  formatMessage(level, message, data = {}) {
    const timestamp = this.getTimestamp();
    const dataStr = Object.keys(data).length > 0 
      ? ` | ${JSON.stringify(data)}`
      : '';
    
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  /**
   * Write to log file
   * @param {string} filePath - Log file path
   * @param {string} message - Formatted message
   */
  writeToFile(filePath, message) {
    try {
      fs.appendFileSync(filePath, message + '\n', { encoding: 'utf8' });
    } catch (error) {
      console.error(`Failed to write to log file ${filePath}:`, error.message);
    }
  }

  /**
   * General info log
   * @param {string} message - Log message
   * @param {object} data - Additional data
   */
  info(message, data = {}) {
    if (this.currentLogLevel <= this.logLevels.INFO) {
      const formatted = this.formatMessage('INFO', message, data);
      console.log(formatted);
      this.writeToFile(this.logsPath.general, formatted);
    }
  }

  /**
   * Debug log
   * @param {string} message - Log message
   * @param {object} data - Additional data
   */
  debug(message, data = {}) {
    if (this.currentLogLevel <= this.logLevels.DEBUG) {
      const formatted = this.formatMessage('DEBUG', message, data);
      console.debug(formatted);
      this.writeToFile(this.logsPath.general, formatted);
    }
  }

  /**
   * Warning log
   * @param {string} message - Log message
   * @param {object} data - Additional data
   */
  warn(message, data = {}) {
    if (this.currentLogLevel <= this.logLevels.WARN) {
      const formatted = this.formatMessage('WARN', message, data);
      console.warn(formatted);
      this.writeToFile(this.logsPath.general, formatted);
    }
  }

  /**
   * Error log
   * @param {string} message - Log message
   * @param {object} errorData - Error data
   */
  error(message, errorData = {}) {
    const formatted = this.formatMessage('ERROR', message, errorData);
    console.error(formatted);
    this.writeToFile(this.logsPath.errors, formatted);
  }

  /**
   * Critical error log
   * @param {string} message - Log message
   * @param {object} errorData - Error data
   */
  critical(message, errorData = {}) {
    const formatted = this.formatMessage('CRITICAL', message, errorData);
    console.error(formatted);
    this.writeToFile(this.logsPath.errors, formatted);
  }

  /**
   * Security-related log (suspicious activity)
   * @param {string} userId - User ID
   * @param {string} eventType - Type of security event
   * @param {object} details - Event details
   */
  security(userId, eventType, details = {}) {
    const logData = {
      userId: userId,
      eventType: eventType,
      ...details
    };
    
    const formatted = this.formatMessage('SECURITY', `User ${userId}: ${eventType}`, logData);
    console.warn(formatted);
    this.writeToFile(this.logsPath.security, formatted);
  }

  /**
   * Moderation log (admin actions, spam detection, etc.)
   * @param {string} action - Moderation action
   * @param {object} details - Action details
   */
  moderation(action, details = {}) {
    const logData = {
      action: action,
      moderator: details.moderator || 'SYSTEM',
      targetUserId: details.targetUserId,
      reason: details.reason,
      ...details
    };
    
    const formatted = this.formatMessage('MODERATION', action, logData);
    console.log(formatted);
    this.writeToFile(this.logsPath.moderation, formatted);
  }

  /**
   * Performance log (for monitoring response times, etc.)
   * @param {string} operation - Operation name
   * @param {number} durationMs - Duration in milliseconds
   * @param {object} details - Additional details
   */
  performance(operation, durationMs, details = {}) {
    const logData = {
      operation: operation,
      durationMs: durationMs,
      ...details
    };
    
    // Log as warning if slow (> 1000ms)
    const level = durationMs > 1000 ? 'WARN' : 'DEBUG';
    const formatted = this.formatMessage(level, `Performance: ${operation}`, logData);
    
    if (durationMs > 1000) {
      console.warn(formatted);
    } else {
      console.debug(formatted);
    }
    
    this.writeToFile(this.logsPath.performance, formatted);
  }

  /**
   * Log message-related event
   * @param {string} event - Event type (send, edit, delete, etc.)
   * @param {object} messageData - Message data
   */
  messageEvent(event, messageData = {}) {
    const logData = {
      event: event,
      messageId: messageData._id,
      userId: messageData.sender || messageData.userId,
      room: messageData.room,
      contentLength: messageData.content?.length || 0,
      hasAttachments: !!messageData.attachments?.length,
      timestamp: messageData.timestamp || messageData.createdAt
    };
    
    this.debug(`Message ${event}`, logData);
  }

  /**
   * Log user action
   * @param {string} userId - User ID
   * @param {string} action - Action type
   * @param {object} details - Action details
   */
  userAction(userId, action, details = {}) {
    const logData = {
      userId: userId,
      action: action,
      ...details
    };
    
    this.info(`User ${action}`, logData);
  }

  /**
   * Set log level threshold
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, CRITICAL)
   */
  setLogLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.currentLogLevel = this.logLevels[level];
      this.info(`Log level set to ${level}`);
    }
  }

  /**
   * Read log file content
   * @param {string} logType - Type of log (general, errors, security, moderation, performance)
   * @param {number} limit - Number of lines to read (0 = all)
   * @returns {string[]} Array of log lines
   */
  readLogFile(logType = 'general', limit = 100) {
    const filePath = this.logsPath[logType];
    
    if (!filePath || !fs.existsSync(filePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (limit > 0) {
        return lines.slice(-limit);
      }
      
      return lines;
    } catch (error) {
      console.error(`Failed to read log file ${logType}:`, error.message);
      return [];
    }
  }

  /**
   * Clear log file
   * @param {string} logType - Type of log to clear
   */
  clearLog(logType = 'general') {
    const filePath = this.logsPath[logType];
    
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, '');
        this.info(`Log file cleared: ${logType}`);
      } catch (error) {
        console.error(`Failed to clear log file ${logType}:`, error.message);
      }
    }
  }

  /**
   * Get log file size
   * @param {string} logType - Type of log
   * @returns {number} File size in bytes
   */
  getLogSize(logType = 'general') {
    const filePath = this.logsPath[logType];
    
    if (filePath && fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return stats.size;
    }
    
    return 0;
  }

  /**
   * Get all log sizes
   * @returns {object} Sizes for all log types
   */
  getAllLogSizes() {
    const sizes = {};
    
    Object.entries(this.logsPath).forEach(([type, filePath]) => {
      sizes[type] = this.getLogSize(type);
    });
    
    return sizes;
  }

  /**
   * Archive old logs if they exceed size limit
   * @param {number} maxSizeBytes - Max size before archiving
   */
  archiveOldLogs(maxSizeBytes = 10485760) { // 10MB default
    Object.entries(this.logsPath).forEach(([type, filePath]) => {
      const size = this.getLogSize(type);
      
      if (size > maxSizeBytes) {
        const timestamp = this.getTimestamp().replace(/[:.]/g, '-');
        const archivePath = filePath.replace('.log', `.${timestamp}.archive.log`);
        
        try {
          fs.copyFileSync(filePath, archivePath);
          fs.writeFileSync(filePath, '');
          this.info(`Log file archived: ${type}`);
        } catch (error) {
          console.error(`Failed to archive log file ${type}:`, error.message);
        }
      }
    });
  }
}

// Export singleton instance
module.exports = new Logger();
