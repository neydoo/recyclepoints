"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const tslib_1 = require("tslib");
const CoreService_1 = require("./CoreService");
const NotificationsService_1 = require("./NotificationsService");
const Review_1 = require("../models/Review");
const ReviewRepository_1 = require("../abstract/ReviewRepository");
const User_1 = require("../models/User");
class ReviewService {
    constructor() {
        this.repository = new ReviewRepository_1.ReviewRepository();
        this.core = new CoreService_1.default();
        this.notification = new NotificationsService_1.default();
    }
    create(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            const user = yield User_1.User.findById(req.user.id);
            const existingReview = yield Review_1.Review.findOne({ recycle: req.params.id });
            let review;
            if (existingReview) {
                review = yield Review_1.Review.findByIdAndUpdate(existingReview.id, payload, {
                    new: true,
                });
            }
            else {
                payload.recycle = req.params.id;
                review = yield Review_1.Review.create(payload);
            }
            this.core.activityLog(req, user.id, "Reviewed");
            this.notification.triggerNotification("notifications", "reqeust", {
                user,
                message: { message: user.lastName + " Just created a new review." },
            }, req, user.id);
            return review;
        });
    }
    update(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            const review = yield Review_1.Review.findByIdAndUpdate(req.params.id, payload, {
                new: true,
            });
            const user = yield User_1.User.findById(req.params.id);
            this.core.activityLog(req, user.id, "Update review");
            return review;
        });
    }
}
exports.ReviewService = ReviewService;
