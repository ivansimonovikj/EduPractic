const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "mentor", "admin", "company", "professor"],
      default: "student",
    },
    school: {
      type: String,
      required: function () {
        return this.role === "student" || this.role === "professor";
      },
      trim: true,
    },

    // --- НОВО ЗА ПРОФЕСОР ---
    // Наслов или предмет што го предава (опционално, за подобар профил)
    title: {
      type: String,
      default: "",
    },

    // Листа на студенти кои професорот директно ги менторира (ако сакаш специфично доделување)
    managedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // ------------------------

    // Специфични полиња за Профил
    linkedin: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    phone: { type: String, default: "" },

    // Објект за локација
    location: {
      lat: {
        type: Number,
        default: 41.9981, // Центар на Скопје
      },
      lng: {
        type: Number,
        default: 21.4254,
      },
    },

    // Логика за Пракса (за Студенти)
    onInternship: {
      type: Boolean,
      default: false,
    },
    currentInternship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Референца до корисник со улога 'company'
    },

    // Референца за фирма (ако корисникот е студент)
    company: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    defaultPracticeDays: { type: Number, default: 20 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
