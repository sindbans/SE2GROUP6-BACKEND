// employeeAuthController.js

const bcrypt = require('bcryptjs');
// Import the common authentication utilities (e.g. generateToken)
const AuthController = require('./authcontroller');
// Import the Employee model
const Employee = require('../models/Employee');

const saltRounds = 10;

/**
 * @desc    Login an employee user
 * @route   POST /api/auth/employee/login
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the employee by email
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a token using the shared auth controller helper
        const token = AuthController.generateToken(employee);

        // Return the token and employee data
        return res.json({ token, employee });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Register a new employee user
 * @route   POST /api/auth/employee/register
 */
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if an employee with the email already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newEmployee = new Employee({ name, email, password: hashedPassword });

        // Save the new employee to the database
        await newEmployee.save();

        // Generate a JWT token for the new employee
        const token = AuthController.generateToken(newEmployee);

        // Return success with the new employee data and token
        return res.status(201).json({ token, employee: newEmployee });
    } catch (error) {
        return res.status(500).json({ message: 'Registration error', error: error.message });
    }
};
