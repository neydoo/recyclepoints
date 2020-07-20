"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = exports.activitySchema = void 0;
const mongoose_1 = require("mongoose");
exports.activitySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    description: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.ActivityLog = mongoose_1.model("ActivityLog", exports.activitySchema);
