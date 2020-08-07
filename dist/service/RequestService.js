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
const UserNotification_1 = require("../models/UserNotification");
const UtilService_1 = require("./UtilService");
class RequestService {
    constructor() {
        this.repository = new RequestRepository_1.RequestRepository();
        this.core = new CoreService_1.default();
        this.notification = new NotificationsService_1.default();
    }
    create(req) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            if (!req.user.id)
                throw new Error("invalid user");
            payload.requestedBy = req.user.id;
            const user = yield User_1.User.findById(req.user.id);
            if (!(user === null || user === void 0 ? void 0 : user.address) && payload.deliveryAddress)
                if (user) {
                    user.address = payload.deliveryAddress;
                    yield user.save();
                }
            console.log("start create request");
            if (!payload.type) {
                throw new Error("invalid request type");
            }
            let balance;
            let recyclePoints;
            if (payload.type === "redemption") {
                if (!((_a = payload.redemptionItems) === null || _a === void 0 ? void 0 : _a.length))
                    throw new Error("please select an item for redemption");
                ({ balance } = (yield RecyclePoint_1.RecyclePoint.findOne({
                    user: req.user.id,
                })));
                const itemIds = (_b = payload.redemptionItems) === null || _b === void 0 ? void 0 : _b.map((item) => item.id);
                const requestedItems = yield RedemptionItem_1.RedemptionItem.find({ _id: itemIds });
                recyclePoints = requestedItems.reduce((curr, item, i) => {
                    var _a;
                    const { quantity } = (_a = payload.redemptionItems) === null || _a === void 0 ? void 0 : _a.find((i) => i.id === item.id);
                    return (curr += item.recyclePoints * quantity);
                }, 0);
                console.log(`${balance} of user${req.user.id} with recyclepoints ${recyclePoints}`);
                if (balance < recyclePoints)
                    throw new Error("you need more recycle points to complete this request");
                payload.points = recyclePoints;
                payload.redemptionId = `RE${UtilService_1.UtilService.generate(6)}`;
                payload.meta.address = payload.deliveryAddress;
                payload.meta.phone = payload.deliveryPhoneNumber;
            }
            console.log(`get user details`);
            console.log(`gotten user details`);
            console.log(`creating request`);
            const request = yield this.repository.createNew(payload);
            console.log(`created request`);
            if (request.type === "redemption") {
                const details = "redemption request";
                if (user)
                    yield this.deductPoints(recyclePoints, request.id, user, details);
            }
            if (request.type === "recycle") {
                const admins = yield User_1.User.find({
                    isDeleted: false,
                    $or: [
                        { designation: User_1.Designation.Admin },
                        { desgnation: User_1.Designation.Buster },
                    ],
                });
                admins.forEach((admin) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield UserNotification_1.UserNotification.create({
                        title: "New recycle request",
                        userId: admin.id,
                        body: `${user === null || user === void 0 ? void 0 : user.fullName} just made a recycle request`,
                    });
                }));
            }
            if (request.type === "redemption") {
                const admins = yield User_1.User.find({
                    isDeleted: false,
                    designation: User_1.Designation.Admin,
                });
                admins.forEach((admin) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield UserNotification_1.UserNotification.create({
                        title: "New redemption request",
                        userId: admin.id,
                        body: `${user === null || user === void 0 ? void 0 : user.fullName} just made a recycle request`,
                    });
                }));
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
            const request = yield Request_1.Request.findById(req.params.id).populate("requestedBy");
            const user = yield User_1.User.findById(req.user.id);
            yield this.repository.updateData(req.params.id, payload);
            this.core.activityLog(req, user.id, "Update request");
            return request;
        });
    }
    accept(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = (yield Request_1.Request.findById(req.params.id));
            if (!request)
                throw new Error("invalid request");
            if (request.status !== "pending")
                throw new Error(" request has already been accepted");
            if (req.body.buster && req.user.designation === "admin") {
                request.acceptedBy = req.body.buster;
            }
            else {
                request.acceptedBy = req.user.id;
            }
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
