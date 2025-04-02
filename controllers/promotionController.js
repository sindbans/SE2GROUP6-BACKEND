const { listPromotionCodes } = require('../services/promotionService');

/**
 * GET /api/promotions
 * Optionally, the query may include customerEmail to filter promotions applicable for that customer.
 * Example: /api/promotions?customerEmail=user@example.com
 */
exports.getPromotions = async (req, res) => {
    try {
        const { customerEmail } = req.query;
        const promotions = await listPromotionCodes({ customerEmail });
        res.status(200).json({ promotions });
    } catch (error) {
        console.error('Error in getPromotions:', error);
        res.status(400).json({ message: error.message });
    }
};
