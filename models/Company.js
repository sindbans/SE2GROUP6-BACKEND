const mongoose = require('mongoose');

// Helper function to generate a unique company ID (6-character alphanumeric)
function generateCompanyId() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const CompanySchema = new mongoose.Schema({
  companyId: { type: String, default: generateCompanyId, unique: true },
  companyName: { type: String, required: true, unique: true }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model('Company', CompanySchema);
