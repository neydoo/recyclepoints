"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const AbstractController_1 = require("./AbstractController");
const RequestRepository_1 = require("../abstract/RequestRepository");
const auth_1 = require("../middleware/auth");
const Review_1 = require("../models/Review");
const ReviewService_1 = require("../service/ReviewService");
let ReviewController = class ReviewController extends AbstractController_1.AbstractController {
    constructor() {
        super(new RequestRepository_1.RequestRepository());
        this.review = new ReviewService_1.ReviewService();
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const review = yield Review_1.Review.find({});
                res.status(200).send({ success: true, data: review });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    createReview(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const review = yield this.review.create(req);
                res.status(200).json({
                    success: true,
                    review,
                    message: "review created successfully!",
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
                const review = yield this.repository.update(req);
                res.status(200).json({
                    success: true,
                    review,
                    message: "review updated successfully",
                });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    findRequest(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const review = yield Review_1.Review.findById(req.params.reviewId)
                    .populate("reviewer")
                    .populate("buster");
                res.status(200).json({ success: true, data: review });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    fetchAcceptedRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const review = yield Review_1.Review.find({
                    buster: req.params.id,
                })
                    .populate("reviewer")
                    .populate("buster");
                res.status(200).json({ success: true, data: review });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    destroy(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this.repository.forceDelete(req.params.id);
                res
                    .status(200)
                    .send({ success: true, message: "review deleted successfully" });
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
], ReviewController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Post("new/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ReviewController.prototype, "createReview", null);
tslib_1.__decorate([
    core_1.Put("update/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ReviewController.prototype, "updateRequest", null);
tslib_1.__decorate([
    core_1.Get(":reviewId"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ReviewController.prototype, "findRequest", null);
tslib_1.__decorate([
    core_1.Get("buster/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ReviewController.prototype, "fetchAcceptedRequests", null);
tslib_1.__decorate([
    core_1.Delete("destroy/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ReviewController.prototype, "destroy", null);
ReviewController = tslib_1.__decorate([
    core_1.Controller("api/review"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], ReviewController);
exports.ReviewController = ReviewController;
