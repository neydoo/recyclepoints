import AppServer from "./app";

const appServer = new AppServer();
const port = process.env.PORT || '2500';
appServer.start(parseInt(port));