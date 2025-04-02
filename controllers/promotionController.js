// promotionController.js
const { createPromotion } = require('../services/promotionGenerator');
const { listPromotionCodes } = require('../services/promotionService');

/**
 * POST /api/promotions
 * Creates a new promotion.
 * For management-created (site-wide) promotions, the management user's uid (from session)
 * is automatically attached.
 *
 * Expected JSON body:
 * {
 *   "percentOff": 20,
 *   "duration": "once",          // "once", "repeating", or "forever"
 *   "userSpecific": true,        // true for promotions targeting a specific customer
 *   "customerEmail": "user@example.com" // required if userSpecific is true.
 * }
 */
exports.createPromotion = async (req, res) => {
    try {
        // The requireManagement middleware ensures req.managementUser exists.
        const managementUser = req.managementUser;
        const { percentOff, duration, userSpecific, customerEmail } = req.body;
        if (percentOff == null || !duration) {
            return res.status(400).json({ message: 'Missing required parameters: percentOff and duration.' });
        }
        // For user-specific promotions, customerEmail must be provided.
        // For site-wide promotions, we attach the management member's uid.
        const promotion = await createPromotion({
            percentOff,
            duration,
            userSpecific,
            customerEmail,
            createdBy: userSpecific ? undefined : managementUser.uid
        });
        return res.status(201).json({ promotion });
    } catch (error) {
        console.error('Error in createPromotion:', error);
        return res.status(400).json({ message: error.message });
    }
};

/**
 * GET /api/promotions
 * Lists active promotion codes.
 * Optionally, accepts a query parameter "customerEmail" to filter promotions.
 */
exports.getPromotions = async (req, res) => {
    try {
        const { customerEmail } = req.query;
        const promotions = await listPromotionCodes({ customerEmail });
        return res.status(200).json({ promotions });
    } catch (error) {
        console.error('Error in getPromotions:', error);
        return res.status(400).json({ message: error.message });
    }
};
