"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilService = void 0;
class UtilService {
    static generate(length, chars) {
        if (!chars) {
            chars = "0123456789";
        }
        let result = "";
        for (let i = length; i > 0; i -= 1) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    }
    formUrlEncoded(x) {
        return Object.keys(x).reduce((p, c) => `${p}&${c}=${encodeURIComponent(x[c])}`, '');
    }
    formatPhone(phonenumber) {
        phonenumber.toString();
        return (phonenumber = phonenumber.startsWith("+")
            ? phonenumber.slice(1)
            : phonenumber);
    }
    ;
}
exports.UtilService = UtilService;
