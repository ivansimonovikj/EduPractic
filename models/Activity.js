const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: [true, "Активноста мора да биде поврзана со апликација"],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Мора да се наведе студентот"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: [true, "Ве молиме внесете опис на активностите"],
    trim: true,
  },
  hours: {
    type: Number,
    default: 8, // Стандардни 8 часа
  },
  imageUrl: {
    type: String,
    default: "",
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String, default: "" },
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ActivitySchema.index({ student: 1, application: 1 });

module.exports = mongoose.model("Activity", ActivitySchema);
