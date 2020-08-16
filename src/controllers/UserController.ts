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
import { IUserM, User, Designation } from "../models/User";
import { Request as ItemRequest, Status } from "../models/Request";
import { UserService } from "../service/UserService";
import { UtilService } from "../service/UtilService";
import NotificationsService from "../service/NotificationsService";
import { DailySorting } from "../models/DailySorting";
import { Bale } from "../models/Bale";
import { Verification } from "../models/Verification";
import { RecyclePoint } from "../models/RecyclePoint";
import { Review } from "../models/Review";

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
      const {
        startDate,
        endDate,
        status,
        designation,
        search,
        sort,
      } = req.query;
      const criteria: any = {
        isDeleted: false,
      };

      if (designation) {
        criteria.designation = designation;
      }
      if (startDate) {
        criteria.createdAt = {
          $gte: startDate,
          $lte: endDate ? endDate : moment(),
        };
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
          }).sort(sort);

          if (lastOperation && moment(user?.createdAt).diff("days") >= 30)
            user.active =
              moment(lastOperation?.createdAt).diff("days") < 30 &&
              !user.isDeleted;
        }

        if (user.designation === Designation.Operator) {
          const lastOperation = await Bale.findOne({
            isDeleted: false,
            user: user.id,
          }).sort(sort);

          if (lastOperation && moment(user?.createdAt).diff("days") >= 30)
            user.active =
              moment(lastOperation?.createdAt).diff("days") < 30 &&
              !user.isDeleted;
        }

        if (user.designation === Designation.Staff) {
          const lastVerification = await Verification.findOne({
            isDeleted: false,
            user: user.id,
          }).sort(sort);

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
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("register")
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

  @Put("update-user/:userId")
  public async updateUserWeb(req: Request, res: Response): Promise<void> {
    try {
      const user: IUserM = await this.user.updateWeb(req);

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
      let points = 0;
      const recycle = await RecyclePoint.findOne({ user: req.user.id });
      points = recycle?.balance || 0;

      res.status(200).send({
        success: true,
        message: "balance fetched",
        data: points,
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
      const meta: any = {
        activity: 0,
        recycles: 0,
        redemptions: 0,
        points: 0,
        rating: 0,
        uniqueRecyclers: 0,
        data: [],
      };
      let data = Object.assign({}, user._doc);

      if (user.designation === Designation.Staff) {
        const activity = await Verification.find({
          user: user.id,
          isDeleted: false,
        });
        meta.activity = activity.length
        meta.data = activity;
      }
      if (user.designation === Designation.Buster) {
        const allBusts = await ItemRequest.find({
          acceptedBy: user.id,
          isDeleted: false,
          type: "recycle",
          $and: [
            {
              status: { $ne: Status.Pending },
            },
            { status: { $ne: Status.Cancelled } },
          ],
        });
        const uniqByProp_map = (prop: any) => (arr: any[]) =>
          Array.from(
            arr
              .reduce(
                (acc, item) => (
                  item && item[prop] && acc.set(item[prop], item), acc
                ), // using map (preserves ordering)
                new Map()
              )
              .values()
          );

        // usage (still the same):

        const uniqueById = uniqByProp_map("id");

        const unifiedArray = uniqueById(allBusts);
        meta.uniqueRecyclers = unifiedArray.length;

        meta.activity = await ItemRequest.count({
          acceptedBy: user.id,
          isDeleted: false,
          status: Status.Collected,
        });

        const reviews = await Review.find({ buster: user.id });
        const ratings = reviews.reduce(
          (curr, review) => curr + review.rating,
          0
        );

        meta.rating = ratings / reviews.length;
        meta.data = allBusts;
      }

      if (user.designation === Designation.Client) {
        meta.recycles = await ItemRequest.count({
          acceptedBy: user.id,
          isDeleted: false,
          type: "recycle",
          $and: [
            {
              status: { $ne: Status.Pending },
            },
            { status: { $ne: Status.Cancelled } },
          ],
        });

        meta.redemptions = await ItemRequest.count({
          acceptedBy: user.id,
          isDeleted: false,
          type: "redemption",
          status: { $ne: Status.Pending },
        });

        const points = await RecyclePoint.findOne({
          user: user.id,
        });
        meta.points = points?.balance || 0;
      }
      if (user.designation === Designation.Sorter) {
        const activity = await DailySorting.find({
          user: user.id,
          isDeleted: false,
        });
        meta.activity = activity.length;
        meta.data = activity;
      }
      if (user.designation === Designation.Operator) {
        const activity = await Bale.find({
          user: user.id,
          isDeleted: false,
        });
        meta.activity = activity.length;
        meta.data = activity;
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
        await notification.sendRegistrationSMS(user.phone, password);

        res.status(200).send({ success: true, message: "code sent" });
      }
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("update-password")
  public async updatePassword(req: any, res: Response) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      console.log(`${oldPassword} ${newPassword}, ${confirmPassword}`);
      if (!oldPassword || !newPassword) throw new Error("missing parameters");
      console.log("here-1");
      const user = await User.findOne({ _id: req.user.id }).select("+password");
      console.log("here0");
      if (user) {
        if (confirmPassword && confirmPassword !== newPassword)
          throw new Error("passwords do not match");
        console.log("here");
        if (!user.comparePassword(oldPassword.toString()))
          throw new Error("invalid old password");
        console.log("here1");

        user.password = bcrypt.hashSync(newPassword);
        console.log("here2");
        await user.save();
        console.log("here3");
        res.status(200).send({ success: true, message: "password changed" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
}
