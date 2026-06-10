const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const passport = require("passport"); // Додадено за автентикација
const { ensureAuthenticated } = require("../middleware/authMiddleware");

// --- КОНФИГУРАЦИЈА ЗА SENDGRID ---
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 465,
  secure: true,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});

// --- GET РУТИ ---
router.get("/register", (req, res) => res.render("register"));
router.get("/login", (req, res) => res.render("login"));
router.get("/forgot-password", (req, res) => res.render("forgot-password"));

router.get("/reset/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error_msg", "Линкот за ресетирање е невалиден или истечен.");
      return res.redirect("/api/auth/forgot-password");
    }

    res.render("reset-password", { token: req.params.token });
  } catch (err) {
    res.status(500).send("Серверска грешка.");
  }
});

// --- POST РУТИ ---

// 1. РЕГИСТРАЦИЈА (Останува скоро иста)
// 1. РЕГИСТРАЦИЈА (Ажурирана со полето school)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, school } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      req.flash("error_msg", "Корисник со оваа е-пошта веќе постои.");
      return res.redirect("/api/auth/register");
    }

    // Дополнителна проверка за училиште (серверска валидација)
    if (
      (role === "student" || role === "professor") &&
      (!school || school.trim() === "")
    ) {
      req.flash("error_msg", "Мора да внесете име на училиште.");
      return res.redirect("/api/auth/register");
    }

    // Креирање на корисникот со сите податоци
    user = new User({
      name,
      email,
      password,
      role,
      school: role === "student" || role === "professor" ? school : undefined,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    req.flash(
      "success_msg",
      "Успешна регистрација! Сега можете да се најавите.",
    );
    res.redirect("/api/auth/login");
  } catch (err) {
    console.error("ДЕТАЛНА ГРЕШКА ПРИ РЕГИСТРАЦИЈА:", err);
    req.flash("error_msg", "Грешка при регистрација.");
    res.redirect("/api/auth/register");
  }
});

// 2. ЛОГИРАЊЕ (ПРОМЕНЕТО: Користи Passport наместо рачен JWT)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    // 1. Проверка за техничка грешка во базата
    if (err) {
      return next(err);
    }

    // 2. Проверка за неуспешна најава (погрешен меил/лозинка)
    if (!user) {
      req.flash("error_msg", info.message || "Невалиден меил или лозинка");
      return res.redirect("/api/auth/login");
    }

    // 3. Рачно најавување на корисникот во сесијата
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      // 4. ГЛАВНАТА ЛОГИКА: Пренасочување според улога (role)
      const role = user.role;

      if (role === "professor") {
        return res.redirect("/professor/dashboard");
      }

      if (role === "student") {
        return res.redirect("/dashboard");
      }

      if (role === "company") {
        return res.redirect("/dashboard");
      }

      // Default ако нема дефинирана улога
      res.redirect("/");
    });
  })(req, res, next);
});

// 3. ОДЈАВА (Додадено)
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success_msg", "Успешно се одјавивте.");
    res.redirect("/api/auth/login");
  });
});

// 4. ЗАБОРАВЕНА ЛОЗИНКА
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error_msg", "Не постои корисник со таа е-пошта.");
      return res.redirect("/api/auth/forgot-password");
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 час
    await user.save();

    const resetUrl = `http://${req.headers.host}/api/auth/reset/${token}`;

    const mailOptions = {
      from: '"ЕдуПрактик" <ivansimonovik@gmail.com>', // Провери дали овој мејл е верификуван на SendGrid
      to: user.email,
      subject: "Ресетирање на лозинка - ЕдуПрактик",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px;">
            <h2 style="color: #3182ce; text-align: center;">Ресетирање на лозинка</h2>
            <p>Здраво ${user.name},</p>
            <p>Кликнете на копчето за да ја промените лозинката:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #3182ce; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ресетирај лозинка</a>
            </div>
            <p style="font-size: 0.8rem; color: #718096;">Линкот трае 60 минути.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    req.flash(
      "success_msg",
      "Линкот за ресетирање е испратен на вашата е-пошта.",
    );
    res.redirect("/api/auth/forgot-password");
  } catch (err) {
    req.flash("error_msg", "Проблем со испраќањето на мејлот.");
    res.redirect("/api/auth/forgot-password");
  }
});

// 5. РЕСЕТИРАЊЕ ЛОЗИНКА (Финална потврда)
router.post("/reset/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error_msg", "Линкот е невалиден или истечен.");
      return res.redirect("/api/auth/forgot-password");
    }

    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    req.flash("success_msg", "Успешно ја променивте лозинката. Најавете се.");
    res.redirect("/api/auth/login");
  } catch (err) {
    req.flash("error_msg", "Грешка при ресетирање на лозинката.");
    res.redirect("/api/auth/login");
  }
});

router.post("/start-internship", ensureAuthenticated, async (req, res) => {
  try {
    const { companyId } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      onInternship: true,
      currentInternship: companyId,
    });

    req.flash(
      "success_msg",
      "Честитки! Твојата пракса официјално започна. Сега можеш да се пријавиш на локација.",
    );
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Грешка при почеток на пракса:", err);
    res.status(500).send("Грешка на серверот.");
  }
});

module.exports = router;
