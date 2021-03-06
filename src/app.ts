import * as bodyParser from "body-parser";
import * as express from "express";
import * as controllers from "./controllers";
import * as cors from "cors";
import { Server } from "@overnightjs/core";
import { Logger } from "@overnightjs/logger";
import * as morgan from "morgan";
import * as mongoose from "mongoose";
import * as passport from "passport";
import { config } from "./config/app";
import * as path from "path";
import * as Sentry from "@sentry/node";
class AppServer extends Server {
  private readonly SERVER_STARTED = "Example server started on port: ";
  public a = 10;

  constructor() {
    super(true);
    this.config();
  }

  private config(): void {
    this.app.use(bodyParser.json({ limit: "25mb" }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));
    this.app.use(cors());
    this.app.use(morgan("dev"));
    this.app.use("/uploads", express.static(path.join(__dirname, "uploads")));
    require("./config/passport");
    this.mongo();
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(
      Sentry.Handlers.errorHandler({
        shouldHandleError(error: any) {
          // Capture all 404 and 500 errors
          if (error.status > 404) {
            return true;
          }
          return false;
        },
      })
    );
    this.setupControllers();
    require("./config/cron");
  }

  private mongo() {
    const connection = mongoose.connection;
    connection.on("connected", () => {
      Logger.Imp("Mongo Connection Established");
    });
    connection.on("reconnected", () => {
      Logger.Imp("Mongo Connection Reestablished");
    });
    connection.on("disconnected", () => {
      Logger.Imp("Mongo Connection Disconnected");
      Logger.Imp("Trying to reconnect to Mongo ...");
      setTimeout(() => {
        mongoose.connect(config.db.url, {
          useNewUrlParser: true,
          autoReconnect: true,
          keepAlive: true,
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        });
      }, 3000);
    });
    connection.on("close", () => {
      Logger.Imp("Mongo Connection Closed");
    });
    connection.on("error", (error: Error) => {
      Logger.Imp("Mongo Connection ERROR: " + error);
    });

    const run = async () => {
      await mongoose.connect(config.db.url, {
        useNewUrlParser: true,
        autoReconnect: true,
        keepAlive: true,
      });
    };
    run().catch((error: Error) => Logger.Imp(error));
  }

  private setupControllers(): void {
    const ctlrInstances = [];
    for (const name in controllers) {
      if (controllers.hasOwnProperty(name)) {
        const controller = (controllers as any)[name];
        ctlrInstances.push(new controller());
      }
    }
    super.addControllers(ctlrInstances);
  }

  public start(port: number): void {
    this.app.get("*", (req, res) => {
      res.send(this.SERVER_STARTED + port);
    });
    this.app.listen(port, () => {
      Logger.Imp(this.SERVER_STARTED + port);
    });
  }
}

export default AppServer;
