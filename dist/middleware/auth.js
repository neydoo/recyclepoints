"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDev = exports.isAdmin = exports.checkJwt = exports.isValidUser = void 0;
const tslib_1 = require("tslib");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const app_1 = require("../config/app");
const extractTokenFromHeader = (req) => {
    if (req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer") {
        return req.headers.authorization.split(" ")[1];
    }
    return req.headers.authorization;
};
exports.isValidUser = (req, res, next) => {
    if (passport.authenticate("jwt", { session: false })) {
        next();
    }
    else {
        return res.status(401).json({ message: "UnAuthorized Request!" });
    }
};
exports.checkJwt = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const token = extractTokenFromHeader(req);
    let jwtPayload;
    try {
        jwtPayload = jwt.verify(token, app_1.config.app.JWT_SECRET);
        res.locals.jwtPayload = jwtPayload;
    }
    catch (error) {
        return res
            .status(401)
            .json({ success: false, message: "UnAuthorized Request!" });
    }
    req.user = jwtPayload;
    next();
});
exports.isAdmin = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (req.user.designation !== "admin")
        return res
            .status(401)
            .json({
            success: false,
            message: `you're not authorized to perform this operation`,
        });
    next();
});
exports.isDev = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (req.user.designation !== "dev")
        return res
            .status(401)
            .json({
            success: false,
            message: `you're not authorized to perform this operation`,
        });
    next();
});
