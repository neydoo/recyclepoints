"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const app_1 = require("../config/app");
const UserService_1 = require("../service/UserService");
const UserRepository_1 = require("../abstract/UserRepository");
let AuthController = class AuthController {
    constructor() {
        this.repository = new UserRepository_1.UserRepository();
        this.auth = new UserService_1.UserService();
    }
    registerUser(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.auth.create(req);
                const token = jwt.sign({ username: user.designation, email: user.email, userId: user.id }, app_1.config.app.JWT_SECRET);
                res.status(200).json({ success: true, user, token });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    activateUser(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.repository.findById(req.params.id);
                user.isDeleted = false;
                user.save();
                res
                    .status(200)
                    .json({ success: true, user, message: "user activated successfully" });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    authenticateUser(req, res, next) {
        passport.authenticate("local", { session: false }, (err, user, info) => {
            if (err) {
                return next({ err });
            }
            if (!user) {
                const message = info.message ? info.message : "invalid credentials";
                return res.status(400).json({ success: false, info, message });
            }
            else {
                req.logIn(user, { session: false }, (err) => {
                    if (err) {
                        return res.json(err.message);
                    }
                    const token = jwt.sign({ designation: user.designation, email: user.email, id: user.id }, app_1.config.app.JWT_SECRET);
                    res.status(200).json({ success: true, user, token });
                });
            }
        })(req, res, next);
    }
    verifyOTP(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { phone } = req.params;
                const user = yield this.repository.find({ phone });
                if (!user)
                    throw new Error("invalid phone number");
                if (user.otp !== req.body.otp)
                    throw new Error("invalid otp");
                res.status(200).json({ success: true, user });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
};
tslib_1.__decorate([
    core_1.Post("register"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "registerUser", null);
tslib_1.__decorate([
    core_1.Put("activate/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "activateUser", null);
tslib_1.__decorate([
    core_1.Post("login"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Function]),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "authenticateUser", null);
tslib_1.__decorate([
    core_1.Post("verify-token/:phone"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOTP", null);
AuthController = tslib_1.__decorate([
    core_1.Controller("api/auth"),
    tslib_1.__metadata("design:paramtypes", [])
], AuthController);
exports.AuthController = AuthController;
