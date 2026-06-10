const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    // Гео-локација за проверка
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    mentorName: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);
