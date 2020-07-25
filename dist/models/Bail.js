"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bail = exports.dailySortingSchema = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = require("mongoose");
const RequestService_1 = require("../service/RequestService");
exports.dailySortingSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    sorts: { type: Number, default: 0 },
    items: { type: mongoose_1.Schema.Types.Mixed },
    arrivalTime: { type: Date, default: Date.now() },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.dailySortingSchema.methods.points = function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield RequestService_1.RequestService.prototype.calculatePoints(this.items);
    });
};
exports.Bail = mongoose_1.model("Bail", exports.dailySortingSchema);
