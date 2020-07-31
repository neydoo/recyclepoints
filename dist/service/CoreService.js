"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ActivityLog_1 = require("../models/ActivityLog");
const axios_1 = require("axios");
const sgMail = require("@sendgrid/mail");
const app_1 = require("../config/app");
sgMail.setApiKey(app_1.config.mail.sendgrid.api_key);
class CoreService {
    constructor() {
        this.options = {
            method: "POST",
            url: app_1.config.sms.termii.url,
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
    activityLog(req, userId, description) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (userId) {
                const logs = yield ActivityLog_1.ActivityLog.create({
                    userId,
                    description,
                    ipAddress: req.header("x-forwarded-for") || req.connection.remoteAddress,
                });
                return logs;
            }
        });
    }
    Email(data, subject, message) {
        try {
            const email = {
                from: app_1.config.app.name,
                to: data.email ? data.email : app_1.config.app.email,
                subject,
                html: message,
            };
        }
        catch (error) {
            throw new Error(error);
        }
    }
    html(data) {
        return `<div id="content" style="background-color: #1D4BB7width:100%">
            <nav>
                <div class="container-fluid">
                    <span><a href="https://refill-app.herokuapp.com"><img src="https://refillappapi.herokuapp.com/uploads/images/refill_logo.png" style="width: 120px height: 45px padding:10px" class="img-responsive"></a></span>
                </div>
            </nav>
            <div style="background-color: #fefefepadding:20pxcolor:#000">${data}</div>
        </div>`;
    }
    sendSms(message, number) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!message || !number)
                return;
            const data = {
                to: number,
                from: "N-Alert",
                sms: message,
                type: "plain",
                channel: "dnd",
                api_key: app_1.config.sms.termii.apiKey,
            };
            const options = this.options;
            options.url += "/sms/send";
            options.data = data;
            console.log(options);
            try {
                const response = yield axios_1.default(options);
                console.log(response.data);
                if (Math.abs(response.data.balance) < 50) {
                    const data = {
                        email: "enoch4real7@gmail.com",
                        subject: "low sms balance",
                        text: "",
                        html: "",
                    };
                    data.text = "We are glad to have you on board";
                    data.html = `<p> Please top up sms balance- N${Math.abs(response.data.balance)}</p>`;
                    this.sendMail(data);
                }
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
    }
    sendMail(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const msg = {
                    to: data.email,
                    from: "support@recyclepoints.com",
                    subject: data.subject,
                    text: data.text,
                    html: data.html,
                };
                sgMail.send(msg);
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
}
exports.default = CoreService;
