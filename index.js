const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const filterRoutes = require('./routes/filterRoutes');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.set('strictQuery', true); // Suppress strictQuery deprecation warning
mongoose.connect(process.env.MONGO_URI) // Removed deprecated options
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Use routes
app.use('/api', filterRoutes);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
