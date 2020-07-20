"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilService = void 0;
class UtilService {
    static generate(length, chars) {
        if (!chars) {
            chars = "0123456789ABCDEFGHJKLMNOPQRSTUVWXYZ";
        }
        let result = "";
        for (let i = length; i > 0; i -= 1) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    }
}
exports.UtilService = UtilService;
