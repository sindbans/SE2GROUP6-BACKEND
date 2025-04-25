// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeAuthController = require('../controllers/employeeAuthController');

router.post('/login', employeeAuthController.login);
router.post('/register', employeeAuthController.register);

module.exports = router;
