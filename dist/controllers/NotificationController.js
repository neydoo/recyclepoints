"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const auth_1 = require("../middleware/auth");
const CoreService_1 = require("../service/CoreService");
const User_1 = require("../models/User");
let NotificationController = class NotificationController {
    testSms(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const message = "hi there";
                const number = req.params.number;
                const core = new CoreService_1.default();
                yield core.sendSms(message, number);
                res.status(200).send({
                    success: true,
                    message: "message sent",
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    saveToken(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.user;
                yield User_1.User.updateOne({ _id: id }, { $addToSet: { notificationTokens: req.body.token } });
                res.status(200).send({
                    success: true,
                    message: "token saved",
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    retrieveToken(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.user;
                const user = yield User_1.User.findOne({ _id: id });
                const userTokens = user.notificationTokens ? user.notificationTokens : [];
                res.status(200).send({
                    success: true,
                    message: "message sent",
                    data: userTokens,
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
};
tslib_1.__decorate([
    core_1.Post("sms-test/:number"),
    core_1.Middleware([auth_1.isDev]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationController.prototype, "testSms", null);
tslib_1.__decorate([
    core_1.Post("save-token"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationController.prototype, "saveToken", null);
tslib_1.__decorate([
    core_1.Post("retrieve-token"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationController.prototype, "retrieveToken", null);
NotificationController = tslib_1.__decorate([
    core_1.Controller("api/notification"),
    core_1.ClassMiddleware([auth_1.checkJwt])
], NotificationController);
exports.NotificationController = NotificationController;
