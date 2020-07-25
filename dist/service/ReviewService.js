"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecycleRequestService = void 0;
const tslib_1 = require("tslib");
const CoreService_1 = require("./CoreService");
const NotificationsService_1 = require("./NotificationsService");
const RequestRepository_1 = require("../abstract/RequestRepository");
const User_1 = require("../models/User");
class RecycleRequestService {
    constructor() {
        this.repository = new RequestRepository_1.RequestRepository();
        this.core = new CoreService_1.default();
        this.notification = new NotificationsService_1.default();
    }
    create(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            payload.recycle = req.params.id;
            const user = yield User_1.User.findById(req.user.id);
            const review = yield this.repository.createNew(payload);
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
            const review = yield this.repository.updateData(req.params.id, payload);
            const user = yield User_1.User.findById(req.params.id);
            this.core.activityLog(req, user.id, "Update review");
            return review;
        });
    }
}
exports.RecycleRequestService = RecycleRequestService;
