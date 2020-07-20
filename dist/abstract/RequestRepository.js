"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRepository = void 0;
const AbstractRepository_1 = require("./AbstractRepository");
class RequestRepository extends AbstractRepository_1.AbstractRepository {
    constructor() {
        super("Request");
    }
}
exports.RequestRepository = RequestRepository;
