const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const Listing = require("../models/Listing");
const Application = require("../models/Application");
const Activity = require("../models/Activity");
const PDFDocument = require("pdfkit");
const path = require("path");
const Notification = require("../models/Notification");
const internshipCheck = require("../middleware/internshipCheck");

// ==========================================
// 1. ОСНОВНИ РУТИ (WELCOME & DASHBOARD)
// ==========================================

router.get("/", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/dashboard");
  res.render("welcome");
});

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    let { search, location } = req.query;
    search = search ? search.trim() : "";
    location = location ? location.trim() : "";

    let listings;
    let applications = [];
    let query = {};

    if (req.user.role === "company") {
      listings = await Listing.find({ company: req.user._id }).sort({
        dateCreated: -1,
      });
      applications = await Application.find({ company: req.user._id })
        .populate("student", "name email phone linkedin")
        .populate("listing", "title")
        .sort({ dateApplied: -1 });
    } else {
      if (search !== "") query.title = { $regex: search, $options: "i" };
      if (location !== "") query.location = { $regex: location, $options: "i" };

      listings = await Listing.find(query)
        .populate("company", "name")
        .sort({ dateCreated: -1 });
      applications = await Application.find({ student: req.user._id })
        .populate("listing", "title location")
        .populate("company", "name")
        .sort({ dateApplied: -1 });
    }

    res.render("dashboard", {
      user: req.user,
      listings,
      applications,
      search,
      location,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Грешка при вчитување на податоците.");
  }
});

// ==========================================
// 2. СТУДЕНТСКИ ИНТЕРФЕЈС (INTERNSHIP HUB)
// ==========================================

// GET: Приказ на Internship Hub
// GET: Приказ на Internship Hub
router.get("/internship-hub", ensureAuthenticated, async (req, res) => {
  try {
    // 1. БАРАЊЕ НА АПЛИКАЦИЈА (Прво активна, па завршена)
    // Тргната е строгата проверка за req.user.onInternship на почеток за да дозволи пристап до PDF
    let activeApplication = await Application.findOne({
      student: req.user._id,
      status: "прифатено",
    }).populate("company");

    // Ако нема активна, бараме последна завршена (за архива и принтање)
    if (!activeApplication) {
      activeApplication = await Application.findOne({
        student: req.user._id,
        status: "completed",
      })
        .sort({ createdAt: -1 })
        .populate("company");
    }

    // Ако воопшто нема никаква апликација (ни активна, ни завршена)
    if (!activeApplication) {
      req.flash("error_msg", "Не е пронајдена историја или активна пракса.");
      return res.redirect("/dashboard");
    }

    // 2. Влечење на активности ИЗОЛИРАНИ само за оваа апликација
    const activities = await Activity.find({
      application: activeApplication._id,
      student: req.user._id,
    }).sort({ date: -1 });

    // 3. ПРЕСМЕТКА НА СТАТИСТИКА
    const uniqueDates = [
      ...new Set(
        activities.map((act) => new Date(act.date).toISOString().split("T")[0]),
      ),
    ];

    const activitiesCount = uniqueDates.length;
    const requiredDays = activeApplication.requiredDays || 20;
    const excusedDays = activeApplication.excusedDays || 0;

    const remainingDays = Math.max(
      0,
      requiredDays - (activitiesCount + excusedDays),
    );

    res.render("internship-hub", {
      user: req.user,
      company: activeApplication.company,
      application: activeApplication,
      applicationId: activeApplication._id,
      requiredDays: requiredDays,
      activities: activities,
      activitiesCount: activitiesCount,
      remainingDays: remainingDays,
      title: "Центар за евиденција 🚀",
    });
  } catch (err) {
    console.error("Грешка при вчитување на Internship Hub:", err);
    res.status(500).send("Серверска грешка.");
  }
});

