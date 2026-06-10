const Notification = require("../models/Notification");

module.exports = async (req, res, next) => {
  if (req.user && req.user.role === "professor") {
    try {
      // Влечи ги последните 5 БЕЗ РАЗЛИКА дали се прочитани
      const allRecent = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5);

      // Број ги само тие што се навистина нови за баџот
      const unreadCount = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false,
      });

      res.locals.notifications = allRecent;
      res.locals.unreadCount = unreadCount;
    } catch (err) {
      res.locals.notifications = [];
      res.locals.unreadCount = 0;
    }
  } else {
    res.locals.notifications = [];
    res.locals.unreadCount = 0;
  }
  next();
};
