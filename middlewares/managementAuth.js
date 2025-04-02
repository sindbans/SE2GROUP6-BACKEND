// managementAuth.js
const Management = require('../models/Management');

/**
 * Middleware to ensure the request is made by a logged-in management member.
 * Assumes req.session.managementUid is set after authentication.
 */
async function requireManagement(req, res, next) {
    if (!req.session || !req.session.managementUid) {
        return res.status(401).json({ message: "Unauthorized: Management credentials required." });
    }
    try {
        const managementUser = await Management.findOne({ uid: req.session.managementUid });
        if (!managementUser) {
            return res.status(401).json({ message: "Unauthorized: Management user not found." });
        }
        // Optionally, check if the user has privileges (e.g. isAdmin).
        req.managementUser = managementUser;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { requireManagement };
