"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ActivityLog_1 = require("../models/ActivityLog");
const request = require("request");
const nodemailer = require("nodemailer");
const logger_1 = require("@overnightjs/logger");
const app_1 = require("../config/app");
class CoreService {
    constructor() {
        this.client = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: app_1.config.mail.auth.api_user,
                pass: app_1.config.mail.auth.api_key,
            },
        });
        this.options = {
            method: "POST",
            url: app_1.config.sms.termii.url,
            headers: {
                "Content-Type": ["application/json", "application/json"],
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
            this.client.sendMail(email, (err, info) => {
                if (err) {
                    logger_1.Logger.Imp(err);
                }
                else {
                    logger_1.Logger.Imp("Message sent: " + info.response);
                }
            });
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
                from: "talert",
                sms: message,
                type: "plain",
                channel: "generic",
                api_key: app_1.config.sms.termii.apiKey,
            };
            const options = this.options;
            options.body = JSON.stringify(data);
            const response = request(options);
            console.log(response.body);
        });
    }
}
exports.default = CoreService;
