const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { requireManagement } = require('../middlewares/managementAuth');

// GET ad configuration (public)
router.get('/ads', adController.getAds);

// POST update ad configuration (management only)
router.post('/ads', requireManagement, adController.updateAds);

module.exports = router;
