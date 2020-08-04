"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusterController = void 0;
const tslib_1 = require("tslib");
const moment = require("moment");
const core_1 = require("@overnightjs/core");
const AbstractController_1 = require("./AbstractController");
const RequestRepository_1 = require("../abstract/RequestRepository");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Request_1 = require("../models/Request");
let BusterController = class BusterController extends AbstractController_1.AbstractController {
    constructor() {
        super(new RequestRepository_1.RequestRepository());
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, status, search } = req.query;
                const criteria = {
                    isDeleted: false,
                    designation: User_1.Designation.Buster,
                };
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                if (search) {
                    criteria.or = [
                        { firstName: { $regex: search, $options: "i" } },
                        { lastName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { phone: { $regex: search, $options: "i" } },
                    ];
                }
                const data = yield User_1.User.find(criteria);
                res
                    .status(200)
                    .send({ success: true, message: "retrieved buster data", data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    fetchRequests(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, search } = req.query;
                const user = req.params.id;
                const criteria = { isDeleted: false };
                if (user) {
                    criteria.acceptedBy = user;
                }
                if (startDate) {
                    criteria.createdAt = {
                        $gte: startDate,
                        $lte: endDate ? endDate : moment(),
                    };
                }
                if (search) {
                    criteria.or = [
                        { firstName: { $regex: search, $options: "i" } },
                        { lastName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { phone: { $regex: search, $options: "i" } },
                    ];
                }
                const request = yield Request_1.Request.find(criteria);
                res
                    .status(200)
                    .json({ success: true, message: "successful", data: request });
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
], BusterController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Get("requests/:id"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BusterController.prototype, "fetchRequests", null);
BusterController = tslib_1.__decorate([
    core_1.Controller("api/buster"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], BusterController);
exports.BusterController = BusterController;
