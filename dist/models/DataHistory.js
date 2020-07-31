"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataHistory = exports.dataHistorySchema = exports.Status = void 0;
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
exports.dataHistorySchema = new mongoose_1.Schema({
    date: { type: mongoose_1.Schema.Types.Date, required: true },
    sortingWeight: { type: Number, required: true },
    balingWeight: { type: Number, required: true },
    items: { type: mongoose_1.Schema.Types.Mixed, required: true },
    pointsEarned: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.DataHistory = mongoose_1.model("DataHistory", exports.dataHistorySchema);
