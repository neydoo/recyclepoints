"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cloudinary = require("cloudinary");
const logger_1 = require("@overnightjs/logger");
const path = require("path");
class File {
    constructor() {
        this.dir = "uploads";
        this.cloudinaryEnv = cloudinary.v2.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_APP_KEY,
            api_secret: process.env.CLOUD_APP_SECRET,
        });
    }
    localUpload(file, dest, extension) {
        if (typeof file !== "undefined" || file !== "" || file !== null) {
            return this.uploadFile(file, dest, extension);
        }
        return "";
    }
    cloudUpload(file) {
        if (typeof file !== "undefined" || file !== "" || file !== null) {
            this.cloudinaryEnv.uploader.upload(file, (error, result) => {
                if (error) {
                    logger_1.Logger.Imp(error);
                }
                if (result) {
                    return result.url;
                }
            });
        }
        return;
    }
    uploadFile(file, dest, extension) {
        let image = file.replace(/^data:.*,/, "");
        image = image.replace(/ /g, "+");
        const bitmap = new Buffer(image, "base64");
        const url = this.dir + dest + "-" + Date.now() + extension;
        this.ensureDirectoryExistence(url);
        fs.writeFileSync(url, bitmap);
        return url;
    }
    ensureDirectoryExistence(filePath) {
        var dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        this.ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }
}
exports.default = File;
