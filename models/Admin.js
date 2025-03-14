const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AdminSchema = new mongoose.Schema({
  uid: { type: String, default: uuidv4, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Admin', AdminSchema);
