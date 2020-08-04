"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faq = exports.faqSchema = void 0;
const mongoose_1 = require("mongoose");
exports.faqSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Faq = mongoose_1.model("Faq", exports.faqSchema);
