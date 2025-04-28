// managementAuthController.js

const bcrypt = require('bcryptjs');
// Import the common authentication utilities (e.g. generateToken)
const AuthController = require('./authController');
// Import the Management model
const Management = require('../models/Management');

const saltRounds = 10;

/**
 * @desc    Login a management user
 * @route   POST /api/auth/management/login
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the management user by email
        const management = await Management.findOne({ email });
        if (!management) {
            return res.status(404).json({ message: 'Management user not found' });
        }

        // Verify the provided password
        const isMatch = await bcrypt.compare(password, management.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT using the shared auth helper
        const token = AuthController.generateToken(management);

        // Return the token and management data
        return res.json({ token, management });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Register a new management user
 * @route   POST /api/auth/management/register
 */
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Ensure no management user exists with the same email
        const existingManagement = await Management.findOne({ email });
        if (existingManagement) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the provided password securely
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newManagement = new Management({ name, email, password: hashedPassword });

        // Save the new management user to the database
        await newManagement.save();

        // Generate a token for the new management user
        const token = AuthController.generateToken(newManagement);

        // Return the new management user data along with the token
        return res.status(201).json({ token, management: newManagement });
    } catch (error) {
        return res.status(500).json({ message: 'Registration error', error: error.message });
    }
};
