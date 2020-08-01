"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportJwt = require("passport-jwt");
const User_1 = require("../models/User");
const app_1 = require("../config/app");
const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let user;
        user = yield User_1.User.findOne({
            $or: [
                {
                    email: email.toLowerCase(),
                },
                {
                    phone: email,
                },
            ],
        }).select("+password +otp");
        if (!user) {
            return done(undefined, false, {
                message: `user with ${email} not found.`,
            });
        }
        if (user.isDeleted) {
            return done(null, false, { message: "User has been deactivated." });
        }
        if (!user.comparePassword(password) && !user.compareOtp(password)) {
            return done(null, false, { message: "Incorrect password." });
        }
        user = yield User_1.User.findOne({
            $or: [
                {
                    email: email.toLowerCase(),
                    isDeleted: false,
                },
                {
                    phone: email.toLowerCase(),
                    isDeleted: false,
                },
            ],
        });
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
})));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User_1.User.findById(id, (err, user) => {
        done(err, user);
    });
});
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: app_1.config.app.JWT_SECRET,
}, (jwtToken, done) => {
    User_1.User.findOne({ id: jwtToken.id }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(undefined, user, jwtToken);
        }
        else {
            return done(undefined, false);
        }
    });
}));
module.exports = passport;
