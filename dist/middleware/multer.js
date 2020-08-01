"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const cloudinary_1 = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const multer = require("multer");
const app_1 = require("../config/app");
const cloudConfig = {
    cloud_name: app_1.config.image.cloud_name,
    api_key: app_1.config.image.api_key,
    api_secret: app_1.config.image.api_secret,
};
exports.upload = (req, res, next) => {
    cloudinary_1.v2.config(cloudConfig);
    const storage = cloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        folder: "pics",
        allowedFormats: ["jpg", "png"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    });
    const parser = multer({ storage });
    parser.single("profileImage");
    next();
};
