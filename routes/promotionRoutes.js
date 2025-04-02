const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

// GET promotions endpoint
router.get('/', promotionController.getPromotions);

module.exports = router;