// POST: Додавање активност
router.post("/internship-hub/add", ensureAuthenticated, async (req, res) => {
  try {
    const { applicationId, description, hours, lat, lng } = req.body;

    // 1. ВЧИТУВАЊЕ И ПОПУЛАЦИЈА (Клучно за да знаеме кој е професорот)
    const app = await Application.findById(applicationId).populate("student");

    // Дозволуваме влез ако е 'прифатено' ИЛИ ако веќе е 'completed' (за дополнителни записи)
    if (!app || (app.status !== "прифатено" && app.status !== "completed")) {
      req.flash("error_msg", "Праксата не е активна или е веќе архивирана.");
      return res.redirect("/internship-hub");
    }

    // 2. КРЕИРАЊЕ НА АКТИВНОСТА
    const newActivity = new Activity({
      application: applicationId,
      student: req.user._id,
      description,
      hours: hours || 8,
      date: new Date(),
      location: {
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      },
    });
    await newActivity.save();

    // 3. ПРЕСМЕТКА НА КВОТА (Твојата логика со Set за уникатни датуми)
    const allActivities = await Activity.find({ application: applicationId });
    const uniqueDatesCount = new Set(
      allActivities.map((a) => new Date(a.date).toISOString().split("T")[0]),
    ).size;

    const totalDaysReached = uniqueDatesCount + (app.excusedDays || 0);
    const requiredDays = app.requiredDays || 20;
    const quotaMet = totalDaysReached >= requiredDays;

    // 4. ПОДГОТОВКА НА ПОДАТОЦИ ЗА АЖУРИРАЊЕ
    const updateData = {
      pendingPing: false,
      pingMessage: "",
      lastActivity: new Date(),
      activitiesCount: uniqueDatesCount,
    };

    // Ако квотата е исполнета, го менуваме статусот
    if (quotaMet) {
      console.log("Квотата е исполнета!");
      console.log("Студент:", app.student._id);
      console.log("Професор ID на студентот:", app.student.professor);
      updateData.status = "completed";
      updateData.isCompleted = true;
      updateData.completedAt = new Date();

      // Исклучување на глобалниот статус на ученикот
      const User = require("../models/User");
      await User.findByIdAndUpdate(req.user._id, { onInternship: false });

      // --- НОВА ЛОГИКА ЗА НОТИФИКАЦИЈА ---
      // Проверуваме дали студентот има поврзан професор во базата
      if (app.student && app.student.professor) {
        console.log("✅ Нотификацијата е пратена во база!");
        const Notification = require("../models/Notification");

        // Прво проверуваме дали веќе постои нотификација за завршена пракса за оваа апликација
        // (за да не го „спамаме“ професорот со секој нов запис по 20-тиот ден)
        const existingNotif = await Notification.findOne({
          recipient: app.student.professor,
          sender: req.user._id,
          type: "internship_finished",
        });

        if (!existingNotif) {
          const newNotif = new Notification({
            recipient: app.student.professor,
            sender: req.user._id,
            type: "internship_finished",
            message: `Ученикот ${req.user.name} ја заврши праксата (${totalDaysReached}/${requiredDays} дена)!`,
            link: `/professor/view-log/${app._id}`, // Провери дали оваа рута постои кај тебе
            isRead: false,
            createdAt: new Date(),
          });
          await newNotif.save();
          console.log("✅ Нотификацијата е успешно креирана за професорот.");
        }
      } else {
        console.log(
          "⚠️ Нотификацијата не е пратена: Студентот нема поврзан професор.",
        );
      }
    }

    // 5. ЗАЧУВУВАЊЕ НА ПРОМЕНИТЕ
    await Application.findByIdAndUpdate(applicationId, { $set: updateData });

    // 6. ПОВРАТНИ ПОРУКИ
    if (quotaMet) {
      req.flash(
        "success_msg",
        "Честитки! Ја завршивте праксата. Професорот е известен.",
      );
    } else {
      req.flash("success_msg", "Активноста е успешно запишана!");
    }

    res.redirect("/internship-hub");
  } catch (err) {
    console.error("КРИТИЧНА ГРЕШКА ПРИ ЗАПИС:", err);
    res.status(500).send("Грешка при додавање активност.");
  }
});

// ==========================================
// 3. ПРОФЕСОРСКИ ИНТЕРФЕЈС
// ==========================================

