const express = require("express");
const router = express.Router();

const { ensureAuthenticated } = require("../middleware/authMiddleware");
const { ensureStudent } = require("../middleware/roleCheck");

const Application = require("../models/Application");
const Listing = require("../models/Listing");

// GET: Приказ на сите релевантни апликации
router.get("/my-list", ensureAuthenticated, async (req, res) => {
  try {
    let rawApplications;

    if (req.user.role === "company") {
      rawApplications = await Application.find({ company: req.user._id })
        .populate("student", "name email phone linkedin")
        .populate("listing", "title")
        .sort({ dateApplied: -1 });

      // Чистење на null податоци
      rawApplications = rawApplications.filter((app) => app.student !== null);
    } else {
      rawApplications = await Application.find({ student: req.user._id })
        .populate("company", "name")
        .populate("listing", "title location")
        .sort({ dateApplied: -1 });

      rawApplications = rawApplications.filter(
        (app) => app.company !== null && app.listing !== null,
      );
    }

    // --- КЛУЧНИОТ ДЕЛ: Филтрирање по статус ---
    // Претпоставуваме дека статусот е 'COMPLETED' (внимавај на големи/мали букви)
    const activeApps = rawApplications.filter(
      (app) => app.status !== "COMPLETED",
    );
    const finishedApps = rawApplications.filter(
      (app) => app.status === "COMPLETED",
    );

    res.render("applications/index", {
      user: req.user,
      activeApps, // Праќаме низа само со активни
      finishedApps, // Праќаме низа само со завршени
      applications: rawApplications, // Ја чуваме и целата низа за табот "Сите"
    });
  } catch (err) {
    console.error("Грешка при влечење апликации:", err);
    res.status(500).send("Серверска грешка");
  }
});

// GET: Детален преглед на една апликација
router.get("/view/:id", ensureAuthenticated, async (req, res) => {
  try {
    // ПОПРАВЕНО: Додадени phone и linkedin во populate
    const application = await Application.findById(req.params.id)
      .populate("student", "name email phone linkedin")
      .populate("listing", "title description location");

    if (!application) {
      req.flash("error_msg", "Апликацијата не е пронајдена.");
      return res.redirect("/applications/my-list");
    }

    if (req.user.role === "company" && application.status === "испратено") {
      application.status = "разгледано";
      await application.save();
    }

    res.render("applications/show", { application, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Серверска грешка");
  }
});

// ... остатокот од кодот (POST рутите) останува ист
router.post(
  "/apply/:listingId",
  ensureAuthenticated,
  ensureStudent,
  async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.listingId);
      if (!listing) {
        req.flash("error_msg", "Огласот не постои.");
        return res.redirect("/dashboard");
      }

      // --- ПОПРАВЕНА ПРОВЕРКА ---
      // Студентот не смее да аплицира само ако има апликација која:
      // НЕ Е завршена (COMPLETED), НЕ Е одбиена и НЕ Е архивирана.
      const activeApplication = await Application.findOne({
        student: req.user._id,
        status: { $nin: ["COMPLETED", "completed", "одбиено", "archived"] },
      });

      if (activeApplication) {
        req.flash(
          "error_msg",
          "Не можете да аплицирате. Веќе имате активен процес на пракса!",
        );
        return res.redirect(`/listings/${req.params.listingId}`);
      }
      // --- КРАЈ НА ПОПРАВКАТА ---

      const newApplication = new Application({
        listing: req.params.listingId,
        student: req.user._id,
        company: listing.company,
        message: req.body.message, // Внимавај: во EJS формата треба name="message"
      });

      await newApplication.save();
      req.flash("success_msg", "Вашата апликација е успешно испратена!");
      res.redirect("/dashboard");
    } catch (err) {
      console.error("Грешка при аплицирање:", err);
      res.status(500).send("Серверска грешка");
    }
  },
);

router.post("/status/:id", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).send("Неовластен пристап");
    }
    const { status } = req.body;
    await Application.findByIdAndUpdate(req.params.id, { status: status });
    req.flash("success_msg", `Статусот е успешно променет во: ${status}`);
    res.redirect(`/applications/view/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Серверска грешка");
  }
});

module.exports = router;
