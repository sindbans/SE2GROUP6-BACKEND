const mongoose = require('mongoose');

// Helper function to generate an 11-character alphanumeric UID
function generateUID() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 11; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const EmployeeSchema = new mongoose.Schema({
  uid: { type: String, default: generateUID, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  // Including login details for industrial standards
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // Assume encryption happens in the application
  dateOfBirth: { type: Date },
  gender: { type: String }, // Could be refined to an enum if needed (e.g., 'Male', 'Female', 'Other')
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  companyId: { type: String, required: true },
  remarks: { type: String },
  // Additional field that might be fruitful
  jobTitle: { type: String }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Employee', EmployeeSchema);
