import AppServer from "./app";

const appServer = new AppServer();
const port = process.env.PORT || '3500';
appServer.start(parseInt(port));