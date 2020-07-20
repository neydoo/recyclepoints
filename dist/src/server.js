"use strict";
exports.__esModule = true;
var app_1 = require("../app");
var appServer = new app_1["default"]();
var port = process.env.PORT || '2500';
appServer.start(parseInt(port));
