import { NextFunction, Request, Response } from "express";
import {
  Controller,
  ClassMiddleware,
  Get,
  Put,
  Post,
  Delete,
  Middleware,
} from "@overnightjs/core";
import { checkJwt, isValidUser, isAdmin, isDev } from "../middleware/auth";
import CoreService from "../service/CoreService";
import { User } from "../models/User";

@Controller("api/notification")
@ClassMiddleware([checkJwt])
export class NotificationController {
  @Post("sms-test/:number")
  @Middleware([isDev])
  public async testSms(req: Request, res: Response): Promise<void> {
    try {
      const message = "hi there";
      const number = req.params.number;
      const core = new CoreService();
      await core.sendSms(message, number);
      res.status(200).send({
        success: true,
        message: "message sent",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("save-token")
  public async saveToken(req: any, res: Response): Promise<void> {
    try {
      const { id } = req.user;

      await User.updateOne(
        { _id: id },
        { $addToSet: { notificationTokens: req.body.token } }
      );

      res.status(200).send({
        success: true,
        message: "token saved",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("retrieve-token")
  public async retrieveToken(req: any, res: Response): Promise<void> {
    try {
      const { id } = req.user;
      const user: any = await User.findOne({ _id: id });

      const userTokens = user.notificationTokens ? user.notificationTokens : [];

      res.status(200).send({
        success: true,
        message: "message sent",
        data: userTokens,
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
}
