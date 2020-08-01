"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.userSchema = exports.Designation = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const UtilService_1 = require("../service/UtilService");
var Designation;
(function (Designation) {
    Designation["Buster"] = "buster";
    Designation["Sorter"] = "sorter";
    Designation["Admin"] = "admin";
    Designation["Dev"] = "dev";
    Designation["Operator"] = "operator";
    Designation["Staff"] = "verification-staff";
    Designation["Client"] = "client";
})(Designation = exports.Designation || (exports.Designation = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    otp: { type: String, select: false },
    email: {
        type: String,
        lowercase: true,
        validate: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
        index: { unique: true },
    },
    phone: { type: String, unique: true },
    password: { type: String, select: false },
    notificationTokens: { type: mongoose_1.Schema.Types.Array, select: false },
    pay: { type: Number, default: 0 },
    target: { type: String },
    country: { type: String },
    state: { type: String },
    lga: { type: String },
    ageRange: { type: String },
    landmark: { type: String },
    targetType: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
    },
    designation: {
        type: String,
        enum: [
            "buster",
            "admin",
            "dev",
            "sorter",
            "baler",
            "verification-staff",
            "client",
        ],
    },
    profileImage: { type: String, default: null },
    cloudImage: { type: String, default: null },
    isDeleted: { type: Boolean, required: true, default: false },
    unverified: { type: Boolean, required: true, default: false },
    active: { type: Boolean, required: true, default: true },
    deletedAt: { type: String, default: null },
    firstTimeLogin: { type: Boolean, default: true },
}, { timestamps: true });
exports.userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};
exports.userSchema.methods.compareOtp = function (candidatePassword) {
    return this.otp ? bcrypt.compareSync(candidatePassword, this.otp) : false;
};
exports.userSchema.methods.fullName = function () {
    return this.firstName.trim() + " " + this.lastName.trim();
};
exports.userSchema.pre("save", function (next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = this;
        data.phone = UtilService_1.UtilService.formatPhone(data.phone);
        next();
    });
});
exports.User = mongoose_1.model("User", exports.userSchema);
