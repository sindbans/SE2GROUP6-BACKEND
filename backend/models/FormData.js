const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Define the user schema
const FormDataSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Hash the password before saving
FormDataSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt of 10 rounds
    console.log('Hashed password:', this.password); // Check if password is hashed
    next();
});

// Method to compare the entered password with the hashed password
FormDataSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password); // Compare the hashed password
};

const FormDataModel = mongoose.model('FormData', FormDataSchema);
module.exports = FormDataModel;
