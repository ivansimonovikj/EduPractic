const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Професорот
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Студентот
  type: { type: String, default: "internship_finished" },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // Линк до профилот на студентот за преглед
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
