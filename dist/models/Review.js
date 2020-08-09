"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = exports.reviewSchema = void 0;
const mongoose_1 = require("mongoose");
exports.reviewSchema = new mongoose_1.Schema({
    recycle: { type: mongoose_1.Schema.Types.ObjectId, ref: "Request" },
    buster: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    reviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    message: {
        type: String,
    },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Review = mongoose_1.model("Review", exports.reviewSchema);
