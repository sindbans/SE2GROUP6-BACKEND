// utils/encryptionHelper.js
const crypto = require('crypto');

const KEY = Buffer.from(process.env.SECRET_KEY, 'hex');   // 32 bytes
const IV  = Buffer.from(process.env.SECRET_IV,  'hex');   // 16 bytes

if (KEY.length !== 32 || IV.length !== 16) {
    throw new Error('SECRET_KEY must be 32 bytes (hex‑64) and SECRET_IV 16 bytes (hex‑32).');
}

function encrypt(plain) {
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
    let enc = cipher.update(String(plain), 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
}

function decrypt(enc) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
    let dec = decipher.update(enc, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

module.exports = { encrypt, decrypt };
