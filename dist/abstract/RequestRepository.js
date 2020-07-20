"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRepository = void 0;
const AbstractRepository_1 = require("./AbstractRepository");
const Request_1 = require("../models/Request");
class RequestRepository extends AbstractRepository_1.AbstractRepository {
    constructor() {
        super("Request", Request_1.requestSchema);
    }
}
exports.RequestRepository = RequestRepository;
