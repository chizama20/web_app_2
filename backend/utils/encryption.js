/**
 * Credit card encryption utilities (simulated)
 * In production, use proper encryption libraries and secure key management
 */

const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-bytes-long!!'; // 32 bytes
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt credit card data
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text (hex encoded)
 */
const encrypt = (text) => {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    console.error('Encryption error:', err);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt credit card data
 * @param {string} text - Encrypted text (hex encoded)
 * @returns {string} Decrypted text
 */
const decrypt = (text) => {
  if (!text) return null;
  
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Decryption error:', err);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Mask credit card number for display
 * @param {string} cardNumber - Credit card number
 * @returns {string} Masked card number (e.g., ****-****-****-1234)
 */
const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  return '****-****-****-' + cleaned.slice(-4);
};

/**
 * Mask CVV for display
 * @returns {string} Always returns ***
 */
const maskCVV = () => '***';

module.exports = {
  encrypt,
  decrypt,
  maskCardNumber,
  maskCVV
};

