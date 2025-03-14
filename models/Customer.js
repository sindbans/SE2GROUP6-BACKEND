const mongoose = require('mongoose');

function generateShortUUID() {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}

const CustomerSchema = new mongoose.Schema({
  uid: { type: String, default: generateShortUUID, unique: true },
  profileImage: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  loyaltyPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
