const mongoose = require('mongoose');

// Helper function to generate a 7-character alphanumeric UID
function generateUID7() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const ManagementSchema = new mongoose.Schema({
  uid: { type: String, default: generateUID7, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  companyName: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  eventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], // Array of Event foreign keys
  password: { type: String, required: true }, // Assume encryption is handled before saving
  lastLogin: { type: Date }, // DateTime for last login
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Management', ManagementSchema);
