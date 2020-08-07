import { NextFunction, Request, Response } from "express";
import { Controller, Put, Post } from "@overnightjs/core";
import * as jwt from "jsonwebtoken";
import * as passport from "passport";
import * as bcrypt from "bcrypt-nodejs";
import { config } from "../config/app";
import { UserService } from "../service/UserService";
import { IUserM, User } from "../models/User";
import { UserRepository as Repository } from "../abstract/UserRepository";
import { UtilService } from "../service/UtilService";
import NotificationsService from "../service/NotificationsService";

@Controller("api/auth")
export class AuthController {
  protected auth: any;
  private repository: any = new Repository();
  constructor() {
    this.auth = new UserService();
  }

  @Post("register")
  public async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const user: IUserM = await this.auth.create(req);
      const token = jwt.sign(
        { designation: user.designation, email: user.email, userId: user.id },
        config.app.JWT_SECRET
      );
      res.status(200).json({ success: true, data: { user, token } });
    } catch (error) {
      res.status(401).json({ success: false, error, message: error.message });
    }
  }

  @Put("activate/:id")
  public async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const user: IUserM = await this.repository.findById(req.params.id);
      user.isDeleted = false;
      user.save();

      res
        .status(200)
        .json({ success: true, user, message: "user activated successfully" });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Put("deactivate/:id")
  public async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const user: IUserM = await this.repository.findById(req.params.id);
      user.isDeleted = true;
      user.save();

      res
        .status(200)
        .json({ success: true, user, message: "user activated successfully" });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("login")
  public authenticateUser(req: Request, res: Response, next: NextFunction) {
    try {
      passport.authenticate("local", { session: false }, (err, user, info) => {
        // no async/await because passport works only with callback ..
        if (err) {
          return next({ err });
        }
        if (!user) {
          const message = info.message ? info.message : "invalid credentials";
          return res.status(400).json({ success: false, info, message });
        } else {
          req.logIn(user, { session: false }, (err) => {
            if (err) {
              return res.json(err.message);
            }
            const token = jwt.sign(
              { designation: user.designation, email: user.email, id: user.id },
              config.app.JWT_SECRET
            );
            user.unverified = false;
            user.save();
            res.status(200).json({ success: true, data: { user, token } });
          });
        }
      })(req, res, next);
    } catch (err) {
      res.status(400).json({ success: false, err });
    }
  }

  @Post("reset-token")
  public async resetToken(req: any, res: Response) {
    try {
      const phone = UtilService.formatPhone(req.body.phone);
      const criteria = [
        {
          phone,
        },
        {
          phone: `0${phone.slice(3)}`,
        },
        {
          phone: `+${phone}`,
        },
      ];
      console.log(criteria);
      const user = await User.findOne({ $or: criteria });
      if (user) {
        const password = UtilService.generate(5);
        user.password = bcrypt.hashSync(password);
        user.otp = password;
        const notification = new NotificationsService();
        await user.save();
        await notification.sendForgetSMS(user.phone, password);

        res.status(200).send({ success: true, message: "code sent" });
      }
      res.status(400).send({ success: false, message: "invalid user" });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("verify-token/:phone")
  public async verifyOTP(req: Request, res: Response): Promise<any> {
    try {
      let { phone } = req.params;
      phone = UtilService.formatPhone(phone);
      const user = await User.findOne({ phone });
      if (!user) throw new Error("invalid phone number");
      if (user.otp !== req.body.otp) throw new Error("invalid otp");
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(401).json({ success: false, error, message: error.message });
    }
  }
}
