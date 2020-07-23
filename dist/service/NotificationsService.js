"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Notification_1 = require("../models/Notification");
const CoreService_1 = require("./CoreService");
const UtilService_1 = require("./UtilService");
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
            const coreService = new CoreService_1.default();
            const utilService = new UtilService_1.UtilService();
            number = utilService.formatPhone(number);
            const message = "Thank you for registering with Recycle Points. Here's your code: " + otp;
            yield coreService.sendSms(message, number);
        });
    }
    sendForgetSMS(number, otp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const coreService = new CoreService_1.default();
            const utilService = new UtilService_1.UtilService();
            number = utilService.formatPhone(number);
            const message = "You forgot your password? Here's your code: " + otp;
            yield coreService.sendSms(message, number);
        });
    }
}
exports.default = NotificationsService;
