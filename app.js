const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const cookieParser = require("cookie-parser");

// 1. Вчитување на i18n
const i18n = require("i18n");

// Вчитување на Middleware
const notificationMiddleware = require("./middleware/notificationMiddleware");

// Иницијализирај го app
const app = express();

// Пасош конфигурација
require("./config/passport")(passport);

// ПОДЕСУВАЊА НА VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/main");

// MIDDLEWARE ЗА ПОДАТОЦИ И СТАТИЧКИ ФАЈЛОВИ
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// 2. КОНФИГУРАЦИЈА НА i18n
i18n.configure({
  locales: ["en", "mk"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  queryParameter: "lng", // Дозволува менување јазик преку ?lng=mk
  objectNotation: true, // Овозможува користење на вгнездени клучеви (на пр. nav.home)
  autoReload: true, // Автоматски ги вчитува промените во JSON фајловите
  syncFiles: true, // Автоматски додава клучеви што недостасуваат во другите јазици
});

// Иницијализација на i18n како middleware
app.use(i18n.init);

app.use(cookieParser());

app.use((req, res, next) => {
  const supportedLangs = ["en", "mk"];
  // 1. Check if lang change requested via query and set cookie
  if (req.query.lng && supportedLangs.includes(req.query.lng)) {
    res.cookie("lang", req.query.lng, {
      maxAge: 1000 * 60 * 60 * 24 * 365,
      httpOnly: true,
    });
    req.setLocale(req.query.lng);
  }
  // 2. Otherwise try to get lang from cookie
  else if (req.cookies.lang && supportedLangs.includes(req.cookies.lang)) {
    req.setLocale(req.cookies.lang);
  }
  // 3. Default to i18n default
  else {
    req.setLocale(i18n.getLocale());
  }

  // Pass lang to templates
  res.locals.lng = req.getLocale();

  // (Optional) Helper for updating URLs, you can keep your old helper or adjust it
  res.locals.updateLngUrl = (lng) => {
    const url = new URL(
      req.protocol + "://" + req.get("host") + req.originalUrl,
    );
    url.searchParams.set("lng", lng);
    return url.pathname + url.search;
  };

  next();
});

// SESSION (Клучно: Мора да е пред Passport)
app.use(
  session({
    secret: "secret-key-edupraktik",
    resave: false,
    saveUninitialized: true,
  }),
);

// PASSPORT (Мора да е по Session)
app.use(passport.initialize());
app.use(passport.session());

// FLASH & ГЛОБАЛНИ ПРОМЕНЛИВИ
app.use(flash());

// Глобални променливи за пораки и корисничка сесија
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// АКТИВИРАЊЕ НА НОТИФИКАЦИИТЕ (По Passport за да имаме req.user)
app.use(notificationMiddleware);

// ПОВРЗУВАЊЕ СО МОНГODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Успешно поврзано со MongoDB Atlas"))
  .catch((err) => console.log("❌ Грешка при поврзување:", err));

// РУТИ
const authRoutes = require("./routes/auth");
const indexRoutes = require("./routes/index");
const listingsRoutes = require("./routes/listings");
const applicationsRoutes = require("./routes/applications");

app.use("/api/auth", authRoutes);
app.use("/", indexRoutes);
app.use("/listings", listingsRoutes);
app.use("/applications", applicationsRoutes);

// Рута за означување на нотификациите како прочитани
app.post("/notifications/mark-as-read", async (req, res) => {
  if (req.user && req.user.role === "professor") {
    const Notification = require("./models/Notification");
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true },
    );
    res.json({ success: true });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Серверот работи на порта ${PORT}`));
