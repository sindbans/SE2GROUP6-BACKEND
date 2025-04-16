// routes/managementRoutes.js
const express = require('express');
const router = express.Router();
const managementAuthController = require('../controllers/managementAuthController');

router.post('/login', managementAuthController.login);
router.post('/register', managementAuthController.register);

module.exports = router;
