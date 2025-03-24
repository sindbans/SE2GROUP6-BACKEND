const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Define the user schema
const FormDataSchema = new mongoose.Schema({
    name: { type: String, required: true },  // ✅ Added name field
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Hash the password before saving
FormDataSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10); // Hash the password
    next();
});

// Method to compare passwords
FormDataSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const FormDataModel = mongoose.model('FormData', FormDataSchema);
module.exports = FormDataModel;
