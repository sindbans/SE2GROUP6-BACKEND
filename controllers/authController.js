// controllers/authController.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Customer = require('../models/Customer');
const { encrypt } = require('../utils/encryptionHelper');

// Configure email transport. In production, use real service or credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // e.g. 'youremail@gmail.com'
        pass: process.env.EMAIL_PASS  // e.g. 'yourGmailAppPassword'
    }
});

/**
 * Register a new user (Customer)
 */
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, dateOfBirth } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if email exists
        const existing = await Customer.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Create and save new customer
        const newCustomer = new Customer({
            firstName,
            lastName,
            email,
            password,
            dateOfBirth
        });
        await newCustomer.save();

        return res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('[register] Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Login: compare password, return encrypted token + user name
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1) Find customer by email
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ message: 'No user found with that email' });
        }

        // 2) Compare password
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Wrong password' });
        }

        // 3) Encrypt the user's short UID
        const token = encrypt(customer.uid);

        // 4) Return token & name
        const fullName = `${customer.firstName} ${customer.lastName}`;
        return res.json({
            message: 'Login successful',
            token,
            name: fullName
        });
    } catch (err) {
        console.error('[login] Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Initiate password reset: generate token, set expiry, email user
 */
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const customer = await Customer.findOne({ email });
        if (!customer) {
            // For security, we can respond success anyway
            return res.status(200).json({
                message: 'If that email is registered, a reset link has been sent.'
            });
        }

        // Generate random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        customer.resetPasswordToken = resetToken;
        customer.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await customer.save();

        // Email link (front end route to handle the reset)
        const resetLink = `http://localhost:5173/reset?token=${resetToken}`;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customer.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Use this link to reset:\n\n${resetLink}`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: 'Reset password link sent (if email is registered)'
        });
    } catch (err) {
        console.error('[requestPasswordReset] Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Confirm the reset: set new password if token is valid
 */
exports.confirmPasswordReset = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password required' });
        }

        // Find user with matching token that hasn't expired
        const customer = await Customer.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!customer) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password, clearing reset fields
        customer.password = newPassword; // Will be hashed by pre-save
        customer.resetPasswordToken = "";
        customer.resetPasswordExpires = null;
        await customer.save();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('[confirmPasswordReset] Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
