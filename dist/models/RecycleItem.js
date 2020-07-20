"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecycleItem = exports.recycleItemSchema = void 0;
const mongoose_1 = require("mongoose");
exports.recycleItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    recyclePoints: { type: Number, required: true, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.RecycleItem = mongoose_1.model("RecycleItem", exports.recycleItemSchema);
