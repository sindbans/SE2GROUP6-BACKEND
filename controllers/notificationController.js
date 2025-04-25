const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    const saved = await newNotification.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error("Error creating notification:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
