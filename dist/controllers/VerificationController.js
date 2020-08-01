"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const tslib_1 = require("tslib");
const moment = require("moment");
const core_1 = require("@overnightjs/core");
const AbstractController_1 = require("./AbstractController");
const RequestRepository_1 = require("../abstract/RequestRepository");
const auth_1 = require("../middleware/auth");
const Verification_1 = require("../models/Verification");
const RequestService_1 = require("../service/RequestService");
const NotificationsService_1 = require("../service/NotificationsService");
const Request_1 = require("../models/Request");
const PdfService_1 = require("../service/PdfService");
const UserNotification_1 = require("src/models/UserNotification");
let VerificationController = class VerificationController extends AbstractController_1.AbstractController {
    constructor() {
        super(new RequestRepository_1.RequestRepository());
        this.request = new RequestService_1.RequestService();
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, search, pay, type, product, arrivalTime, } = req.query;
                const criteria = { isDeleted: false };
                const searchCriteria = { designation: "verification-staff" };
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
                    searchCriteria.or = [
                        { firstName: /search/ },
                        { lastName: /search/ },
                        { address: /search/ },
                        { phone: /search/ },
                    ];
                }
                const data = yield Verification_1.Verification.find(criteria).populate({
                    path: "user",
                    match: searchCriteria,
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
                const { weight, arrivalTime } = req.body;
                if (!weight || !arrivalTime)
                    throw new Error("missing values");
                const notification = new NotificationsService_1.default();
                const itemrequest = (yield Request_1.Request.findById(req.params.id).populate("requestedBy"));
                let items;
                let points;
                if (itemrequest.type === "redemption")
                    throw new Error("invalid request selected");
                if (itemrequest.type === "recycle") {
                    if (itemrequest.status === "completed")
                        throw new Error("request is already completed");
                    items = req.body.items ? req.body.items : itemrequest.items;
                    if (!items) {
                        throw new Error("there are no recycle items for this request");
                    }
                    points = yield this.request.calculatePoints(items);
                    const details = "recycle";
                    yield this.request.addPoints(points, itemrequest.id, itemrequest.requestedBy, details);
                    itemrequest.points = points;
                }
                itemrequest.status = Request_1.Status.Completed;
                itemrequest.items = items;
                yield itemrequest.save();
                yield UserNotification_1.UserNotification.create({
                    userId: itemrequest.requestedBy.id,
                    title: "points awarded",
                    body: `you've recieved ${itemrequest.points} points`,
                });
                yield Verification_1.Verification.create({
                    user: req.user.id,
                    items,
                    weight,
                    arrivalTime,
                    request: itemrequest.id,
                    points,
                });
                res
                    .status(200)
                    .json({ success: true, message: "saved", data: itemrequest });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getAvailableRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const itemrequest = (yield Request_1.Request.find({
                    status: Request_1.Status.Collected,
                }).populate("requestedBy"));
                res
                    .status(200)
                    .json({ success: true, message: "saved", data: itemrequest });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getData(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { PET, UBC, ONP, BCC, GBS, PWS, name, arrivalTime, startDate, endDate, pay, } = req.query;
                const criteria = {};
                const SubCriteria = {};
                if (name) {
                    SubCriteria.$or = [{ firstName: /search/ }, { lastName: /search/ }];
                }
                if (arrivalTime)
                    criteria.arrivalTime = arrivalTime;
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                if (pay)
                    SubCriteria.pay = pay;
                const sorting = yield Verification_1.Verification.find(criteria).populate({
                    path: "user",
                    match: SubCriteria,
                });
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
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VerificationController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Post("new"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VerificationController.prototype, "create", null);
tslib_1.__decorate([
    core_1.Get("collected"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VerificationController.prototype, "getAvailableRequests", null);
tslib_1.__decorate([
    core_1.Get("data"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VerificationController.prototype, "getData", null);
tslib_1.__decorate([
    core_1.Post("data/pdf"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VerificationController.prototype, "downloadPdf", null);
VerificationController = tslib_1.__decorate([
    core_1.Controller("api/verification"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], VerificationController);
exports.VerificationController = VerificationController;