router.get("/professor/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    // 1. Листа на сите студенти од истото училиште (за делот "Пронајди нови")
    const allStudents = await User.find({
      school: req.user.school,
      role: "student",
    });

    // 2. Студенти кои веќе ги менаџира овој професор
    const managedStudents = await User.find({
      _id: { $in: req.user.managedStudents || [] },
    });

    // 3. Наоѓање на активните апликации (статуси кои ти веќе ги користиш)
    const activeApps = await Application.find({
      student: { $in: req.user.managedStudents || [] },
      status: { $in: ["прифатено", "completed"] },
    }).populate("student company");

    // 4. ДОДАВАЊЕ НА НОВАТА ЛОГИКА ЗА ПРОГРЕС И АКТИВНОСТИ
    const appsWithCounts = await Promise.all(
      activeApps.map(async (app) => {
        // Преброј колку записи има во Activity за оваа апликација
        const count = await Activity.countDocuments({ application: app._id });

        // Најди го датумот на последниот запис
        const lastAct = await Activity.findOne({ application: app._id }).sort({
          date: -1,
        });

        // Дефинирање на потребни денови (од апликацијата или глобален стандард)
        const reqDays = app.requiredDays || req.user.defaultPracticeDays || 21;

        // Вкупен прогрес (сработени денови + оправдани од тебе)
        const totalReached = count + (app.excusedDays || 0);

        return {
          ...app._doc,
          activitiesCount: count, // Ова го полни прогрес-барот во EJS
          lastActivity: lastAct ? lastAct.date : app.dateApplied, // За проверка на инактивност
          requiredDays: reqDays,
          isFinishedMath: totalReached >= reqDays, // Го отклучува копчето за АРХИВИРАЈ
        };
      }),
    );

    res.render("professor/dashboard", {
      user: req.user,
      students: allStudents,
      managedStudents: managedStudents,
      activeApps: appsWithCounts,
    });
  } catch (err) {
    console.error("Грешка при вчитување на професорскиот дашборд:", err);
    res.status(500).send("Грешка при вчитување.");
  }
});

// ОПРАВДАЈ ДЕН
router.post("/professor/excuse-day", ensureAuthenticated, async (req, res) => {
  try {
    const { applicationId } = req.body;
    await Application.findByIdAndUpdate(applicationId, {
      $inc: { excusedDays: 1 },
    });
    res.redirect("/professor/dashboard");
  } catch (err) {
    res.status(500).send("Грешка.");
  }
});

// АРХИВИРАЈ ПРАКСА
router.post(
  "/professor/archive-application",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const { applicationId, professorComment } = req.body;

      const updatedApp = await Application.findByIdAndUpdate(
        applicationId,
        {
          status: "archived", // Смени во archived за да го тргнеш од активна листа
          professorComment: professorComment || "",
          archivedAt: new Date(), // Додади датум на архивирање
          pendingPing: false,
        },
        { new: true },
      );

      if (!updatedApp) {
        req.flash("error_msg", "Апликацијата не е пронајдена.");
        return res.redirect("/professor/dashboard");
      }

      // Осигурај се дека ученикот е дефинитивно исклучен од активна пракса
      await User.findByIdAndUpdate(updatedApp.student, { onInternship: false });

      req.flash(
        "success_msg",
        "Праксата е успешно архивирана и префрлена во историја.",
      );
      res.redirect("/professor/dashboard");
    } catch (err) {
      console.error("Грешка при архивирање:", err);
      res.status(500).send("Грешка при архивирање.");
    }
  },
);

// ПРЕДУПРЕДИ ГЛОБАЛНИ ДЕНОВИ
router.post(
  "/professor/update-global-days",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const { defaultDays } = req.body;
      await User.findByIdAndUpdate(req.user._id, {
        defaultPracticeDays: parseInt(defaultDays),
      });

      const managedIds = req.user.managedStudents;
      await Application.updateMany(
        { student: { $in: managedIds }, status: "прифатено" },
        { requiredDays: parseInt(defaultDays) },
      );

      req.flash("success_msg", "Деновите се ажурирани за сите активни пракси.");
      res.redirect("/professor/dashboard");
    } catch (err) {
      res.status(500).send("Грешка.");
    }
  },
);

// ПРЕЗЕМИ УЧЕНИК
router.post(
  "/professor/claim-student",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const { studentId } = req.body;

      // 1. Професорот го додава студентот во својата листа (managedStudents)
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { managedStudents: studentId },
      });

      // 2. Студентот го зачувува професорот кај себе (Клучно за нотификациите)
      // Ова овозможува app.student.professor да не биде undefined
      await User.findByIdAndUpdate(studentId, {
        professor: req.user._id,
      });

      req.flash("success_msg", "Ученикот е успешно преземен.");
      res.redirect("/professor/dashboard");
    } catch (err) {
      console.error("Грешка при преземање студент:", err);
      res.status(500).send("Грешка на серверот.");
    }
  },
);

