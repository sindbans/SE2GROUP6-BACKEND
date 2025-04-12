// utils/encryptionHelper.js
const crypto = require('crypto');

// You should store this in an env variable, not hard-code it.
const secretKey = process.env.SECRET_KEY || 'your-default-key';

// The algorithm & IV length must match. For example, aes-256-cbc needs a 32-byte key, 16-byte IV, etc.
// Here we do a simpler approach using the 'password' param.
// For a more robust approach, you should generate a key+iv properly.
// But this works for demonstration purposes.

function encryptUUID(uuid) {
    // Create an AES cipher object.
    // NOTE: If you want a more secure approach, generate a random IV and store it with the cipher,
    // but for simplicity, we'll use the single secret as well.
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);

    let encrypted = cipher.update(uuid, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted; // the ciphertext
}

function decryptUUID(ciphertext) {
    // Create decipher using the same algorithm & key
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted; // the original plain UUID
}

module.exports = { encryptUUID, decryptUUID };
