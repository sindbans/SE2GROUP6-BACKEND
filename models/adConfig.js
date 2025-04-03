const mongoose = require('mongoose');

const AdConfigSchema = new mongoose.Schema({
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('AdConfig', AdConfigSchema);
