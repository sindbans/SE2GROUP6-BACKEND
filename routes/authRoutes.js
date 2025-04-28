// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

// Manual Auth
router.post('/register', authController.register);
router.post('/login', authController.login);
// router.post('/reset-password', authController.requestPasswordReset);
// router.post('/reset-password/confirm', authController.confirmPasswordReset);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'https://beamish-baklava-7a2363.netlify.app/login'
}), authController.googleCallback);

module.exports = router;
