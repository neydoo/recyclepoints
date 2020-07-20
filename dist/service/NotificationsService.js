"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Notification_1 = require("../models/Notification");
const CoreService_1 = require("./CoreService");
class NotificationsService {
    constructor() {
    }
    triggerNotification(notifications = "notifications", type, data, req, userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.saveNotification((notifications = "notifications"), type, data, userId);
        });
    }
    saveNotification(notifications = "notifications", type, data, userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notify = yield Notification_1.Notification.create({
                userId,
                name: notifications,
                type,
                data: JSON.stringify(data),
            });
            return notify;
        });
    }
    sendRegistrationSMS(number, otp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = "Thank you for registering for Recycle Points. Here's your otp: " + otp;
            yield CoreService_1.default.prototype.sendSms(message, number);
        });
    }
}
exports.default = NotificationsService;
