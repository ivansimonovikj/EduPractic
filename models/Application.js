const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: [true, "Ве молиме додадете кратка порака до компанијата"],
  },
  status: {
    type: String,
    enum: ["испратено", "разгледано", "прифатено", "одбиено"],
    default: "испратено",
  },
  /* --- НОВИ ФУНКЦИОНАЛНОСТИ ЗА SAAS ПЛАТФОРМАТА --- */

  // Колку денови пракса бара училиштето за оваа апликација
  requiredDays: {
    type: Number,
    default: 20, // Стандардна вредност (најчесто во македонското образование)
    min: [1, "Праксата мора да трае барем еден ден"],
  },

  // Доколку училиштето мери во часови наместо во денови
  requiredHours: {
    type: Number,
    default: 0, // Опционално, ако се користи пресметка на саатница
  },

  // Дали праксата е веќе успешно завршена (кога ќе се пополнат деновите)
  isCompleted: {
    type: Boolean,
    default: false,
  },

  /* --------------------------------------------- */
  dateApplied: {
    type: Date,
    default: Date.now,
  },
  excusedDays: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"], // Додадено 'completed'
    default: "pending",
  },
  professorComment: { type: String, default: "" },
  completedAt: { type: Date },
  pendingPing: {
    type: Boolean,
    default: false,
  },
  pingMessage: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Application", ApplicationSchema);