// ПРЕГЛЕД НА ДНЕВНИК (За професор)
router.get(
  "/professor/view-log/:applicationId",
  ensureAuthenticated,
  async (req, res) => {
    try {
      if (req.user.role !== "professor") return res.redirect("/dashboard");

      const application = await Application.findById(
        req.params.applicationId,
      ).populate("student company");

      if (!application) {
        req.flash("error_msg", "Апликацијата не е пронајдена.");
        return res.redirect("/professor/dashboard");
      }

      const activities = await Activity.find({
        application: req.params.applicationId,
      }).sort({ date: -1 });

      // НОВА ФУНКЦИОНАЛНОСТ: Означи ги нотификациите како прочитани
      // Кога професорот ќе го отвори овој специфичен дневник,
      // сите нотификации поврзани со овој студент/настан се означуваат како прочитани.
      const Notification = require("../models/Notification");
      await Notification.updateMany(
        {
          recipient: req.user._id,
          sender: application.student._id,
          isRead: false,
        },
        { isRead: true },
      );

      res.render("professor/view-log", {
        user: req.user,
        application,
        activities,
      });
    } catch (err) {
      console.error("Грешка при преглед на дневник:", err);
      res.status(500).send("Грешка на серверот.");
    }
  },
);

router.post(
  "/professor/bulk-archive",
  ensureAuthenticated,
  async (req, res) => {
    try {
      // 1. Земаме selectedIds (бидејќи така се вика 'name' во твојот EJS)
      let { selectedIds } = req.body;

      // 2. КРИТИЧНО: Претворање од текст во вистинска низа
      if (typeof selectedIds === "string") {
        try {
          selectedIds = JSON.parse(selectedIds);
        } catch (e) {
          // Ако е само еден ID и не е JSON формат
          selectedIds = [selectedIds];
        }
      }

      if (!selectedIds || selectedIds.length === 0) {
        req.flash("error_msg", "Немате избрано апликации.");
        return res.redirect("/professor/dashboard");
      }

      // 3. Најди ги апликациите пред да ги архивираш (за да ги земеш студентите)
      const apps = await Application.find({ _id: { $in: selectedIds } });
      const studentIds = apps.map((app) => app.student);

      // 4. Групно ажурирање на апликациите
      await Application.updateMany(
        { _id: { $in: selectedIds } },
        {
          status: "archived",
          completedAt: new Date(),
          pendingPing: false,
        },
      );

      // 5. Ослободување на студентите
      await User.updateMany(
        { _id: { $in: studentIds } },
        { onInternship: false },
      );

      req.flash(
        "success_msg",
        `Успешно архивиравте ${selectedIds.length} пракси.`,
      );
      res.redirect("/professor/dashboard");
    } catch (err) {
      // Ова ќе ти каже во терминалот ТОЧНО што е грешката (на пр. ValidationError или TypeError)
      console.error("Грешка во bulk-archive:", err);
      res.status(500).send("Грешка при масовно архивирање: " + err.message);
    }
  },
);

router.post(
  "/professor/ping-student",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const { applicationId } = req.body;

      // Наоѓање на апликацијата и вклучување на знаменцето за "пинг"
      await Application.findByIdAndUpdate(applicationId, {
        pendingPing: true,
      });

      req.flash("success_msg", "Студентот е успешно опоменат.");
      res.redirect("/professor/dashboard");
    } catch (err) {
      console.error("Грешка при опомена:", err);
      res.status(500).send("Грешка на серверот");
    }
  },
);

router.get("/notifications", ensureAuthenticated, async (req, res) => {
  try {
    // 1. Увези го моделот ВНАТРЕ во рутата ако не е на врвот на фајлот
    const Notification = require("../models/Notification");

    // 2. Најди ги сите нотификации за професорот
    const allNotifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email"); // Повлечи име и мејл на студентот

    // 3. Означи ги како прочитани (за да се исчисти ѕвончето)
    if (allNotifications.length > 0) {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true },
      );
    }

    // 4. Рендерирање (Провери дали патеката до EJS е точна)
    res.render("notifications", {
      user: req.user,
      notifications: allNotifications,
      title: "Сите известувања",
    });
  } catch (err) {
    // ОВА ЌЕ ТИ КАЖЕ ВО ТЕРМИНАЛОТ ШТО ТОЧНО Е ГРЕШКАТА
    console.error("КРИТИЧНА ГРЕШКА ВО /notifications:", err);
    res
      .status(500)
      .send("Грешка при вчитување на известувањата: " + err.message);
  }
});

