const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String], // Низа од вештини (пр. ["HTML", "CSS", "JS"])
    default: [],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId, // Го поврзуваме со ID-то на корисникот
    ref: "User",
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Listing", ListingSchema);
