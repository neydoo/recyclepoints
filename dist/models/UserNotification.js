"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotification = exports.userNotificationSchema = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = require("mongoose");
const NotificationsService_1 = require("../service/NotificationsService");
const User_1 = require("./User");
exports.userNotificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, default: "unread", enum: ["read", "unread"] },
}, { timestamps: true });
exports.UserNotification = mongoose_1.model("UserNotification", exports.userNotificationSchema);
exports.userNotificationSchema.pre("save", function (next) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const notification = new NotificationsService_1.default();
        const data = this;
        const user = yield User_1.User.findOne({ _id: data.userId });
        if ((_a = user === null || user === void 0 ? void 0 : user.notificationTokens) === null || _a === void 0 ? void 0 : _a.length)
            yield notification.sendPushNotification(data.title, data.body, user.notificationTokens);
        next();
    });
});
