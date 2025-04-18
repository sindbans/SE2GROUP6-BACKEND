// middleware/verifyJWT.js
const jwt = require('jsonwebtoken');

module.exports = function verifyJWT(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userUUID = payload.uid;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
