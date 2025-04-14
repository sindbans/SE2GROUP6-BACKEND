// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/reset-password
router.post('/reset-password', authController.requestPasswordReset);

// POST /api/auth/reset-password/confirm
router.post('/reset-password/confirm', authController.confirmPasswordReset);

module.exports = router;
