// promotionRoutes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { requireManagement } = require('../middlewares/managementAuth');

// Route to create a new promotion (management only).
router.post('/', requireManagement, promotionController.createPromotion);

// Route to list active promotions (public).
router.get('/', promotionController.getPromotions);

module.exports = router;
