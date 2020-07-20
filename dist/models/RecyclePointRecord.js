"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecyclePointRecord = exports.recyclePointRecordSchema = void 0;
const mongoose_1 = require("mongoose");
exports.recyclePointRecordSchema = new mongoose_1.Schema({
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "RecyclePoint",
        required: true,
    },
    type: { type: String, enum: ["deduction", "addition"], required: true },
    previousAmount: { type: Number, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    balance: { type: Number, required: true },
    details: { type: String, required: true },
}, { timestamps: true });
exports.RecyclePointRecord = mongoose_1.model("RecyclePointRecord", exports.recyclePointRecordSchema);
