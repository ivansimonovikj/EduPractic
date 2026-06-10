const Application = require("../models/Application");

module.exports = async (req, res, next) => {
  // 1. Проверка на полето во User моделот
  if (!req.user || !req.user.onInternship) {
    req.flash(
      "error_msg",
      "Немате овластување. Прво мора да започнете пракса.",
    );
    return res.redirect("/dashboard");
  }

  try {
    // 2. Проверка дали навистина постои "прифатена" апликација во базата
    const activeApp = await Application.findOne({
      student: req.user._id,
      status: "прифатено",
    });

    if (!activeApp) {
      req.flash(
        "error_msg",
        "Вашата апликација сè уште не е одобрена од професор.",
      );
      return res.redirect("/dashboard");
    }

    // Ако сè е во ред, продолжи
    next();
  } catch (err) {
    res.status(500).send("Грешка при проверка на праксата.");
  }
};
