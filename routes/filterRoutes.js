// routes/filterRoutes.js
const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');

// This route will handle filtering events based on query parameters
router.get('/filter', filterController.filterEvents);

module.exports = router;
