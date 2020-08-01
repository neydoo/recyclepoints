"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const appServer = new app_1.default();
const port = process.env.PORT || '3500';
appServer.start(parseInt(port));
