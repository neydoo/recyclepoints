"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bale = exports.baleSchema = void 0;
const mongoose_1 = require("mongoose");
exports.baleSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    type: { type: String, required: true, enum: ["crush", "bale"] },
    activityType: {
        type: String,
        required: true,
        enum: ["sorted", "unsorted", "flakes", "regrind"],
    },
    amount: { type: Number, required: true },
    weight: { type: Number, required: true },
    arrivalTime: { type: Date, default: Date.now() },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Bale = mongoose_1.model("Bale", exports.baleSchema);
