"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const tslib_1 = require("tslib");
const CoreService_1 = require("./CoreService");
const cloudinary_1 = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const multer = require("multer");
const bcrypt = require("bcrypt-nodejs");
const NotificationsService_1 = require("./NotificationsService");
const User_1 = require("../models/User");
const UserRepository_1 = require("../abstract/UserRepository");
const UtilService_1 = require("./UtilService");
const file_1 = require("../utilities/file");
const RecyclePoint_1 = require("../models/RecyclePoint");
const app_1 = require("../config/app");
const clodConfig = {
    cloud_name: app_1.config.image.cloud_name,
    api_key: app_1.config.image.api_key,
    api_secret: app_1.config.image.api_secret,
};
class UserService {
    constructor() {
        this.file = new file_1.default();
        this.repository = new UserRepository_1.UserRepository();
        this.core = new CoreService_1.default();
        this.notification = new NotificationsService_1.default();
    }
    create(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const userPayload = req.body;
            let { firstName, lastName, phone, designation } = userPayload;
            if (!firstName || !lastName || !phone || !designation)
                throw new Error("incomplete parameters");
            phone = UtilService_1.UtilService.formatPhone(phone);
            const existingPhone = yield User_1.User.findOne({ phone });
            if (existingPhone)
                throw new Error("user with phonenumber already exists");
            if (!userPayload.password) {
                if (userPayload.designation === "client") {
                    const otp = UtilService_1.UtilService.generate(5);
                    userPayload.otp = otp;
                    userPayload.password = otp;
                    userPayload.unverified = true;
                }
                else {
                    userPayload.password = "123456";
                }
            }
            userPayload.password = bcrypt.hashSync(userPayload.password);
            const createdUser = yield this.repository.createNew(userPayload);
            if (userPayload.designation === User_1.Designation.Client)
                yield this.notification.sendRegistrationSMS(userPayload.phone, userPayload.otp);
            const user = yield this.repository.findById(createdUser.id);
            if (createdUser.designation === "client")
                yield RecyclePoint_1.RecyclePoint.create({ user: createdUser.id });
            user.profileImage = req.body.profileImage
                ? yield this.cloudinaryUploader(req.body.profileImage)
                : null;
            user.save();
            this.core.Email(user, "New Registration", this.core.html('<p style="color: #000">Hello ' +
                user.firstName +
                " " +
                user.lastName +
                ", Thank you for registering at Recycle Points.<br> Please click the link below to complete registration https://fashioncastapi.herokuapp.com/api/activate/" +
                user.temporarytoken +
                "</p>"));
            this.core.activityLog(req, user.id, "Registered");
            this.notification.triggerNotification("notifications", "users", {
                user,
                message: { message: user.lastName + " Just created a new account." },
            }, req, user.id);
            return user;
        });
    }
    createStaff(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const userPayload = req.body;
            let { firstName, lastName, phone, designation } = userPayload;
            if (!firstName || !lastName || !phone || !designation)
                throw new Error("incomplete parameters");
            phone = UtilService_1.UtilService.formatPhone(phone);
            const existingPhone = yield User_1.User.findOne({ phone });
            if (existingPhone)
                throw new Error("user with phonenumber already exists");
            if (!userPayload.password) {
                if (userPayload.designation === "client") {
                    const otp = UtilService_1.UtilService.generate(5);
                    userPayload.otp = otp;
                    userPayload.password = otp;
                    userPayload.unverified = true;
                }
                else {
                    userPayload.password = "123456";
                }
            }
            userPayload.password = bcrypt.hashSync(userPayload.password);
            const createdUser = yield this.repository.createNew(userPayload);
            if (userPayload.designation === User_1.Designation.Client)
                yield this.notification.sendRegistrationSMS(userPayload.phone, userPayload.otp);
            const user = yield this.repository.findById(createdUser.id);
            if (createdUser.designation === "client")
                yield RecyclePoint_1.RecyclePoint.create({ user: createdUser.id });
            user.profileImage = req.body.profileImage
                ? yield this.base64Uploader(req.body.profileImage)
                : null;
            user.save();
            this.core.Email(user, "New Registration", this.core.html('<p style="color: #000">Hello ' +
                user.firstName +
                " " +
                user.lastName +
                ", Thank you for registering at Recycle Points.<br> Please click the link below to complete registration https://fashioncastapi.herokuapp.com/api/activate/" +
                user.temporarytoken +
                "</p>"));
            this.core.activityLog(req, user.id, "Registered");
            this.notification.triggerNotification("notifications", "users", {
                user,
                message: { message: user.lastName + " Just created a new account." },
            }, req, user.id);
            return user;
        });
    }
    update(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const userPayload = req.body;
            if (userPayload.password) {
                userPayload.password = bcrypt.hashSync(req.body.password);
            }
            if (userPayload.phone) {
                const existingPhone = yield User_1.User.findOne({ phone: userPayload.phone });
                if (existingPhone)
                    throw new Error("user with phonenumber already exists");
            }
            const { oldPassword, newPassword, confirmPassword } = req.body;
            if (oldPassword) {
                let user = yield User_1.User.findOne({ _id: req.user.id }).select("+password");
                if (user) {
                    if (confirmPassword && confirmPassword !== newPassword)
                        throw new Error("passwords do not match");
                    if (!user.comparePassword(oldPassword))
                        throw new Error("invalid old password");
                    user.password = bcrypt.hashSync(newPassword);
                    yield user.save();
                }
            }
            else {
                const existingUser = yield this.repository.findById(req.params.userId);
                if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.firstTimeLogin)
                    userPayload.firstTimeLogin = false;
                const user = yield this.repository.updateData(req.params.userId, userPayload);
                user
                    ? (user.profileImage = req.body.profileImage
                        ? yield this.cloudinaryUploader(req.body.profileImage)
                        : user === null || user === void 0 ? void 0 : user.profileImage)
                    : null;
                yield (user === null || user === void 0 ? void 0 : user.save());
                return user;
            }
        });
    }
    updateWeb(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const userPayload = req.body;
            if (userPayload.password) {
                userPayload.password = bcrypt.hashSync(req.body.password);
            }
            if (userPayload.phone) {
                const existingPhone = yield User_1.User.findOne({ phone: userPayload.phone });
                if (existingPhone)
                    throw new Error("user with phonenumber already exists");
            }
            const { oldPassword, newPassword, confirmPassword } = req.body;
            if (oldPassword) {
                let user = yield User_1.User.findOne({ _id: req.user.id }).select("+password");
                if (user) {
                    if (confirmPassword && confirmPassword !== newPassword)
                        throw new Error("passwords do not match");
                    if (!user.comparePassword(oldPassword))
                        throw new Error("invalid old password");
                    user.password = bcrypt.hashSync(newPassword);
                    yield user.save();
                }
            }
            else {
                const existingUser = yield this.repository.findById(req.params.userId);
                if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.firstTimeLogin)
                    userPayload.firstTimeLogin = false;
                const user = yield this.repository.updateData(req.params.userId, userPayload);
                user
                    ? (user.profileImage = req.body.profileImage
                        ? yield this.base64Uploader(req.body.profileImage)
                        : user === null || user === void 0 ? void 0 : user.profileImage)
                    : null;
                yield (user === null || user === void 0 ? void 0 : user.save());
                return user;
            }
        });
    }
    resetPassword(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield this.repository.findOne({
                or: [{ phone: req.body.email }, { email: req.body.email }],
            });
            const password = UtilService_1.UtilService.generate(5);
            user.password = bcrypt.hashSync(password);
            user.otp = bcrypt.hashSync(password);
            yield user.save();
            yield this.notification.sendForgetSMS(user.phone, password);
            this.core.Email(user, "Password Reset", this.core.html(`<p style="color: #000">Hello ${user.firstName} ${user.lastName}, \n\r Your password has been reset. Your new password is ${password} </p>`));
            return user;
        });
    }
    resendOtp(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield this.repository.findOne({ phone: req.body.phone });
            const password = UtilService_1.UtilService.generate(5);
            user.password = bcrypt.hashSync(password);
            user.otp = bcrypt.hashSync(password);
            yield user.save();
            yield this.notification.sendForgetSMS(user.phone, password);
            this.core.Email(user, "Password Reset", this.core.html(`<p style="color: #000">Hello ${user.firstName} ${user.lastName}, \n\r Your password has been reset. Your new password is ${password} </p>`));
            return user;
        });
    }
    cloudinaryUploader(image) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                cloudinary_1.v2.config(clodConfig);
                const formattedImage = `data:image/png;base64,${image}`;
                const url = yield cloudinary_1.v2.uploader.upload(formattedImage);
                return url.secure_url;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    base64Uploader(image) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                cloudinary_1.v2.config(clodConfig);
                const url = yield cloudinary_1.v2.uploader.upload(image);
                return url.secure_url;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.UserService = UserService;
