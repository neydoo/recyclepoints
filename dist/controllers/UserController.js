"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const tslib_1 = require("tslib");
const bcrypt = require("bcrypt-nodejs");
const core_1 = require("@overnightjs/core");
const AbstractController_1 = require("./AbstractController");
const UserRepository_1 = require("../abstract/UserRepository");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const UserService_1 = require("../service/UserService");
const UtilService_1 = require("../service/UtilService");
const NotificationsService_1 = require("../service/NotificationsService");
let UserController = class UserController extends AbstractController_1.AbstractController {
    constructor() {
        super(new UserRepository_1.UserRepository());
        this.user = new UserService_1.UserService();
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, status, designation, search } = req.query;
                const criteria = {
                    isDeleted: false,
                };
                const searchCriteria = {
                    isDeleted: false,
                };
                if (designation) {
                    criteria.designation = designation;
                }
                if (startDate) {
                    criteria.createdAt = { ">=": startDate };
                    if (endDate) {
                        criteria.createdAt = { "<=": endDate };
                    }
                    criteria.createdAt = { "<=": Date.now() };
                }
                if (status) {
                    criteria.status = status;
                }
                if (search) {
                    criteria.or = [
                        { firstName: /search/ },
                        { lastName: /search/ },
                        { address: /search/ },
                        { phone: /search/ },
                    ];
                }
                const user = yield User_1.User.find(criteria);
                res.status(200).send({ success: true, data: user });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    registerUser(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.user.create(req);
                res
                    .status(200)
                    .json({ success: true, user, message: "user created successfully!" });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    updateUser(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.user.update(req);
                res.status(200).json({
                    success: true,
                    data: user,
                    message: "user updated successfully",
                });
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    findUser(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.repository.findById(req.params.userId);
                res.status(200).json({ success: true, data: user });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    destroy(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this.repository.forceDelete(req.params.id);
                res
                    .status(200)
                    .send({ success: true, message: "user deleted successfully" });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    resetPassword(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this.user.resetPassword(req);
                res
                    .status(200)
                    .send({ success: true, message: "password reset successful" });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    resendOtp(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield this.repository.findOne({ phone: req.body.phone });
            const password = UtilService_1.UtilService.generate(5);
            user.password = bcrypt.hashSync(password);
            user.otp = bcrypt.hashSync(password);
            const notification = new NotificationsService_1.default();
            yield user.save();
            yield notification.sendForgetSMS(user.phone, password);
            res
                .status(200)
                .send({ success: true, message: "code sent" });
        });
    }
};
tslib_1.__decorate([
    core_1.Get(""),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Post("register"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "registerUser", null);
tslib_1.__decorate([
    core_1.Put("update/:userId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
tslib_1.__decorate([
    core_1.Get(":userId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "findUser", null);
tslib_1.__decorate([
    core_1.Delete("destroy/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "destroy", null);
tslib_1.__decorate([
    core_1.Post("reset"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "resetPassword", null);
UserController = tslib_1.__decorate([
    core_1.Controller("api/users"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], UserController);
exports.UserController = UserController;
