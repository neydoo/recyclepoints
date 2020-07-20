"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestService = void 0;
const tslib_1 = require("tslib");
const CoreService_1 = require("./CoreService");
const NotificationsService_1 = require("./NotificationsService");
const Request_1 = require("../models/Request");
const RecyclePoint_1 = require("../models/RecyclePoint");
const RecycleItem_1 = require("../models/RecycleItem");
const RecyclePointRecord_1 = require("../models/RecyclePointRecord");
const RequestRepository_1 = require("../abstract/RequestRepository");
const User_1 = require("../models/User");
const RedemptionItem_1 = require("../models/RedemptionItem");
class RequestService {
    constructor() {
        this.repository = new RequestRepository_1.RequestRepository();
        this.core = new CoreService_1.default();
        this.notification = new NotificationsService_1.default();
    }
    create(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            payload.requestedBy = req.user.id;
            if (!payload.type) {
                throw new Error("invalid request type");
            }
            let balance;
            let recyclePoints;
            if (payload.type === "redemption") {
                if (!payload.redemptionItem)
                    throw new Error("please select an item for redemption");
                ({ balance } = (yield RecyclePoint_1.RecyclePoint.findOne({
                    user: req.user.id,
                })));
                ({ recyclePoints } = (yield RedemptionItem_1.RedemptionItem.findById(payload.redemptionItem)));
                if (balance < recyclePoints)
                    throw new Error("you need more recycle points to complete this request");
                payload.points = recyclePoints;
            }
            const user = (yield User_1.User.findById(req.user.id));
            const request = yield this.repository.createNew(payload);
            if (request.type === "redemption") {
                const details = "redemption request";
                yield this.deductPoints(recyclePoints, request.id, user, details);
            }
            this.core.Email(user, "New Request", this.core.html(`<p style="color: #000">Hello
          ${user.firstName} ${user.lastName},
          </p>
          <p style="color: #000">
          Your ${payload.type} request has been placed successfully.
          </p>`));
            this.core.activityLog(req, user.id, "Reqeusted");
            this.notification.triggerNotification("notifications", "reqeust", {
                user,
                message: { message: user.lastName + " Just created a new request." },
            }, req, user.id);
            return request;
        });
    }
    update(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            const request = yield this.repository.updateData(req.params.id, payload);
            const user = yield User_1.User.findById(req.user.id);
            this.core.activityLog(req, user.id, "Update request");
            return request;
        });
    }
    accept(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (req.user.designation !== "buster")
                throw new Error(`you're not allowed to perform this operation`);
            const request = (yield this.repository.findById(req.params.id));
            if (!request)
                throw new Error("invalid request");
            if (request.status !== "pending")
                throw new Error(" request has already been accepted");
            request.acceptedBy = req.user.id;
            request.status = Request_1.Status.Accepted;
            yield request.save();
            const user = (yield User_1.User.findById(req.user.id));
            this.core.activityLog(req, user.id, "Update request");
            return request;
        });
    }
    deductPoints(points, requestId, user, details) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const recyclePoint = (yield RecyclePoint_1.RecyclePoint.findOne({
                user: user.id,
            }));
            yield RecyclePointRecord_1.RecyclePointRecord.create({
                parentId: recyclePoint.id,
                type: "deduction",
                previousAmount: recyclePoint.balance,
                amount: points,
                balance: recyclePoint.balance - points,
                transactionId: requestId,
                details,
            });
            recyclePoint.balance -= points;
            yield recyclePoint.save();
        });
    }
    addPoints(points, requestId, user, details) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const recyclePoint = (yield RecyclePoint_1.RecyclePoint.findOne({
                user,
            }));
            yield RecyclePointRecord_1.RecyclePointRecord.create({
                parentId: recyclePoint.id,
                type: "addition",
                previousAmount: recyclePoint.balance,
                amount: points,
                balance: recyclePoint.balance + points,
                transactionId: requestId,
                details,
            });
            recyclePoint.balance = recyclePoint.balance + points;
            yield recyclePoint.save();
        });
    }
    calculatePoints(items) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!items)
                throw new Error("invalid item");
            const recycleItems = (yield RecycleItem_1.RecycleItem.find({
                isDeleted: false,
            }));
            let points = 0;
            yield Promise.all(recycleItems.map((recycleItem) => {
                console.log(items[recycleItem.name]);
                const point = items[recycleItem.name] * recycleItem.recyclePoints;
                points += point;
            }));
            return points;
        });
    }
}
exports.RequestService = RequestService;
