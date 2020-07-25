"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
exports.userSchema = new mongoose_1.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    username: { type: String, required: true, index: { unique: true } },
    email: {
        type: String,
        lowercase: true,
        required: true,
        validate: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
        index: { unique: true },
    },
    phone: { type: String },
    password: { type: String },
    profile_image: { type: String, default: null },
    cloud_image: { type: String, default: null },
    is_active: { type: Boolean, required: true, default: false },
    deleted_at: { type: String, default: null },
}, { timestamps: true });
exports.userSchema.methods.hashPassword = (candidatePassword) => {
    return bcrypt.hashSync(candidatePassword, bcrypt.genSaltSync(10));
};
exports.userSchema.methods.comparePassword = function (candidatePassword) {
    bcrypt.compareSync(candidatePassword, this.password);
};
exports.userSchema.methods.fullName = function () {
    return (this.firstName.trim() + " " + this.lastName.trim());
};
exports.User = mongoose_1.model("User", exports.userSchema);