router.get("/professor/archive", ensureAuthenticated, async (req, res) => {
  try {
    // Ги наоѓаме само архивираните апликации кои му припаѓаат на овој професор
    // (Претпоставуваме дека професорот ги менаџира преку неговите студенти)
    const archivedApps = await Application.find({
      status: "archived",
      student: { $in: req.user.managedStudents },
    }).populate("student company");

    res.render("professor/archive", {
      user: req.user,
      applications: archivedApps,
      title: "Архива на пракси",
    });
  } catch (err) {
    res.status(500).send("Грешка при вчитување на архивата.");
  }
});

// ==========================================
// 4. ГЕНЕРИРАЊЕ PDF ИЗВЕШТАЈ
// ==========================================

router.get(
  "/professor/generate-report/:applicationId",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const application = await Application.findById(
        req.params.applicationId,
      ).populate("student company");
      const activities = await Activity.find({
        application: application._id,
      }).sort({ date: 1 });

      const doc = new PDFDocument({ margin: 50 });
      const fontPath = path.join(__dirname, "../public/fonts/Arial.ttf");
      doc.font(fontPath);

      const filename = `Izvestaj_${application.student.name.replace(/\s+/g, "_")}.pdf`;
      res.setHeader(
        "Content-disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-type", "application/pdf");
      doc.pipe(res);

      doc
        .fontSize(20)
        .text("ИЗВЕШТАЈ ЗА РЕАЛИЗИРАНА ПРАКТИЧНА НАСТАВА", { align: "center" });
      doc
        .moveDown()
        .fontSize(12)
        .text(`Училиште: ${application.student.school || "VET Училиште"}`);
      doc.text(`Студент: ${application.student.name}`);
      doc.text(`Компанија: ${application.company.name}`);
      doc
        .moveDown()
        .fontSize(14)
        .text("Дневник на активности:", { underline: true })
        .moveDown();

      activities.forEach((act, i) => {
        doc
          .fontSize(10)
          .text(
            `${i + 1}. [${new Date(act.date).toLocaleDateString("mk-MK")}] - ${act.hours} часа - ${act.description}`,
          );
        if (doc.y > 700) doc.addPage();
      });

      doc
        .moveDown(3)
        .text("____________________", 50)
        .text("Потпис на Ментор", 50);
      doc
        .text("____________________", 350, doc.y - 30)
        .text("Потпис на Професор", 350);

      doc.end();
    } catch (err) {
      res.status(500).send("Грешка при PDF.");
    }
  },
);

// ==========================================
// 5. ПРОФИЛ (GET & POST)
// ==========================================

router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", {
    user: req.user,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });
});

router.post("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const { name, phone, linkedin, website, description, school, lat, lng } =
      req.body;

    // 1. Најди го корисникот
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect("/profile");
    }

    // 2. Ажурирај основни полиња (само ако се пратени)
    user.name = name || user.name;
    user.phone = phone || user.phone;

    // 3. Улога-специфични полиња
    if (user.role === "student") {
      user.linkedin = linkedin || "";
      // Внимавај: ако school не е во EJS како input, тргни ја оваа линија
      if (school) user.school = school;
    } else if (user.role === "company") {
      user.website = website || "";
      user.description = description || "";

      if (lat && lng) {
        user.location = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        };
        user.markModified("location"); // Ова е клучно за објекти!
      }
    } else if (user.role === "professor") {
      if (school) user.school = school;
    }

    // 4. Зачувај
    await user.save();

    req.flash("success_msg", "Профилот е успешно ажуриран!");
    res.redirect("/profile");
  } catch (err) {
    console.error("Грешка при профил:", err);
    req.flash("error_msg", "Грешка при зачувување.");
    res.redirect("/profile");
  }
});

// ==========================================
// 6. LANG (GET & POST)
// ==========================================
router.get("/set-language/:lang", (req, res) => {
  const lang = req.params.lang;
  if (["en", "mk"].includes(lang)) {
    res.cookie("lang", lang, { maxAge: 1000 * 60 * 60 * 24 * 365 }); // 1 year expiry
  }
  const returnTo = req.get("Referer") || "/";
  res.redirect(returnTo);
});

module.exports = router;
