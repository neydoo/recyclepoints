"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedemptionItem = exports.redemptionItemSchema = void 0;
const mongoose_1 = require("mongoose");
exports.redemptionItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    recyclePoints: { type: Number, required: true, default: 0 },
    image: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.RedemptionItem = mongoose_1.model("RedemptionItem", exports.redemptionItemSchema);
