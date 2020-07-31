"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verification = exports.verificationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.verificationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    arrivalTime: { type: mongoose_1.Schema.Types.Date, required: true },
    request: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Request" },
    points: { type: Number, default: 0 },
    items: { type: mongoose_1.Schema.Types.Mixed },
    weight: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Verification = mongoose_1.model("Verification", exports.verificationSchema);
