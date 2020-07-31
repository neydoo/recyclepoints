"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = exports.requestSchema = exports.Status = void 0;
const mongoose_1 = require("mongoose");
var Status;
(function (Status) {
    Status["Pending"] = "pending";
    Status["Accepted"] = "accepted";
    Status["Approved"] = "approved";
    Status["Declined"] = "declined";
    Status["Completed"] = "completed";
    Status["Collected"] = "collected";
    Status["Cancelled"] = "cancelled";
})(Status = exports.Status || (exports.Status = {}));
exports.requestSchema = new mongoose_1.Schema({
    requestedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    acceptedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["recycle", "redemption"], required: true },
    items: { type: mongoose_1.Schema.Types.Mixed },
    quantity: { type: Number },
    deliveryType: { type: String, enum: ["home", "pickup"] },
    redemptionItem: { type: mongoose_1.Schema.Types.ObjectId, ref: "RedemptionItem" },
    status: {
        type: String,
        enum: [
            "accepted",
            "pending",
            "completed",
            "collected",
            "cancelled",
            "approved",
            "declined",
        ],
        default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
}, { timestamps: true });
exports.Request = mongoose_1.model("Request", exports.requestSchema);
