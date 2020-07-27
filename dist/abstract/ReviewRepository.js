"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const AbstractRepository_1 = require("./AbstractRepository");
class ReviewRepository extends AbstractRepository_1.AbstractRepository {
    constructor() {
        super("Review");
    }
}
exports.ReviewRepository = ReviewRepository;
