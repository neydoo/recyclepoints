"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserObserver = void 0;
const logger_1 = require("@overnightjs/logger");
class UserObserver {
    constructor(user) {
        this.user = user;
    }
    sendEmail() {
        logger_1.Logger.Info(`Sending a mail to ${this.user.fullName}`);
    }
    sendSms() {
        logger_1.Logger.Info(`Sending a sms to ${this.user.phone}`);
    }
}
exports.UserObserver = UserObserver;
