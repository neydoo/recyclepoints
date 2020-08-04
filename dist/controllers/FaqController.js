"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@overnightjs/core");
const AbstractController_1 = require("./AbstractController");
const RequestRepository_1 = require("../abstract/RequestRepository");
const auth_1 = require("../middleware/auth");
const Faq_1 = require("../models/Faq");
let FaqController = class FaqController extends AbstractController_1.AbstractController {
    constructor() {
        super(new RequestRepository_1.RequestRepository());
    }
    index(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield Faq_1.Faq.find({ isDeleted: false });
                res.status(200).send({ success: true, message: "retrieved faqs", data });
            }
            catch (error) {
                res.status(400).json({ success: false, error, message: error.message });
            }
        });
    }
    create(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { title, content } = req.body;
                if (!title || !content)
                    throw new Error("incomplete parameters");
                yield Faq_1.Faq.create({ title, content });
                res.status(200).json({
                    success: true,
                    message: "faq created successfully!",
                });
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
], FaqController.prototype, "index", null);
tslib_1.__decorate([
    core_1.Post("new"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FaqController.prototype, "create", null);
FaqController = tslib_1.__decorate([
    core_1.Controller("api/faqs"),
    core_1.ClassMiddleware([auth_1.checkJwt]),
    tslib_1.__metadata("design:paramtypes", [])
], FaqController);
exports.FaqController = FaqController;
