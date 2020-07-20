"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var bodyParser = require("body-parser");
var express = require("express");
var controllers = require("./controllers");
var cors = require("cors");
var core_1 = require("@overnightjs/core");
var logger_1 = require("@overnightjs/logger");
var morgan = require("morgan");
var mongoose = require("mongoose");
var passport = require("passport");
var app_1 = require("./config/app");
var path = require("path");
var AppServer = /** @class */ (function (_super) {
    __extends(AppServer, _super);
    function AppServer() {
        var _this = _super.call(this, true) || this;
        _this.SERVER_STARTED = "Example server started on port: ";
        _this.a = 10;
        _this.config();
        return _this;
    }
    AppServer.prototype.config = function () {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(morgan("dev"));
        this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
        require("./config/passport");
        this.mongo();
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.setupControllers();
    };
    AppServer.prototype.mongo = function () {
        var _this = this;
        var connection = mongoose.connection;
        connection.on("connected", function () {
            logger_1.Logger.Imp("Mongo Connection Established");
        });
        connection.on("reconnected", function () {
            logger_1.Logger.Imp("Mongo Connection Reestablished");
        });
        connection.on("disconnected", function () {
            logger_1.Logger.Imp("Mongo Connection Disconnected");
            logger_1.Logger.Imp("Trying to reconnect to Mongo ...");
            setTimeout(function () {
                mongoose.connect(app_1.config.db.url, {
                    useNewUrlParser: true,
                    autoReconnect: true, keepAlive: true,
                    socketTimeoutMS: 3000, connectTimeoutMS: 3000
                });
            }, 3000);
        });
        connection.on("close", function () {
            logger_1.Logger.Imp("Mongo Connection Closed");
        });
        connection.on("error", function (error) {
            logger_1.Logger.Imp("Mongo Connection ERROR: " + error);
        });
        var run = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongoose.connect(app_1.config.db.url, {
                            useNewUrlParser: true,
                            autoReconnect: true, keepAlive: true
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        run()["catch"](function (error) { return logger_1.Logger.Imp(error); });
    };
    AppServer.prototype.setupControllers = function () {
        var ctlrInstances = [];
        for (var name_1 in controllers) {
            if (controllers.hasOwnProperty(name_1)) {
                var controller = controllers[name_1];
                ctlrInstances.push(new controller());
            }
        }
        _super.prototype.addControllers.call(this, ctlrInstances);
    };
    AppServer.prototype.start = function (port) {
        var _this = this;
        this.app.get("*", function (req, res) {
            res.send(_this.SERVER_STARTED + port);
        });
        this.app.listen(port, function () {
            logger_1.Logger.Imp(_this.SERVER_STARTED + port);
        });
    };
    return AppServer;
}(core_1.Server));
exports["default"] = AppServer;
