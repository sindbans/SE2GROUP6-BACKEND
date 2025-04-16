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
  salt: String,
  passwordHash: String,
  password: { type: String, required: true },
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

EmployeeSchema.pre('save', function (next) {
  // Check if the password field was modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a random 16-byte salt and convert it to hex string
  this.salt = crypto.randomBytes(16).toString('hex');
  // Hash the password using pbkdf2Sync with 10,000 iterations, 64 byte key length, and sha512 algorithm
  this.passwordHash = crypto
      .pbkdf2Sync(this.password, this.salt, 10000, 64, 'sha512')
      .toString('hex');

  // Optionally, you can remove the plaintext password now that it's hashed
  this.password = undefined;
  next();
});

// Instance method to verify a given password
EmployeeSchema.methods.verifyPassword = function (inputPassword) {
  const hash = crypto
      .pbkdf2Sync(inputPassword, this.salt, 10000, 64, 'sha512')
      .toString('hex');
  return this.passwordHash === hash;
};

module.exports = mongoose.model('Employee', EmployeeSchema);

