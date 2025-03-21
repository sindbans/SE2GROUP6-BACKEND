const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  uid: { type: String, unique: true },
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }]
}, { timestamps: true });

// Add indexes HERE (not in other files)
CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ uid: 1 }, { unique: true });
CustomerSchema.index({ tickets: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);
