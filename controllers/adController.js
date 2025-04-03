const { getAdConfig, updateAdConfig } = require('../services/adService');

/**
 * GET /api/promotions/ads
 */
exports.getAds = async (req, res) => {
    try {
        const config = await getAdConfig();
        res.status(200).json({ ads: config });
    } catch (error) {
        console.error('Error in getAds:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/promotions/ads
 * Protected: Only management users allowed.
 */
exports.updateAds = async (req, res) => {
    try {
        if (!req.managementUser) {
            return res.status(401).json({ message: 'Unauthorized: Management credentials required.' });
        }
        const newConfig = req.body;
        const updatedConfig = await updateAdConfig(newConfig);
        res.status(200).json({ ads: updatedConfig });
    } catch (error) {
        console.error('Error in updateAds:', error);
        res.status(400).json({ message: error.message });
    }
};
