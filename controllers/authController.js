// controllers/authController.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Customer = require('../models/Customer');
const GoogleUser = require('../models/userSchema');
const { encrypt } = require('../utils/encryptionHelper');

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Manual Register
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, dateOfBirth } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existing = await Customer.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const newCustomer = new Customer({ firstName, lastName, email, password, dateOfBirth });
        await newCustomer.save();

        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('[register] Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Manual Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email });
        if (!customer) return res.status(404).json({ message: 'No user found' });

        const isMatch = await customer.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

        const token = encrypt(customer.uid);
        const name = `${customer.firstName} ${customer.lastName}`;
        res.json({ message: 'Login successful', token, name });
    } catch (err) {
        console.error('[login] Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Google Callback Handler
exports.googleCallback = async (req, res) => {
    try {
        const googleUser = req.user;
        const token = encrypt(googleUser.googleId); // You can map to UID if needed
        const name = googleUser.displayName;

        // Redirect back to frontend with token & name
        res.redirect(`http://localhost:5173/home?token=${token}&name=${encodeURIComponent(name)}`);
    } catch (err) {
        console.error('[googleCallback] Error:', err);
        res.redirect('http://localhost:5173/login');
    }
};

// Password Reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const customer = await Customer.findOne({ email });
        if (!customer) return res.status(200).json({ message: 'If email exists, reset link sent' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        customer.resetPasswordToken = resetToken;
        customer.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
        await customer.save();

        const resetLink = `http://localhost:5173/reset?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Click to reset your password: ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset email sent' });
    } catch (err) {
        console.error('[resetPassword] Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Confirm Password Reset
exports.confirmPasswordReset = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const customer = await Customer.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!customer) return res.status(400).json({ message: 'Invalid or expired token' });

        customer.password = newPassword;
        customer.resetPasswordToken = "";
        customer.resetPasswordExpires = null;
        await customer.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('[confirmReset] Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
