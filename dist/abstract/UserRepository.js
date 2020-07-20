"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const AbstractRepository_1 = require("./AbstractRepository");
class UserRepository extends AbstractRepository_1.AbstractRepository {
    constructor() {
        super("User");
    }
}
exports.UserRepository = UserRepository;
