"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var passport = require("passport");
var passportLocal = require("passport-local");
var passportJwt = require("passport-jwt");
var User_1 = require("../models/User");
var app_1 = require("../config/app");
// tslint:disable-next-line: variable-name
var LocalStrategy = passportLocal.Strategy;
var JwtStrategy = passportJwt.Strategy;
var ExtractJwt = passportJwt.ExtractJwt;
passport.use(new LocalStrategy({ usernameField: "username", passwordField: "password" }, function (username, password, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                user = void 0;
                return [4 /*yield*/, User_1.User.findOne({
                        $or: [
                            {
                                email: username.toLowerCase()
                            },
                            {
                                phone: username
                            },
                        ]
                    }).select("+password +otp")];
            case 1:
                user = _a.sent();
                // console.log(JSON.stringify(user));
                if (!user) {
                    return [2 /*return*/, done(undefined, false, {
                            message: "user with " + username + " not found."
                        })];
                }
                console.log('here');
                if (!user.comparePassword(password) && !user.compareOtp(password)) {
                    return [2 /*return*/, done(null, false, { message: "Incorrect password." })];
                }
                console.log('here2');
                if (user.isDeleted) {
                    return [2 /*return*/, done(null, false, { message: "User has been deactivated." })];
                }
                console.log('here');
                return [4 /*yield*/, User_1.User.findOne({
                        $or: [
                            {
                                email: username.toLowerCase(),
                                isDeleted: false
                            },
                            {
                                phone: username.toLowerCase(),
                                isDeleted: false
                            },
                        ]
                    })];
                console.log('here3');
                case 2:
                user = _a.sent();
                // console.log(JSON.stringify(user));
                return [2 /*return*/, done(null, user)];
            case 3:
                err_1 = _a.sent();
                return [2 /*return*/, done(err_1)];
            case 4: return [2 /*return*/];
        }
    });
}); }));
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User_1.User.findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: app_1.config.app.JWT_SECRET
}, function (jwtToken, done) {
    User_1.User.findOne({ id: jwtToken.id }, function (err, user) {
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
