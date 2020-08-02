const moment = require("moment");
import * as bcrypt from "bcrypt-nodejs";
const _ = require("lodash");
import { NextFunction, Request, Response } from "express";
import {
  Controller,
  ClassMiddleware,
  Get,
  Put,
  Post,
  Middleware,
  Delete,
} from "@overnightjs/core";
import { AbstractController } from "./AbstractController";
import { UserRepository as Repository } from "../abstract/UserRepository";
import { checkJwt } from "../middleware/auth";
import { upload } from "../middleware/multer";
import { IUserM, User, Designation } from "../models/User";
import { Request as ItemRequest } from "../models/Request";
import { UserService } from "../service/UserService";
import { UtilService } from "../service/UtilService";
import NotificationsService from "../service/NotificationsService";
import { DailySorting } from "../models/DailySorting";
import { Bale } from "../models/Bale";
import { Verification } from "../models/Verification";
import { RecyclePoint } from "../models/RecyclePoint";

@Controller("api/users")
@ClassMiddleware([checkJwt])
export class UserController extends AbstractController {
  private user: any = new UserService();
  constructor() {
    super(new Repository());
  }

  @Get("")
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, status, designation, search } = req.query;
      const criteria: any = {
        isDeleted: false,
      };

      if (designation) {
        criteria.designation = designation;
      }
      if (startDate) {
        criteria.createdAt = { ">=": startDate };

        if (endDate) {
          criteria.createdAt = { "<=": endDate };
        }
        criteria.createdAt = { "<=": Date.now() };
      }

      if (status) {
        criteria.status = status;
      }

      if (search) {
        criteria.or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      const users: any[] = await User.find(criteria);

      const promise = users.map(async (user) => {
        if (user.designation === Designation.Sorter) {
          const lastOperation = await DailySorting.findOne({
            isDeleted: false,
            user: user.id,
          }).sort("desc");

          if (lastOperation && moment(user?.createdAt).diff("days") >= 30)
            user.active =
              moment(lastOperation?.createdAt).diff("days") < 30 &&
              !user.isDeleted;
        }

        if (user.designation === Designation.Operator) {
          const lastOperation = await Bale.findOne({
            isDeleted: false,
            user: user.id,
          }).sort("desc");

          if (lastOperation && moment(user?.createdAt).diff("days") >= 30)
            user.active =
              moment(lastOperation?.createdAt).diff("days") < 30 &&
              !user.isDeleted;
        }

        if (user.designation === Designation.Staff) {
          const lastVerification = await Verification.findOne({
            isDeleted: false,
            user: user.id,
          }).sort("desc");

          if (lastVerification && moment(user?.createdAt).diff("days") >= 30)
            user.active =
              moment(lastVerification?.createdAt).diff("days") < 30 &&
              !user.isDeleted;
        }
        return user;
      });
      await Promise.all(promise);
      res.status(200).send({ success: true, data: users });
    } catch (error) {
      res.status(401).json({ success: false, error, message: error.message });
    }
  }

  @Post("register")
  @Middleware([upload])
  public async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const user: IUserM = await this.user.create(req);

      res
        .status(200)
        .json({ success: true, user, message: "user created successfully!" });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Put("update/:userId")
  // @Middleware([upload])
  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user: IUserM = await this.user.update(req);

      res.status(200).json({
        success: true,
        data: user,
        message: "user updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
  @Get("points")
  public async getUserPoints(req: any, res: Response) {
    try {
      const points = await RecyclePoint.findOne({ user: req.user.id });

      res.status(200).send({
        success: true,
        message: "balance fetched",
        data: points?.balance,
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get(":userId")
  public async findUser(req: Request, res: Response): Promise<void> {
    try {
      const user: any = await this.repository.findById(req.params.userId);
      // let data: any = user;
      // console.log(user);
      const meta = { activity: 0 };
      let data = Object.assign({}, user._doc);

      if (user.designation === Designation.Staff) {
        meta.activity = await Verification.count({
          user: user.id,
          isDeleted: false,
        });
      }
      if (user.designation === Designation.Buster) {
        meta.activity = await ItemRequest.count({
          acceptedBy: user.id,
          isDeleted: false,
        });
      }
      if (user.designation === Designation.Sorter) {
        meta.activity = await DailySorting.count({
          user: user.id,
          isDeleted: false,
        });
      }
      if (user.designation === Designation.Operator) {
        meta.activity = await Bale.count({
          user: user.id,
          isDeleted: false,
        });
      }
      data.meta = meta;

      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Delete("destroy/:id")
  public async destroy(req: Request, res: Response): Promise<void> {
    try {
      await this.repository.forceDelete(req.params.id);
      res
        .status(200)
        .send({ success: true, message: "user deleted successfully" });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("reset")
  public async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      await this.user.resetPassword(req);
      res
        .status(200)
        .send({ success: true, message: "password reset successful" });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("resend-otp")
  public async resendOtp(req: any, res: Response) {
    try {
      const user = await User.findOne({ phone: req.body.phone });
      if (user) {
        const password = UtilService.generate(5);
        user.password = bcrypt.hashSync(password);
        user.otp = bcrypt.hashSync(password);
        const notification = new NotificationsService();
        await user.save();
        await notification.sendForgetSMS(user.phone, password);

        res.status(200).send({ success: true, message: "code sent" });
      }
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
}
