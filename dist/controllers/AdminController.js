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
                console.log("here");
                const today = moment();
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
                const janStart = moment(today).startOf("year").toDate();
                const janEnd = moment(janStart).endOf("month");
                const febStart = moment(janStart).add(1, "month");
                const febEnd = moment(febStart).endOf("month");
                const marchStart = moment(febStart).add(1, "month");
                const marchEnd = moment(marchStart).endOf("month");
                const aprStart = moment(marchStart).add(1, "month");
                const aprEnd = moment(aprStart).endOf("month");
                const mayStart = moment(aprStart).add(1, "month");
                const mayEnd = moment(mayStart).endOf("month");
                const junStart = moment(mayStart).add(1, "month");
                const junEnd = moment(junStart).endOf("month");
                const julStart = moment(junStart).add(1, "month");
                const julEnd = moment(julStart).endOf("month");
                const augStart = moment(julStart).add(1, "month");
                const augEnd = moment(augStart).endOf("month");
                const sepStart = moment(augStart).add(1, "month");
                const sepEnd = moment(sepStart).endOf("month");
                const octStart = moment(sepStart).add(1, "month");
                const octEnd = moment(octStart).endOf("month");
                const novStart = moment(sepStart).add(1, "month");
                const novEnd = moment(novStart).endOf("month");
                const decStart = moment(novStart).add(1, "month");
                const decEnd = moment(decStart).endOf("month");
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
                        createdAt: { $gte: startMonth, $lte: endMonth },
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
                    message: "data retrieved",
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
AdminController = tslib_1.__decorate([
    core_1.Controller("api/admin"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], AdminController);
exports.AdminController = AdminController;
