"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bail = exports.dailySortingSchema = void 0;
const mongoose_1 = require("mongoose");
exports.dailySortingSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    sorts: { type: Number, default: 0 },
    items: { type: mongoose_1.Schema.Types.Mixed },
    arrivalTime: { type: Date, default: Date.now() },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Bail = mongoose_1.model("Bail", exports.dailySortingSchema);
