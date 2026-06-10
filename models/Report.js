const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    hours: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    mentorFeedback: { type: String },

    // Податоци од верификацијата
    isLocationVerified: { type: Boolean, default: false },
    distanceFromCompany: { type: Number }, // Растојание во метри
    coordsAtSubmission: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
