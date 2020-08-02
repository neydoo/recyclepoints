"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortingController = void 0;
const tslib_1 = require("tslib");
const moment = require("moment");
const core_1 = require("@overnightjs/core");
const auth_1 = require("../middleware/auth");
const DailySorting_1 = require("../models/DailySorting");
const PdfService_1 = require("../service/PdfService");
const User_1 = require("../models/User");
let SortingController = class SortingController {
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, search, pay, type, product, arrivalTime, } = req.query;
                const criteria = { isDeleted: false };
                const searchCriteria = { designation: "sorter" };
                let users = [];
                if (startDate) {
                    criteria.createdAt = {
                        $lte: endDate ? endDate : moment(),
                        $gte: startDate,
                    };
                }
                if (pay) {
                    searchCriteria.pay = pay;
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
                if (search) {
                    searchCriteria.$or = [
                        { firstName: { $regex: search, $options: "i" } },
                        { lastName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { phone: { $regex: search, $options: "i" } },
                    ];
                    users = yield User_1.User.find(searchCriteria);
                }
                if (users === null || users === void 0 ? void 0 : users.length) {
                    const userIds = users.map((u) => u.id);
                    criteria.requestedBy = userIds;
                }
                else if (!users.length && search) {
                    criteria.requestedBy = null;
                }
                const data = yield DailySorting_1.DailySorting.find(criteria).populate("user");
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
                const user = req.params.id ? req.params.id : req.user.id;
                const criteria = { user, isDeleted: false };
                if (startDate) {
                    criteria.createdAt = {
                        $lte: endDate ? endDate : moment(),
                        $gte: startDate,
                    };
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
    create(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { weight, points, arrivalTime, items } = req.body;
                if (!weight || !points || !arrivalTime || !items)
                    throw new Error("incomplete parameters");
                const sortData = req.body;
                sortData.user = req.user.id;
                const data = yield DailySorting_1.DailySorting.create(sortData);
                res.status(200).send({
                    success: true,
                    message: "item saved successfully!",
                    data,
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    update(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield DailySorting_1.DailySorting.updateOne({ id: req.params.id }, req.body, {
                    new: true,
                });
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
    getData(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { PET, UBC, ONP, BCC, GBS, PWS, name, arrivalTime, startDate, endDate, pay, userId, } = req.query;
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
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                const sorting = yield DailySorting_1.DailySorting.find(criteria).populate("user");
                const sortingPromise = sorting.map((sort) => {
                    const item = {};
                    if (UBC) {
                        item.UBC = sort.items.UBC;
                    }
                    if (PWS) {
                        item.PWS = sort.items.PWS;
                    }
                    if (ONP) {
                        item.ONP = sort.items.ONP;
                    }
                    if (BCC) {
                        item.BCC = sort.items.BCC;
                    }
                    if (GBS) {
                        item.GBS = sort.items.GBS;
                    }
                    if (PET) {
                        item.PET = sort.items.PET;
                    }
                    return (sort.items = item);
                });
                yield Promise.all(sortingPromise);
                res.status(200).json({ success: true, message: "saved", data: sorting });
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
], SortingController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Get("user/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SortingController.prototype, "userSortings", null);
tslib_1.__decorate([
    core_1.Post("new"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SortingController.prototype, "create", null);
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
tslib_1.__decorate([
    core_1.Get("data"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SortingController.prototype, "getData", null);
tslib_1.__decorate([
    core_1.Post("data/pdf"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SortingController.prototype, "downloadPdf", null);
SortingController = tslib_1.__decorate([
    core_1.Controller("api/sorting"),
    core_1.ClassMiddleware([auth_1.checkJwt])
], SortingController);
exports.SortingController = SortingController;
