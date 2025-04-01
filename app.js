// app.js
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Middleware for parsing JSON
app.use(express.json());

// Routes
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// MongoDB connection (update with your connection string)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

module.exports = app;
