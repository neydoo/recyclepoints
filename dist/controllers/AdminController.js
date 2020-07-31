"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const tslib_1 = require("tslib");
const moment = require("moment");
const core_1 = require("@overnightjs/core");
const AbstractController_1 = require("./AbstractController");
const RequestRepository_1 = require("../abstract/RequestRepository");
const auth_1 = require("../middleware/auth");
const Request_1 = require("../models/Request");
const RequestService_1 = require("../service/RequestService");
const NotificationsService_1 = require("../service/NotificationsService");
const User_1 = require("../models/User");
const Review_1 = require("../models/Review");
const Verification_1 = require("../models/Verification");
const DailySorting_1 = require("../models/DailySorting");
const Bale_1 = require("../models/Bale");
const DataHistory_1 = require("../models/DataHistory");
let AdminController = class AdminController extends AbstractController_1.AbstractController {
    constructor() {
        super(new RequestRepository_1.RequestRepository());
        this.request = new RequestService_1.RequestService();
    }
    dashboardInfo(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const data = {
                    recycler: { total: 0, active: 0 },
                    buster: { total: 0, active: 0 },
                    sorter: { total: 0, active: 0 },
                    operator: { total: 0, active: 0 },
                    staff: { total: 0, active: 0 },
                    monthlyRecycle: {
                        jan: 0,
                        feb: 0,
                        mar: 0,
                        apr: 0,
                        may: 0,
                        jun: 0,
                        jul: 0,
                        aug: 0,
                        sep: 0,
                        oct: 0,
                        nov: 0,
                        dec: 0,
                    },
                    dataHistory: {},
                };
                const allUsers = yield User_1.User.find({});
                const sorting = allUsers.map((user) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (user.designation === User_1.Designation.Buster) {
                        data.buster.total += 1;
                        const lastBust = yield Request_1.Request.findOne({
                            isDeleted: false,
                            acceptedBy: user.id,
                        }).sort("desc");
                        if (moment(lastBust === null || lastBust === void 0 ? void 0 : lastBust.createdAt).diff("days") < 30)
                            data.buster.active += 1;
                    }
                    if (user.designation === User_1.Designation.Sorter) {
                        data.sorter.total += 1;
                        const lastOperation = yield DailySorting_1.DailySorting.findOne({
                            isDeleted: false,
                            user: user.id,
                        }).sort("desc");
                        if (moment(lastOperation === null || lastOperation === void 0 ? void 0 : lastOperation.createdAt).diff("days") < 30)
                            data.sorter.active += 1;
                    }
                    if (user.designation === User_1.Designation.Operator) {
                        data.operator.total += 1;
                        const lastOperation = yield Bale_1.Bale.findOne({
                            isDeleted: false,
                            user: user.id,
                        }).sort("desc");
                        if (moment(lastOperation === null || lastOperation === void 0 ? void 0 : lastOperation.createdAt).diff("days") < 30)
                            data.operator.active += 1;
                    }
                    if (user.designation === User_1.Designation.Staff) {
                        data.staff.total += 1;
                        const lastVerification = yield Verification_1.Verification.findOne({
                            isDeleted: false,
                            user: user.id,
                        }).sort("desc");
                        if (moment(lastVerification === null || lastVerification === void 0 ? void 0 : lastVerification.createdAt).diff("days") < 30)
                            data.staff.active += 1;
                    }
                    if (user.designation === User_1.Designation.Client) {
                        data.recycler.total += 1;
                        const lastRequest = yield Request_1.Request.findOne({
                            type: "recycle",
                            isDeleted: false,
                            user: user.id,
                        }).sort("desc");
                        if (moment(lastRequest === null || lastRequest === void 0 ? void 0 : lastRequest.createdAt).diff("days") < 120)
                            data.recycler.active += 1;
                    }
                }));
                let allRecycles = yield Request_1.Request.find({
                    isDeleted: false,
                    type: "recycle",
                });
                const janStart = moment().startOf("year");
                const janEnd = janStart.endOf("month");
                const febStart = janStart.add(1, "month");
                const febEnd = febStart.endOf("month");
                const marchStart = febStart.add(1, "month");
                const marchEnd = marchStart.endOf("month");
                const aprStart = marchStart.add(1, "month");
                const aprEnd = aprStart.endOf("month");
                const mayStart = aprStart.add(1, "month");
                const mayEnd = mayStart.endOf("month");
                const junStart = mayStart.add(1, "month");
                const junEnd = junStart.endOf("month");
                const julStart = junStart.add(1, "month");
                const julEnd = julStart.endOf("month");
                const augStart = julStart.add(1, "month");
                const augEnd = augStart.endOf("month");
                const sepStart = augStart.add(1, "month");
                const sepEnd = sepStart.endOf("month");
                const octStart = sepStart.add(1, "month");
                const octEnd = octStart.endOf("month");
                const novStart = sepStart.add(1, "month");
                const novEnd = novStart.endOf("month");
                const decStart = novStart.add(1, "month");
                const decEnd = decStart.endOf("month");
                const recycleGraph = allRecycles.map((recycle) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) {
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= janStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= janEnd)
                            data.monthlyRecycle.jan += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= febStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= febEnd)
                            data.monthlyRecycle.feb += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= marchStart &&
                            (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= marchEnd)
                            data.monthlyRecycle.mar += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= aprStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= aprEnd)
                            data.monthlyRecycle.apr += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= mayStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= mayEnd)
                            data.monthlyRecycle.may += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= junStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= junEnd)
                            data.monthlyRecycle.jun += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= julStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= julEnd)
                            data.monthlyRecycle.jul += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= augStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= augEnd)
                            data.monthlyRecycle.aug += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= sepStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= sepEnd)
                            data.monthlyRecycle.sep += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= octStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= octEnd)
                            data.monthlyRecycle.oct += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= novStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= novEnd)
                            data.monthlyRecycle.nov += 1;
                        if ((recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= decStart && (recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= decEnd)
                            data.monthlyRecycle.dec += 1;
                    }
                }));
                data.dataHistory = yield DataHistory_1.DataHistory.find({}).limit(5);
                yield Promise.all([sorting, recycleGraph]);
                res
                    .status(200)
                    .send({ success: true, message: "retrieved dashboard data", data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    topBusters(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startMonth = moment().startOf("month"), endMonth = moment().endOf("month"), } = req.query;
                const ratings = [];
                const allBusters = yield User_1.User.find({
                    isDeleted: false,
                    designation: User_1.Designation.Buster,
                });
                const reviewPromise = yield allBusters.map((user) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    let averageRating = 0;
                    const reviews = yield Review_1.Review.find({
                        buster: user.id,
                        isDeleted: false,
                        createdAt: { ">=": startMonth, "<=": endMonth },
                    });
                    const totalRating = reviews.reduce((acc, review) => {
                        const { rating } = review;
                        return acc + rating;
                    });
                    averageRating = totalRating / reviews.length;
                    ratings.push({ user, averageRating });
                    yield Promise.all(reviewPromise);
                    function sortRatings(a, b) {
                        const ratingOne = a.averageRating;
                        const ratingTwo = b.averageRating;
                        let comparison = 0;
                        if (ratingOne > ratingTwo) {
                            comparison = 1;
                        }
                        else if (ratingOne < ratingTwo) {
                            comparison = -1;
                        }
                        return comparison;
                    }
                    yield ratings.sort(sortRatings);
                }));
                const data = ratings.splice(0, 5);
                res.status(200).json({
                    success: true,
                    data,
                    message: "request created successfully!",
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    updateRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.request.update(req);
                res.status(200).json({
                    success: true,
                    data: request,
                    message: "request updated successfully",
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    acceptRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.request.accept(req);
                const notification = new NotificationsService_1.default();
                const { requestedBy } = request;
                yield notification.sendPushNotification("points awarded", `your recycle request has been accepted`, requestedBy.notificationTokens);
                res.status(200).json({
                    success: true,
                    data: request,
                    message: "request updated successfully",
                });
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    completeRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const notification = new NotificationsService_1.default();
                const itemrequest = (yield Request_1.Request.findById(req.params.id).populate("reqeustedBy"));
                let items;
                const { notificationTokens } = itemrequest.acceptedBy;
                if (itemrequest.type === "redemption")
                    throw new Error("invalid request selected");
                if (itemrequest.type === "recycle") {
                    if (itemrequest.status === "completed")
                        throw new Error("request is already completed");
                    items = req.body.items ? req.body.items : itemrequest.items;
                    if (!items) {
                        throw new Error("there are no recycle items for this request");
                    }
                    const points = yield this.request.calculatePoints(items);
                    const details = "recycle";
                    yield this.request.addPoints(points, itemrequest.id, itemrequest.requestedBy, details);
                    itemrequest.points = points;
                }
                itemrequest.status = Request_1.Status.Completed;
                yield itemrequest.save();
                yield notification.sendPushNotification("points awarded", `you've recieved ${itemrequest.points} points`, notificationTokens);
                res.status(200).json({
                    success: true,
                    data: itemrequest,
                    message: "request updated successfully",
                });
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    findRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.repository.findById(req.params.requestId);
                res.status(200).json({ success: true, data: request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    declineRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const notification = new NotificationsService_1.default();
                const request = yield Request_1.Request.findOne({
                    _id: req.params.requestId,
                    status: Request_1.Status.Pending,
                }).populate("requestedBy");
                request.status = Request_1.Status.Declined;
                const details = "redemption declined";
                yield this.request.addPoints(request.points, request.id, request.requestedBy, details);
                request.save();
                yield notification.sendPushNotification("request declined", `your request has been declined`, request.requestedBy.notificationTokens);
                res.status(200).json({ success: true, data: request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    approveRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const notification = new NotificationsService_1.default();
                const request = yield Request_1.Request.findOne({
                    _id: req.params.requestId,
                    status: Request_1.Status.Pending,
                });
                request.status = Request_1.Status.Approved;
                request.save();
                yield notification.sendPushNotification("request approved", `your request has been approved`, request.requestedBy.notificationTokens);
                res.status(200).json({ success: true, data: request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getUserRecycleRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, status, type } = req.query;
                const criteria = {
                    requestedBy: req.user.id,
                    isDeleted: false,
                };
                if (type) {
                    criteria.type = type;
                }
                if (startDate) {
                    criteria.createdAt = { ">=": startDate };
                    if (endDate) {
                        criteria.createdAt = { "<=": endDate };
                    }
                    criteria.createdAt = { "<=": Date.now() };
                }
                if (status) {
                    criteria.status = status;
                }
                const request = yield Request_1.Request.find(criteria)
                    .populate("acceptedBy")
                    .populate("requestedBy")
                    .populate("redemptionItem");
                res.status(200).json({ success: true, data: request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    fetchAcceptedRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield Request_1.Request.find({
                    acceptedBy: req.user.id,
                });
                res.status(200).json({ success: true, data: request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    fetchPendingRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield Request_1.Request.find({
                    status: Request_1.Status.Pending,
                    type: "recycle",
                });
                res.status(200).json({ success: true, data: request });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    fetchCompletedRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield Request_1.Request.find({
                    status: Request_1.Status.Collected,
                    type: "recycle",
                });
                res.status(200).json({ success: true, data: request });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    remindBuster(req, res) {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield Request_1.Request.findOne({
                    _id: req.params.id,
                    status: Request_1.Status.Accepted,
                    type: "recycle",
                })
                    .populate("requestedBy")
                    .populate("acceptedBy");
                const notification = new NotificationsService_1.default();
                if (!request)
                    throw new Error("invalid request selected for reminder");
                if ((_b = (_a = request.acceptedBy) === null || _a === void 0 ? void 0 : _a.notificationTokens) === null || _b === void 0 ? void 0 : _b.length)
                    yield notification.sendPushNotification("pickup reminder", `${request.requestedBy.firstName} has sent a pickup reminder`, request.acceptedBy.notificationTokens);
                if ((_d = (_c = request.requestedBy) === null || _c === void 0 ? void 0 : _c.notificationTokens) === null || _d === void 0 ? void 0 : _d.length)
                    console.log("hi");
                yield notification.sendPushNotification("pickup reminder", `reminder sent`, request.requestedBy.notificationTokens);
                res.status(200).json({ success: true, message: "sent reminder" });
            }
            catch (error) {
                console.log(error);
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
    destroy(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this.request.forceDelete(req.params.id);
                res
                    .status(200)
                    .send({ success: true, message: "request deleted successfully" });
            }
            catch (error) {
                res.status(401).json({ success: false, error, message: error.message });
            }
        });
    }
};
tslib_1.__decorate([
    core_1.Get("details"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "dashboardInfo", null);
tslib_1.__decorate([
    core_1.Get("top-busters"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "topBusters", null);
tslib_1.__decorate([
    core_1.Put("update/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "updateRequest", null);
tslib_1.__decorate([
    core_1.Post("accept/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "acceptRequest", null);
tslib_1.__decorate([
    core_1.Post("complete/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "completeRequest", null);
tslib_1.__decorate([
    core_1.Get(":requestId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "findRequest", null);
tslib_1.__decorate([
    core_1.Post("decline/:requestId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "declineRequest", null);
tslib_1.__decorate([
    core_1.Post("approve/:requestId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "approveRequest", null);
tslib_1.__decorate([
    core_1.Get("list/user"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "getUserRecycleRequests", null);
tslib_1.__decorate([
    core_1.Get("buster/accepted"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "fetchAcceptedRequests", null);
tslib_1.__decorate([
    core_1.Get("buster/pending"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "fetchPendingRequests", null);
tslib_1.__decorate([
    core_1.Get("buster/completed"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "fetchCompletedRequests", null);
tslib_1.__decorate([
    core_1.Post("remind-buster/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "remindBuster", null);
tslib_1.__decorate([
    core_1.Delete("destroy/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "destroy", null);
AdminController = tslib_1.__decorate([
    core_1.Controller("api/admin"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], AdminController);
exports.AdminController = AdminController;
