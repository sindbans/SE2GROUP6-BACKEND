// app.js
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const eventRoutes = require('./routes/eventRoutes');

// Middleware for parsing JSON
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);

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

// Export the app so it can be used in tests
module.exports = app;
