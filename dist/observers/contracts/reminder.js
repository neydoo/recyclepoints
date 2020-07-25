"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reminder = void 0;
const logger_1 = require("@overnightjs/logger");
class Reminder {
    constructor() {
        this.observers = [];
    }
    addObserver(ob) {
        this.observers.push(ob);
    }
    removeObserver(observer) {
        this.observers.splice(this.observers.indexOf(observer), 1);
    }
    sendSmsReminder() {
        logger_1.Logger.Info("sending test reminder:");
        this.observers.map((observer) => observer.sendSms());
    }
    sendEmailReminder() {
        logger_1.Logger.Info("sending test reminder:");
        this.observers.map((observer) => observer.sendEmail());
    }
    sendReminder() {
        logger_1.Logger.Info("sending test reminder:");
        this.observers.map((observer) => observer.sendEmail());
        this.observers.map((observer) => observer.sendSms());
    }
    emptyObserver() {
        this.observers = [];
    }
}
exports.Reminder = Reminder;
