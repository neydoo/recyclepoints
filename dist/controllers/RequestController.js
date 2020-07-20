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
let RequestController = class RequestController extends AbstractController_1.AbstractController {
    constructor() {
        super(new RequestRepository_1.RequestRepository());
        this.request = new RequestService_1.RequestService();
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.repository.findAll();
                res.status(200).send({ success: true, request });
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
                    request,
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
                    request,
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
                res.status(200).json({
                    success: true,
                    request,
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
                const itemrequest = (yield Request_1.Request.findById(req.params.id));
                let items;
                if (itemrequest.type === "redemption")
                    throw new Error("invalid request selected");
                if (itemrequest.type === "recycle") {
                    if (itemrequest.status === "completed")
                        throw new Error("request is already completed");
                    items = req.body.items ? req.body.items : itemrequest.items;
                    const points = yield this.request.calculatePoints(items);
                    const details = "recycle";
                    yield this.request.addPoints(points, itemrequest.id, itemrequest.requestedBy, details);
                    itemrequest.points = points;
                }
                itemrequest.status = Request_1.Status.Completed;
                yield itemrequest.save();
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
                res.status(200).json({ success: true, request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    declineRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield Request_1.Request.findOne({
                    _id: req.params.requestId,
                    status: Request_1.Status.Pending,
                });
                request.status = Request_1.Status.Declined;
                const details = "redemption declined";
                yield this.request.addPoints(request.points, request.id, request.requestedBy, details);
                request.save();
                res.status(200).json({ success: true, request });
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
                request.save();
                res.status(200).json({ success: true, request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getUserRecycleRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.user.id);
                const request = yield Request_1.Request.find({
                    requestedBy: req.user.id,
                    isDeleted: false,
                    type: "recycle",
                });
                res.status(200).json({ success: true, request });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    getUserRedemptionRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.user.id);
                const request = yield Request_1.Request.find({
                    requestedBy: req.user.id,
                    isDeleted: false,
                    type: "redemption",
                });
                res.status(200).json({ success: true, request });
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
                res.status(200).json({ success: true, request });
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
                res.status(200).json({ success: true, request });
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
                res.status(200).json({ success: true, request });
            }
            catch (error) {
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
    core_1.Get("list/user/recycle"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "getUserRecycleRequests", null);
tslib_1.__decorate([
    core_1.Get("list/user/redemption"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RequestController.prototype, "getUserRedemptionRequests", null);
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
