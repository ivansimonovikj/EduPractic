module.exports = {
  ensureCompany: function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === "company") {
      return next();
    }
    req.flash(
      "error_msg",
      "Немате овластување за оваа акција. Само за компании.",
    );
    res.redirect("/dashboard");
  },

  ensureStudent: function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === "student") {
      return next();
    }
    req.flash("error_msg", "Оваа акција е достапна само за студенти.");
    res.redirect("/dashboard");
  },
};
