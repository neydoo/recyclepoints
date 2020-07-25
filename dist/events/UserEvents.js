"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEvents = void 0;
const tslib_1 = require("tslib");
const EventEmitter = require("events");
const CoreService_1 = require("../service/CoreService");
const NotificationsService_1 = require("../service/NotificationsService");
class UserEvents extends EventEmitter.EventEmitter {
    constructor() {
        super();
        this.user = process.env.user;
        this.core = new CoreService_1.default();
        this.notification = new NotificationsService_1.default();
        this.on("onRegister", this.onRegister);
    }
    onRegister() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = this.user;
            this.core.Email(user, "New Registration", this.core.html('<p style="color: #000">Hello ' + user.first_name + " " + user.last_name + ", Thank you for registering at fashionCast.<br> Please click the link below to complete registration https://fashioncastapi.herokuapp.com/api/activate/" + user.temporarytoken + "</p>"));
            this.sms.sendSms(user.phone, `Hello ${user.first_name} this is your activation code ${user.phone_code}`);
            this.core.activity_log(this.req, user.id, "Registered");
            this.notification.triggerNotification("notifications", "users", { user, message: { message: user.last_name + " Just created a new account." } }, this.req);
        });
    }
    onActivate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = this.user;
            if (user.is_active === false) {
                this.core.Email(user, "Account De-activated", this.core.html(`<p style="color: #000">Hello  ${user.first_name} ${user.last_name}, Thank you for using Refill. Your Account has been de-activated please contact support for re-activation @ refill.com.ng \n\r Thank You.`));
            }
            else {
                this.core.Email(user, "Account Activated", this.core.html(`<p style="color: #000">Hello ${user.first_name} ${user.last_name}, Thank you for registering at Refill. Your Account has been activated successfully.`));
            }
            this.core.activity_log(this.req, user.id, "Activated Account");
        });
    }
    onLogin() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = this.user;
            this.core.activity_log(this.req, user.id, "User logged into account");
        });
    }
    onLogout() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = this.user;
            this.core.activity_log(this.req, user.id, "User logged out of account");
        });
    }
}
exports.UserEvents = UserEvents;
