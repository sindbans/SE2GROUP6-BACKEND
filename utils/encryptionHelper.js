// utils/encryptionHelper.js
const crypto = require('crypto');

// Ensure SECRET_KEY is defined
const secretKey = process.env.SECRET_KEY;
if (!secretKey) {
    throw new Error("SECRET_KEY is not defined in environment variables.");
}

/**
 * Encrypt a string (e.g. user uid)
 */
function encrypt(str) {
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

/**
 * Decrypt an AES-256-CBC string
 */
function decrypt(encryptedStr) {
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decrypted = decipher.update(encryptedStr, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
