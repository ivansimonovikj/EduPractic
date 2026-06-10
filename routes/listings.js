const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const { ensureCompany } = require("./../middleware/roleCheck");

// --- GET РУТИ ---

// 1. Прикажи форма за нов оглас (GET)
router.get("/create", ensureAuthenticated, ensureCompany, (req, res) => {
  res.render("listings/create", { user: req.user });
});

// 2. Прикажи детали за поединечен оглас (GET)
router.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    // АЖУРИРАНО: Додадени 'description' и 'website' во populate за компанијата
    const listing = await Listing.findById(req.params.id).populate(
      "company",
      "name email description website",
    );

    if (!listing) {
      req.flash("error_msg", "Огласот не е пронајден.");
      return res.redirect("/dashboard");
    }

    res.render("listings/show", {
      listing,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Серверска грешка");
  }
});

// 3. ПРИКАЖИ ФОРМА ЗА УРЕДУВАЊЕ (GET)
router.get(
  "/edit/:id",
  ensureAuthenticated,
  ensureCompany,
  async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);

      if (!listing) {
        req.flash("error_msg", "Огласот не е пронајден.");
        return res.redirect("/dashboard");
      }

      if (listing.company.toString() !== req.user._id.toString()) {
        req.flash("error_msg", "Немате овластување за оваа акција.");
        return res.redirect("/dashboard");
      }

      res.render("listings/edit", { listing, user: req.user });
    } catch (err) {
      console.error(err);
      res.status(500).send("Серверска грешка");
    }
  },
);

// --- POST РУТИ ---

// 4. Зачувај го огласот во база (POST)
router.post("/create", ensureAuthenticated, ensureCompany, async (req, res) => {
  try {
    const { title, description, location, requirements } = req.body;

    const newListing = new Listing({
      title,
      description,
      location,
      requirements: requirements.split(",").map((s) => s.trim()),
      company: req.user._id,
    });

    await newListing.save();
    req.flash("success_msg", "Огласот е успешно објавен!");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Грешка при креирање оглас");
  }
});

// 5. ЗАЧУВАЈ ГИ ПРОМЕНИТЕ (POST)
router.post(
  "/edit/:id",
  ensureAuthenticated,
  ensureCompany,
  async (req, res) => {
    try {
      const { title, description, location, requirements } = req.body;

      let listing = await Listing.findById(req.params.id);

      if (!listing || listing.company.toString() !== req.user._id.toString()) {
        req.flash("error_msg", "Акцијата е одбиена.");
        return res.redirect("/dashboard");
      }

      listing.title = title;
      listing.description = description;
      listing.location = location;
      listing.requirements = requirements.split(",").map((s) => s.trim());

      await listing.save();

      req.flash("success_msg", "Огласот е успешно ажуриран!");
      res.redirect(`/listings/${listing._id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Грешка при ажурирање на огласот");
    }
  },
);

// 6. ИЗБРИШИ ОГЛАС (POST)
router.post(
  "/delete/:id",
  ensureAuthenticated,
  ensureCompany,
  async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);

      if (!listing) {
        req.flash("error_msg", "Огласот не е пронајден.");
        return res.redirect("/dashboard");
      }

      if (listing.company.toString() !== req.user._id.toString()) {
        req.flash("error_msg", "Немате овластување за оваа акција.");
        return res.redirect("/dashboard");
      }

      await Listing.findByIdAndDelete(req.params.id);

      req.flash("success_msg", "Огласот е успешно избришан.");
      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).send("Грешка при бришење на огласот");
    }
  },
);

module.exports = router;
