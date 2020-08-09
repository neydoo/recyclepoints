"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedemptionItemController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const auth_1 = require("../middleware/auth");
const RedemptionItem_1 = require("../models/RedemptionItem");
const file_1 = require("../utilities/file");
const UserService_1 = require("../service/UserService");
let RedemptionItemController = class RedemptionItemController {
    constructor() {
        this.file = new file_1.default();
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield RedemptionItem_1.RedemptionItem.find({
                    isDeleted: false,
                });
                res
                    .status(200)
                    .send({ success: true, message: "data retrieved successfully!", data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    create(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const { image, name, recyclePoints } = data;
                if (!name || !recyclePoints)
                    throw new Error(" incomplete data");
                const userService = new UserService_1.UserService();
                data.image = yield userService.base64Uploader(image);
                const newData = yield RedemptionItem_1.RedemptionItem.create(data);
                res.status(200).send({
                    success: true,
                    message: "item created successfully!",
                    data: newData,
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    remove(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const recycle = yield RedemptionItem_1.RedemptionItem.updateOne({ _id: req.params.id }, { isDeleted: true });
                res.status(200).send({
                    success: true,
                    message: "item deleted successfully!",
                    recycle
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    enable(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield RedemptionItem_1.RedemptionItem.updateOne({ _id: req.params.id }, { isDeleted: false });
                res.status(200).send({
                    success: true,
                    message: "item enabled successfully!",
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
};
tslib_1.__decorate([
    core_1.Get(""),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RedemptionItemController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Post("new"),
    core_1.Middleware([auth_1.isAdmin]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RedemptionItemController.prototype, "create", null);
tslib_1.__decorate([
    core_1.Post("remove/:id"),
    core_1.Middleware([auth_1.isAdmin]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RedemptionItemController.prototype, "remove", null);
tslib_1.__decorate([
    core_1.Post("enable/:id"),
    core_1.Middleware([auth_1.isAdmin]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RedemptionItemController.prototype, "enable", null);
RedemptionItemController = tslib_1.__decorate([
    core_1.Controller("api/redemption-item"),
    core_1.ClassMiddleware([auth_1.checkJwt])
], RedemptionItemController);
exports.RedemptionItemController = RedemptionItemController;
