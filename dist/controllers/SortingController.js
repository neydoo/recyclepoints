"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortingController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const auth_1 = require("../middleware/auth");
const DailySorting_1 = require("../models/DailySorting");
let SortingController = class SortingController {
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate } = req.query;
                const criteria = { isDeleted: false };
                if (startDate) {
                    criteria.createdAt = { ">=": startDate };
                }
                if (endDate) {
                    criteria.createdAt = { "<=": endDate };
                }
                const data = yield DailySorting_1.DailySorting.find({ criteria });
                res
                    .status(200)
                    .send({ success: true, message: "data retrieved successfully!", data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    userSortings(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate } = req.query;
                const criteria = { user: req.user.id, isDeleted: false };
                if (startDate) {
                    criteria.createdAt = { ">=": startDate };
                }
                if (endDate) {
                    criteria.createdAt = { "<=": endDate };
                }
                const data = yield DailySorting_1.DailySorting.find({ criteria });
                res
                    .status(200)
                    .send({ success: true, message: "data retrieved successfully!", data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    update(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield DailySorting_1.DailySorting.updateOne({ id: req.params.id }, req.body);
                res.status(200).send({
                    success: true,
                    message: "item updated successfully!",
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
                yield DailySorting_1.DailySorting.updateOne({ id: req.params.id }, { isDeleted: true });
                res.status(200).send({
                    success: true,
                    message: "item disabled successfully!",
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
    core_1.Middleware([auth_1.isAdmin]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SortingController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Get("user"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SortingController.prototype, "userSortings", null);
tslib_1.__decorate([
    core_1.Post("update/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SortingController.prototype, "update", null);
tslib_1.__decorate([
    core_1.Post("remove/:id"),
    core_1.Middleware([auth_1.isDev]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SortingController.prototype, "enable", null);
SortingController = tslib_1.__decorate([
    core_1.Controller("api/sorting"),
    core_1.ClassMiddleware([auth_1.checkJwt])
], SortingController);
exports.SortingController = SortingController;
