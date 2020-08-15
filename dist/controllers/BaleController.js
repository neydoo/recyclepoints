"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaleController = void 0;
const tslib_1 = require("tslib");
const moment = require("moment");
const core_1 = require("@overnightjs/core");
const auth_1 = require("../middleware/auth");
const Bale_1 = require("../models/Bale");
const User_1 = require("../models/User");
const PdfService_1 = require("../service/PdfService");
let BaleController = class BaleController {
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, search, pay, type, product, arrivalTime, } = req.query;
                const criteria = { isDeleted: false };
                const searchCriteria = { designation: "baler" };
                if (startDate) {
                    criteria.createdAt = {
                        $lte: endDate ? endDate : moment(),
                        $gte: startDate,
                    };
                }
                let users = [];
                if (pay || name) {
                    if (pay)
                        searchCriteria.pay = pay;
                    if (search) {
                        searchCriteria.$or = [
                            { firstName: { $regex: search, $options: "i" } },
                            { lastName: { $regex: search, $options: "i" } },
                            { address: { $regex: search, $options: "i" } },
                            { phone: { $regex: search, $options: "i" } },
                        ];
                    }
                    users = yield User_1.User.find(searchCriteria);
                }
                if (users === null || users === void 0 ? void 0 : users.length) {
                    const userIds = users.map((u) => u.id);
                    criteria.user = userIds;
                }
                else if (!users.length && name) {
                    criteria.user = null;
                }
                if (type) {
                    criteria.type = type;
                }
                if (product) {
                    criteria.item = product;
                }
                if (arrivalTime) {
                    criteria.arrivalTime = arrivalTime;
                }
                const data = yield Bale_1.Bale.find({ criteria }).populate("user");
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
                const user = req.user.id;
                const { arrivalTime, activityType, amount, weight, type } = req.body;
                if (!arrivalTime || !activityType || !weight || !type)
                    throw new Error("incomplete items");
                if (type == "crush") {
                    const crushActivityTypes = ["flakes", "regrind"];
                    if (!crushActivityTypes.includes(activityType))
                        throw new Error("invalid crush type");
                }
                if (type == "bale") {
                    const crushActivityTypes = ["sorted", "unsorted"];
                    if (!crushActivityTypes.includes(activityType))
                        throw new Error("invalid bale type");
                }
                const newData = req.body;
                newData.user = user;
                yield Bale_1.Bale.create(newData);
                res
                    .status(200)
                    .send({ success: true, message: "data retrieved successfully!" });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getBalings(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id ? req.params.id : req.user.id;
                const data = yield Bale_1.Bale.find({ user: id });
                res.status(200).send({
                    success: true,
                    message: "data retreived successfully!",
                    data,
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
                yield Bale_1.Bale.updateOne({ id: req.params.id }, { isDeleted: true });
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
    dashboardData(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const bales = yield Bale_1.Bale.find({ user: req.params.id });
                const today = moment().startOfDay();
                const yesterday = moment().startOfDay().subtract(1, "day");
                const data = {
                    yesterday: 0,
                    today: 0,
                    allTime: bales.length,
                };
                const balesPromise = bales.map((sort) => {
                    if (sort.createdAt >= today)
                        data.today += 1;
                    if (sort.createdAt >= yesterday)
                        data.yesterday += 1;
                });
                yield Promise.all(balesPromise);
                res.status(200).send({
                    success: true,
                    message: "dashboard info retrieved",
                    data,
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getData(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { PET, UBC, ONP, BCC, GBS, PWS, name, arrivalTime, startDate, endDate, pay, type, userId, } = req.query;
                const criteria = {};
                const subCriteria = {};
                let users = [];
                if (pay || name) {
                    if (pay)
                        subCriteria.pay = pay;
                    if (name) {
                        subCriteria.$or = [
                            { firstName: { $regex: name, $options: "i" } },
                            { lastName: { $regex: name, $options: "i" } },
                        ];
                    }
                    users = yield User_1.User.find(subCriteria);
                }
                if ((users === null || users === void 0 ? void 0 : users.length) && !userId) {
                    const userIds = users.map((u) => u.id);
                    criteria.user = userIds;
                }
                else if (!users.length && name) {
                    criteria.user = null;
                }
                else if (userId) {
                    criteria.user = userId;
                }
                if (arrivalTime)
                    criteria.arrivalTime = arrivalTime;
                if (type)
                    criteria.type = type;
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                const sorting = yield Bale_1.Bale.find(criteria).populate("user");
                res
                    .status(200)
                    .json({ success: true, message: "data retrieved", data: sorting });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    downloadPdf(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const pdf = new PdfService_1.PdfService();
                const file = yield pdf.generateStaffDataPdf(data);
                res.status(200).json({ success: true, message: "saved", data: file });
            }
            catch (error) { }
        });
    }
};
tslib_1.__decorate([
    core_1.Get(""),
    core_1.Middleware([auth_1.isAdmin]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BaleController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Post("new"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BaleController.prototype, "create", null);
tslib_1.__decorate([
    core_1.Get("user/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BaleController.prototype, "getBalings", null);
tslib_1.__decorate([
    core_1.Post("remove/:id"),
    core_1.Middleware([auth_1.isDev]),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BaleController.prototype, "enable", null);
tslib_1.__decorate([
    core_1.Get("dashboard/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BaleController.prototype, "dashboardData", null);
tslib_1.__decorate([
    core_1.Get("data"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BaleController.prototype, "getData", null);
tslib_1.__decorate([
    core_1.Post("data/pdf"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BaleController.prototype, "downloadPdf", null);
BaleController = tslib_1.__decorate([
    core_1.Controller("api/bale"),
    core_1.ClassMiddleware([auth_1.checkJwt])
], BaleController);
exports.BaleController = BaleController;
