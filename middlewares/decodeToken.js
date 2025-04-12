// middleware/decodeToken.js
const { decryptUUID } = require('../utils/encryptionHelper');

function decodeToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <ciphertext>
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const userUUID = decryptUUID(token);
        req.userUUID = userUUID;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = decodeToken;
