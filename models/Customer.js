// models/Customer.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function generateShortUUID() {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}

const CustomerSchema = new mongoose.Schema({
  uid: {
    type: String,
    default: generateShortUUID,
    unique: true
  },
  profileImage: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  loyaltyPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],

  // Fields for password reset flow
  resetPasswordToken: { type: String, default: "" },
  resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

/**
 * Pre-save hook: if password is modified, hash it with bcrypt
 */
CustomerSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(this.password, salt);
    this.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Compare a candidate password with the hashed password
 */
CustomerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Customer', CustomerSchema);
