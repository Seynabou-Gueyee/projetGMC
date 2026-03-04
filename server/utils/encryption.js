const crypto = require('crypto');

/**
 * Basic encryption/decryption for messages using AES-256-GCM
 * Note: This is basic encryption. For production, use more robust solutions.
 */
class MessageEncryption {
  constructor(encryptionKey) {
    // Use provided key or generate from environment
    this.encryptionKey = encryptionKey || process.env.ENCRYPTION_KEY;
    
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Ensure key is 32 bytes (256 bits) for AES-256
    if (typeof this.encryptionKey === 'string') {
      this.encryptionKey = crypto
        .createHash('sha256')
        .update(this.encryptionKey)
        .digest();
    }
  }

  /**
   * Encrypt message content
   * @param {string} message - Plain text message
   * @returns {string} Encrypted message (base64 encoded)
   */
  encrypt(message) {
    try {
      // Generate random IV (Initialization Vector)
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

      // Encrypt message
      let encrypted = cipher.update(message, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Combine IV + authTag + encrypted message and encode to base64
      const result = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
      return result.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error.message);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt message content
   * @param {string} encryptedMessage - Encrypted message (base64 encoded)
   * @returns {string} Decrypted plain text message
   */
  decrypt(encryptedMessage) {
    try {
      // Decode base64
      const buffer = Buffer.from(encryptedMessage, 'base64');

      // Extract components
      const iv = buffer.slice(0, 16); // First 16 bytes
      const authTag = buffer.slice(16, 32); // Next 16 bytes
      const encrypted = buffer.slice(32); // Rest

      // Create decipher
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt message
      let decrypted = decipher.update(encrypted);
      decrypted += decipher.final();

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error.message);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Hash sensitive data (one-way)
   * @param {string} data - Data to hash
   * @param {string} algorithm - Hash algorithm (default: sha256)
   * @returns {string} Hash in hex format
   */
  hash(data, algorithm = 'sha256') {
    return crypto
      .createHash(algorithm)
      .update(data)
      .digest('hex');
  }

  /**
   * Generate cryptographic random token
   * @param {number} length - Token length in bytes
   * @returns {string} Token in hex format
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Verify HMAC signature
   * @param {string} data - Data to verify
   * @param {string} signature - Signature to verify against
   * @param {string} secret - Secret key
   * @returns {boolean}
   */
  verifySignature(data, signature, secret = this.encryptionKey) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const calculatedSignature = hmac.digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(signature)
    );
  }

  /**
   * Create HMAC signature for data
   * @param {string} data - Data to sign
   * @param {string} secret - Secret key
   * @returns {string} Signature in hex format
   */
  createSignature(data, secret = this.encryptionKey) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return hmac.digest('hex');
  }
}

module.exports = MessageEncryption;
