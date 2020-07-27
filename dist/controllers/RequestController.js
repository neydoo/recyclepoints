"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const AbstractController_1 = require("./AbstractController");
const RequestRepository_1 = require("../abstract/RequestRepository");
const auth_1 = require("../middleware/auth");
const Request_1 = require("../models/Request");
const RequestService_1 = require("../service/RequestService");
const NotificationsService_1 = require("../service/NotificationsService");
let RequestController = class RequestController extends AbstractController_1.AbstractController {
    constructor() {
        super(new RequestRepository_1.RequestRepository());
        this.request = new RequestService_1.RequestService();
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, status, type, search } = req.query;
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
                    criteria.createdAt = { ">=": startDate };
                    if (endDate) {
                        criteria.createdAt = { "<=": endDate };
                    }
                    criteria.createdAt = { "<=": Date.now() };
                }
                if (status) {
                    criteria.status = status;
                }
                if (search) {
                    searchCriteria.or = [
                        { firstName: /search/ },
                        { address: /search/ },
                        { phone: /search/ },
                    ];
                }
                const request = yield Request_1.Request.find(criteria)
                    .populate("acceptedBy")
                    .populate({ path: "acceptedBy", match: searchCriteria })
                    .populate("redemptionItem");
                res.status(200).send({ success: true, data: request });
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
                    throw new Error('invalid request selected for reminder');
                if ((_b = (_a = request.acceptedBy) === null || _a === void 0 ? void 0 : _a.notificationTokens) === null || _b === void 0 ? void 0 : _b.length)
                    yield notification.sendPushNotification("pickup reminder", `${request.requestedBy.firstName} has sent a pickup reminder`, request.acceptedBy.notificationTokens);
                if ((_d = (_c = request.requestedBy) === null || _c === void 0 ? void 0 : _c.notificationTokens) === null || _d === void 0 ? void 0 : _d.length)
                    console.log('hi');
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
    core_1.Post("complete/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "completeRequest", null);
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
RequestController = tslib_1.__decorate([
    core_1.Controller("api/request"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], RequestController);
exports.RequestController = RequestController;
