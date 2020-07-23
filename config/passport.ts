import * as passport from "passport";
import * as passportLocal from "passport-local";
import * as passportJwt from "passport-jwt";
import { User } from "../models/User";
import { config } from "../config/app";

// tslint:disable-next-line: variable-name
const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      // console.log(username);
      try {
        let user;
        user = await User.findOne({
          $or: [
            {
              email: username.toLowerCase(),
            },
            {
              phone: username,
            },
          ],
        }).select("+password");

        if (!user) {
          return done(undefined, false, {
            message: `user with ${username} not found.`,
          });
        }

        if (!user.comparePassword(password) && !user.compareOtp(password)) {
          return done(null, false, { message: "Incorrect password." });
        }

        if (user.isDeleted) {
          return done(null, false, { message: "User has been deactivated." });
        }

        user = await User.findOne({
          $or: [
            {
              email: username.toLowerCase(),
              isDeleted: false,
            },
            {
              phone: username.toLowerCase(),
              isDeleted: false,
            },
          ],
        });
        console.log(JSON.stringify(user));
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.app.JWT_SECRET,
    },
    (jwtToken, done) => {
      User.findOne({ id: jwtToken.id }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(undefined, user, jwtToken);
        } else {
          return done(undefined, false);
        }
      });
    }
  )
);
module.exports = passport;
