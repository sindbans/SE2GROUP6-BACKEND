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
  companyId: { type: String, required: true },
  eventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  salt: String,
  passwordHash: String,
  password: { type: String, required: true },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false } // New field to indicate admin privileges
}, { timestamps: true });

ManagementSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto
      .pbkdf2Sync(this.password, this.salt, 10000, 64, 'sha512')
      .toString('hex');

  // Optionally, clear the plaintext password
  this.password = undefined;
  next();
});

// Instance method to verify the password during login
ManagementSchema.methods.verifyPassword = function (inputPassword) {
  const hash = crypto
      .pbkdf2Sync(inputPassword, this.salt, 10000, 64, 'sha512')
      .toString('hex');
  return this.passwordHash === hash;
};

module.exports = mongoose.model('Management', ManagementSchema);