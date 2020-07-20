"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.notificationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.notificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    type: { type: String, required: true },
    data: { type: Object, required: true },
    status: { type: String, default: false },
}, { timestamps: true });
exports.Notification = mongoose_1.model("Notification", exports.notificationSchema);
