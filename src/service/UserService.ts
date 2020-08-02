import Core from "./CoreService";
import { v2 as cloudinary } from "cloudinary";
// const cloudinary = require("cloudinary");

const cloudinaryStorage = require("multer-storage-cloudinary");
const multer = require("multer");
import * as bcrypt from "bcrypt-nodejs";

import Notification from "./NotificationsService";
import { IUserM } from "../models/User";
import { UserRepository as Repository } from "../abstract/UserRepository";
import { UtilService } from "./UtilService";
import File from "../utilities/file";
import { RecyclePoint } from "../models/RecyclePoint";
import { config } from "../config/app";

const clodConfig = {
  cloud_name: config.image.cloud_name,
  api_key: config.image.api_key,
  api_secret: config.image.api_secret,
};

export class UserService {
  protected repository: any;
  protected sms: any;
  private core: any;
  protected notification: any;
  private file = new File();
  constructor() {
    this.repository = new Repository();
    this.core = new Core();
    this.notification = new Notification();

    // set your env variable CLOUDINARY_URL or set the following configuration
  }

  public async create(req: any): Promise<void> {
    const userPayload: IUserM = req.body;
    const { firstName, lastName, phone, designation } = userPayload;
    if (!firstName || !lastName || !phone || !designation)
      throw new Error("incomplete parameters");

    if (!userPayload.password) {
      if (userPayload.designation === "client") {
        const otp = UtilService.generate(5);
        userPayload.otp = otp;
        userPayload.password = otp;
        userPayload.unverified = true;
        await this.notification.sendRegistrationSMS(userPayload.phone, otp);
      } else {
        userPayload.password = "123456";
      }
    }
    userPayload.password = bcrypt.hashSync(userPayload.password as string);

    // return console.log(userPayload);

    const createdUser = await this.repository.createNew(userPayload);
    const user = await this.repository.findById(createdUser.id);
    if (createdUser.designation === "client")
      await RecyclePoint.create({ user: createdUser.id });

    user.profileImage = req.body.profileImage
      ? await this.cloudinaryUploader(req.body.profileImage)
      : null;
    user.save();

    this.core.Email(
      user,
      "New Registration",
      this.core.html(
        '<p style="color: #000">Hello ' +
          user.firstName +
          " " +
          user.lastName +
          ", Thank you for registering at Recycle Points.<br> Please click the link below to complete registration https://fashioncastapi.herokuapp.com/api/activate/" +
          user.temporarytoken +
          "</p>"
      )
    );

    this.core.activityLog(req, user.id, "Registered");

    this.notification.triggerNotification(
      "notifications",
      "users",
      {
        user,
        message: { message: user.lastName + " Just created a new account." },
      },
      req,
      user.id
    );

    return user;
  }

  public async update(req: any): Promise<void> {
    const userPayload: IUserM = req.body;

    if (userPayload.password) {
      userPayload.password = bcrypt.hashSync(req.body.password);
    }

    const existingUser = await this.repository.findById(req.params.userId);
    if (existingUser.firstTimeLogin) userPayload.firstTimeLogin = false;
    const user = await this.repository.updateData(
      req.params.userId,
      userPayload
    );

    user.profileImage = req.body.profileImage
      ? await this.cloudinaryUploader(req.body.profileImage)
      : user.profileImage;
    user.save();

    // this.core.Email(
    //   user,
    //   "Profile Updated",
    //   this.core.html(
    //     `<p style="color: #000">Hello ${user.firstName} ${user.lastName}, \n\r Your profile has been updated successfully. </p>`
    //   )
    // );

    this.core.activityLog(req, user.id, "Update Profile");

    this.notification.triggerNotification(
      "notifications",
      "users",
      {
        user,
        message: { message: user.lastName + " Just created a new account." },
      },
      req,
      user.id
    );

    return user;
  }

  public async resetPassword(req: any) {
    const user = await this.repository.findOne({
      or: [{ phone: req.body.email }, { email: req.body.email }],
    });
    const password = UtilService.generate(5);
    user.password = bcrypt.hashSync(password);
    user.otp = bcrypt.hashSync(password);

    await user.save();
    await this.notification.sendForgetSMS(user.phone, password);

    this.core.Email(
      user,
      "Password Reset",
      this.core.html(
        `<p style="color: #000">Hello ${user.firstName} ${user.lastName}, \n\r Your password has been reset. Your new password is ${password} </p>`
      )
    );
    return user;
  }
  public async resendOtp(req: any) {
    const user = await this.repository.findOne({ phone: req.body.phone });
    const password = UtilService.generate(5);
    user.password = bcrypt.hashSync(password);
    user.otp = bcrypt.hashSync(password);

    await user.save();
    await this.notification.sendForgetSMS(user.phone, password);

    this.core.Email(
      user,
      "Password Reset",
      this.core.html(
        `<p style="color: #000">Hello ${user.firstName} ${user.lastName}, \n\r Your password has been reset. Your new password is ${password} </p>`
      )
    );
    return user;
  }

  public async cloudinaryUploader(image: any) {
    try {
      console.log(image);
      cloudinary.config(clodConfig)

        const matches = image.match(/^data:.+\/(.+);base64,(.*)$/);

        const buffer = new Buffer(image, 'base64');

        const randomizedName = (function() {
          // Math.random should be unique because of its seeding algorithm.
          // Convert it to base 36 (numbers + letters), and grab the first 9 characters
          // after the decimal.
          //   b25d8376-0881-4cc4-883e-716cf1a8799f
          return `image_${Math.random()
            .toString(36)
            .substr(2, 8)}-${Math.random()
            .toString(8)
            .substr(2, 4)}-${Math.random()
            .toString(12)
            .substr(2, 4)}-${Math.random()
            .toString(13)
            .substr(2, 12)}`;
        })();

      const url = await cloudinary.uploader.upload(`${randomizedName}.png`);
      console.log(url);
      return url.public_id;
    } catch (error) {
      console.log(error);
    }
  }
}
