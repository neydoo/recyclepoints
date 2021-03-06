"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
const tslib_1 = require("tslib");
const moment = require("moment");
const core_1 = require("@overnightjs/core");
const AbstractController_1 = require("./AbstractController");
const RequestRepository_1 = require("../abstract/RequestRepository");
const auth_1 = require("../middleware/auth");
const Request_1 = require("../models/Request");
const RequestService_1 = require("../service/RequestService");
const NotificationsService_1 = require("../service/NotificationsService");
const RecyclePointRecord_1 = require("../models/RecyclePointRecord");
const UserNotification_1 = require("../models/UserNotification");
const User_1 = require("../models/User");
const RedemptionItem_1 = require("../models/RedemptionItem");
let RequestController = class RequestController extends AbstractController_1.AbstractController {
    constructor() {
        super(new RequestRepository_1.RequestRepository());
        this.request = new RequestService_1.RequestService();
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, status, type, search, sort } = req.query;
                const criteria = {
                    isDeleted: false,
                };
                const searchCriteria = {
                    isDeleted: false,
                };
                if (type) {
                    criteria.type = type;
                }
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                if (status) {
                    criteria.status = status;
                }
                let users = [];
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
                const request = yield Request_1.Request.find(criteria)
                    .populate("requestedBy")
                    .populate("acceptedBy")
                    .populate("resolvedBy")
                    .sort(sort);
                const data = [];
                if (request.length) {
                    const requestPromise = request.map((r) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        let rData = Object.assign({}, r._doc);
                        if ((r === null || r === void 0 ? void 0 : r.type) === "redemption") {
                            const transaction = yield RecyclePointRecord_1.RecyclePointRecord.findOne({
                                transactionId: r.id,
                                type: "deduction",
                            });
                            rData.transaction = transaction;
                            const rIds = r.redemptionItems.map((r) => r.id);
                            const redemptionItems = yield RedemptionItem_1.RedemptionItem.find({ _id: rIds });
                            const items = [];
                            const formatted = redemptionItems.map((item) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                                const thisData = Object.assign({}, item._doc);
                                const stuff = r.redemptionItems.map((i) => {
                                    console.log(item._id.toString(), i.id.toString());
                                    if (item._id.toString() == i.id.toString()) {
                                        thisData.quantity = i.quantity;
                                    }
                                });
                                return items.push(thisData);
                            }));
                            yield Promise.all(formatted);
                            rData.redemptionItems = items;
                        }
                        data.push(rData);
                    }));
                    yield Promise.all(requestPromise);
                }
                res.status(200).send({ success: true, data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    createRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.request.create(req);
                res.status(200).json({
                    success: true,
                    data: request,
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
                const { requestedBy } = request;
                yield UserNotification_1.UserNotification.create({
                    body: "your recycle request has been accepted",
                    title: "We'll be visiting soon",
                    userId: requestedBy.id,
                });
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
    markAsCollected(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const itemrequest = yield Request_1.Request.findById(req.params.id);
                let items;
                if (itemrequest.type === "redemption")
                    throw new Error("invalid request selected");
                if (itemrequest.type === "recycle") {
                    if (itemrequest.status === "collected")
                        throw new Error("request is already collected");
                    items = req.body.items ? req.body.items : itemrequest.items;
                    if (!items) {
                        throw new Error("there are no recycle items for this request");
                    }
                }
                itemrequest.status = Request_1.Status.Collected;
                yield itemrequest.save();
                const users = yield User_1.User.find({
                    designation: User_1.Designation.Staff,
                    isDeleted: false,
                });
                users.forEach((user) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield UserNotification_1.UserNotification.create({
                        userId: user.id,
                        title: "recycle collected",
                        body: `A recycle request has been collected`,
                    });
                }));
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
                const request = yield Request_1.Request.find({ _id: req.params.requestId })
                    .populate("requestedBy")
                    .populate("acceptedBy")
                    .populate("resolvedBy");
                const data = [];
                if (request.length) {
                    const requestPromise = request.map((r) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        let rData = Object.assign({}, r._doc);
                        if ((r === null || r === void 0 ? void 0 : r.type) === "redemption") {
                            const transaction = yield RecyclePointRecord_1.RecyclePointRecord.findOne({
                                transactionId: r.id,
                                type: "deduction",
                            });
                            rData.transaction = transaction;
                            const rIds = r.redemptionItems.map((r) => r.id);
                            const redemptionItems = yield RedemptionItem_1.RedemptionItem.find({ _id: rIds });
                            const items = [];
                            const formatted = redemptionItems.map((item) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                                const thisData = Object.assign({}, item._doc);
                                const stuff = r.redemptionItems.map((i) => {
                                    console.log(item._id.toString(), i.id.toString());
                                    if (item._id.toString() == i.id.toString()) {
                                        thisData.quantity = i.quantity;
                                    }
                                });
                                return items.push(thisData);
                            }));
                            yield Promise.all(formatted);
                            console.log("here");
                            rData.redemptionItems = items;
                        }
                        data.push(rData);
                    }));
                    yield Promise.all(requestPromise);
                }
                res.status(200).json({ success: true, data: data[0] });
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
                request.resolvedBy = req.user.id;
                const details = "redemption declined";
                yield this.request.addPoints(request.points, request.id, request.requestedBy, details);
                request.save();
                yield UserNotification_1.UserNotification.create({
                    title: "Request declined",
                    userId: request.requestedBy.id,
                    body: `your request has been declined`,
                });
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
                const request = yield Request_1.Request.findOne({
                    _id: req.params.requestId,
                    status: Request_1.Status.Pending,
                });
                request.status = Request_1.Status.Approved;
                request.resolvedBy = req.user.id;
                request.save();
                yield UserNotification_1.UserNotification.create({
                    title: "Request approved",
                    userId: request.requestedBy.id,
                    body: `your request has been approved`,
                });
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
                const { startDate, endDate, status, type, userId } = req.query;
                const user = userId ? userId : req.user.id;
                const criteria = {
                    requestedBy: user,
                    isDeleted: false,
                };
                if (type) {
                    criteria.type = type;
                }
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                if (status) {
                    criteria.status = status;
                }
                const request = yield Request_1.Request.find(criteria)
                    .populate("requestedBy")
                    .populate("acceptedBy")
                    .populate("resolvedBy");
                const data = [];
                if (request.length) {
                    const requestPromise = request.map((r) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        let rData = Object.assign({}, r._doc);
                        if ((r === null || r === void 0 ? void 0 : r.type) === "redemption") {
                            const transaction = yield RecyclePointRecord_1.RecyclePointRecord.findOne({
                                transactionId: r.id,
                                type: "deduction",
                            });
                            rData.transaction = transaction;
                            const rIds = r.redemptionItems.map((r) => r.id);
                            const redemptionItems = yield RedemptionItem_1.RedemptionItem.find({ _id: rIds });
                            const items = [];
                            const formatted = redemptionItems.map((item) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                                const thisData = Object.assign({}, item._doc);
                                const stuff = r.redemptionItems.map((i) => {
                                    console.log(item._id.toString(), i.id.toString());
                                    if (item._id.toString() == i.id.toString()) {
                                        thisData.quantity = i.quantity;
                                    }
                                });
                                return items.push(thisData);
                            }));
                            yield Promise.all(formatted);
                            rData.redemptionItems = items;
                        }
                        data.push(rData);
                    }));
                    yield Promise.all(requestPromise);
                }
                res.status(200).send({ success: true, data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getnonPendingRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, status, type, search } = req.query;
                const criteria = {
                    $and: [
                        { status: { $ne: "pending" } },
                        { status: { $ne: "cancelled" } },
                    ],
                    isDeleted: false,
                };
                const searchCriteria = {
                    isDeleted: false,
                };
                if (type) {
                    criteria.type = type;
                }
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                if (status) {
                    criteria.status = status;
                }
                let users = [];
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
                const request = yield Request_1.Request.find(criteria)
                    .populate("requestedBy")
                    .populate("acceptedBy")
                    .populate("resolvedBy");
                const data = [];
                if (request.length) {
                    const requestPromise = request.map((r) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        let rData = Object.assign({}, r._doc);
                        if ((r === null || r === void 0 ? void 0 : r.type) === "redemption") {
                            const transaction = yield RecyclePointRecord_1.RecyclePointRecord.findOne({
                                transactionId: r.id,
                                type: "deduction",
                            });
                            rData.transaction = transaction;
                            const rIds = r.redemptionItems.map((r) => r.id);
                            const redemptionItems = yield RedemptionItem_1.RedemptionItem.find({ _id: rIds });
                            const items = [];
                            const formatted = redemptionItems.map((item) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                                const thisData = Object.assign({}, item._doc);
                                const stuff = r.redemptionItems.map((i) => {
                                    console.log(item._id.toString(), i.id.toString());
                                    if (item._id.toString() == i.id.toString()) {
                                        thisData.quantity = i.quantity;
                                    }
                                });
                                return items.push(thisData);
                            }));
                            yield Promise.all(formatted);
                            rData.redemptionItems = items;
                        }
                        data.push(rData);
                    }));
                    yield Promise.all(requestPromise);
                }
                res.status(200).send({ success: true, data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    fetchAcceptedRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, userId, search } = req.query;
                const user = req.user.designation !== User_1.Designation.Admin ? req.user.id : userId;
                const criteria = {};
                if (user) {
                    criteria.acceptedBy = user;
                }
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                const request = yield Request_1.Request.find(criteria)
                    .populate("acceptedBy")
                    .populate("requestedBy");
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
                res.status(400).json({ success: false, error, message: error.message });
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
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    remindBuster(req, res) {
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
                yield UserNotification_1.UserNotification.create({
                    title: "pickup reminder",
                    userId: request.acceptedBy.id,
                    body: `${request.requestedBy.firstName} has sent a pickup reminder`,
                });
                res.status(200).json({ success: true, message: "sent reminder" });
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ success: false, error, message: error.message });
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
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getOngoing(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId ? req.query.userId : req.user.id;
                console.log(userId);
                const request = yield Request_1.Request.findOne({
                    isDeleted: false,
                    requestedBy: userId,
                    type: "recycle",
                    $and: [
                        { status: { $ne: Request_1.Status.Completed } },
                        { status: { $ne: Request_1.Status.Cancelled } },
                    ],
                })
                    .populate("acceptedBy")
                    .sort("asc");
                res
                    .status(200)
                    .json({ success: true, message: "request retrieved", data: request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getGraph(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const weeklyRecycle = {
                    week1: 0,
                    week2: 0,
                    week3: 0,
                    week4: 0,
                    week5: 0,
                };
                const { month } = req.query;
                const monthStart = moment(month).startOf("month");
                const monthEnd = moment(month).endOf("month");
                let allRecycles = yield Request_1.Request.find({
                    isDeleted: false,
                    type: "recycle",
                    requestedBy: req.params.id,
                    createdAt: {
                        $gte: monthStart,
                        $lte: monthEnd,
                    },
                });
                const numberOfWeeks = moment(month).daysInMonth() / 7;
                const firstWeek = moment(month).startOf("month");
                const endFirstWeek = moment(firstWeek).add(7, "days");
                console.log("hi", allRecycles);
                const recycleGraph = allRecycles.map((recycle) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (let i = 0; i < numberOfWeeks; i++) {
                        console.log("hi", moment(firstWeek).add(i, "week"));
                        console.log("hi2", moment(endFirstWeek).add(i, "week"));
                        if (moment(recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) >= moment(firstWeek).add(i, "week") &&
                            moment(recycle === null || recycle === void 0 ? void 0 : recycle.createdAt) <= moment(endFirstWeek).add(i, "week")) {
                            weeklyRecycle[`week${i + 1}`] += 1;
                            console.log(i, weeklyRecycle);
                        }
                    }
                }));
                yield Promise.all(recycleGraph);
                res.status(200).send({
                    success: true,
                    message: "retrieved dashboard data",
                    data: weeklyRecycle,
                });
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
], RequestController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Post("new"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "createRequest", null);
tslib_1.__decorate([
    core_1.Put("update/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "updateRequest", null);
tslib_1.__decorate([
    core_1.Post("accept/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "acceptRequest", null);
tslib_1.__decorate([
    core_1.Post("collect/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "markAsCollected", null);
tslib_1.__decorate([
    core_1.Get(":requestId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "findRequest", null);
tslib_1.__decorate([
    core_1.Post("decline/:requestId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "declineRequest", null);
tslib_1.__decorate([
    core_1.Post("approve/:requestId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "approveRequest", null);
tslib_1.__decorate([
    core_1.Get("list/user"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "getUserRecycleRequests", null);
tslib_1.__decorate([
    core_1.Get("list/non-pending"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "getnonPendingRequests", null);
tslib_1.__decorate([
    core_1.Get("buster/accepted"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "fetchAcceptedRequests", null);
tslib_1.__decorate([
    core_1.Get("buster/pending"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "fetchPendingRequests", null);
tslib_1.__decorate([
    core_1.Get("buster/completed"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "fetchCompletedRequests", null);
tslib_1.__decorate([
    core_1.Post("remind-buster/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "remindBuster", null);
tslib_1.__decorate([
    core_1.Delete("destroy/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "destroy", null);
tslib_1.__decorate([
    core_1.Get("ongoing/user"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "getOngoing", null);
tslib_1.__decorate([
    core_1.Get("graph/user/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "getGraph", null);
RequestController = tslib_1.__decorate([
    core_1.Controller("api/request"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], RequestController);
exports.RequestController = RequestController;
