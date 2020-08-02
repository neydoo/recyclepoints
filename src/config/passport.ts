import * as passport from "passport";
import * as passportLocal from "passport-local";
import * as passportJwt from "passport-jwt";
import { User, Designation } from "../models/User";
import { config } from "../config/app";
import { UtilService } from "../service/UtilService";

// tslint:disable-next-line: variable-name
const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      const phone = UtilService.formatPhone(email);
      const criteria = [
        {
          email: email.toLowerCase(),
        },
        {
          phone,
        },
        {
          phone: `0${phone.slice(3)}`,
        },
        {
          phone: `+${phone}`,
        },
      ];
      try {
        let user;
        user = await User.findOne({
          $or: criteria,
        }).select("+password +otp");

        if (!user) {
          return done(undefined, false, {
            message: `user with ${email} not found.`,
          });
        }

        if (user.isDeleted) {
          return done(null, false, { message: "User has been deactivated." });
        }

        // if (
        //   user.designation === Designation.Client &&
        //   user!.unverified &&
        //   !user.compareOtp(password)
        // ) {
        //   return done(null, false, { message: "verify phonenumber." });
        // }

        if (!user.comparePassword(password) && !user.compareOtp(password)) {
          return done(null, false, { message: "Incorrect password." });
        }

        user = await User.findById(user.id);
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
