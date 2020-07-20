"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecyclePoint = exports.recyclePointSchema = void 0;
const mongoose_1 = require("mongoose");
exports.recyclePointSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    balance: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.RecyclePoint = mongoose_1.model("RecyclePoint", exports.recyclePointSchema);
