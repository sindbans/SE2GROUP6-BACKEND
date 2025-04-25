const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true },
  targetAudience: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  activateImmediately: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
