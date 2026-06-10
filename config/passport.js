const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Вчитај го моделот на корисникот
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // 1. Провери дали постои корисникот
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Тој меил не е регистриран" });
          }

          // 2. Провери ја лозинката
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Неточна лозинка" });
            }
          });
        })
        .catch((err) => console.log(err));
    }),
  );

  // Серијализација (зачувување на ID во сесијата)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Десеријализација (вадење на корисникот од базата преку ID-то во сесијата)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
