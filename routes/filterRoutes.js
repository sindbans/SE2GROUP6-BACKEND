const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');

router.get('/filter', filterController.filterEvents);

module.exports = router;