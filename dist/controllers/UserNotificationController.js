"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotificationController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const auth_1 = require("../middleware/auth");
const UserNotification_1 = require("../models/UserNotification");
let UserNotificationController = class UserNotificationController {
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { id: userId } = req.user;
                const data = yield UserNotification_1.UserNotification.find({ userId });
                res.status(200).send({
                    success: true,
                    message: "notifications retreived",
                    data,
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    markRead(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { id: userId } = req.user;
                const { id } = req.params;
                const notification = yield UserNotification_1.UserNotification.findById(id);
                if (!(notification === null || notification === void 0 ? void 0 : notification.userId) !== userId)
                    return;
                res.status(200).send({
                    success: true,
                    message: "marked as read",
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
};
tslib_1.__decorate([
    core_1.Get(""),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserNotificationController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Post("read/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserNotificationController.prototype, "markRead", null);
UserNotificationController = tslib_1.__decorate([
    core_1.Controller("api/user-notification"),
    core_1.ClassMiddleware([auth_1.checkJwt])
], UserNotificationController);
exports.UserNotificationController = UserNotificationController;
