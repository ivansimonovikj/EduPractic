module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next(); // Ако е најавен, пушти го понатаму
    }
    req.flash("error_msg", "Ве молиме најавете се за да го видите овој дел");
    res.redirect("/api/auth/login");
  },
};
