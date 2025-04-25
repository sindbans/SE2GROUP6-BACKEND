const express = require('express');
const router = express.Router();
const { createMovie } = require('../controllers/movieController');

router.post('/add', createMovie);

module.exports = router;
