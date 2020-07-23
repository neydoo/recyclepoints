"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const auth_1 = require("../middleware/auth");
const CoreService_1 = require("../service/CoreService");
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
};
tslib_1.__decorate([
    core_1.Post("sms-test/:number"),
    core_1.Middleware([auth_1.isDev]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationController.prototype, "testSms", null);
NotificationController = tslib_1.__decorate([
    core_1.Controller("api/sms/test"),
    core_1.ClassMiddleware([auth_1.checkJwt])
], NotificationController);
exports.NotificationController = NotificationController;
