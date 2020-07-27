import Core from "./CoreService";
import Notification from "./NotificationsService";
import { IUserM } from "../models/User";
import { UserRepository as Repository } from "../abstract/UserRepository";
import { UtilService } from "./UtilService";
import File from "../utilities/file";
import * as bcrypt from "bcrypt-nodejs";
import { RecyclePoint } from "../models/RecyclePoint";

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
  }

  public async create(req: any): Promise<void> {
    const userPayload: IUserM = req.body;
    const { firstName, lastName, phone, designation } = userPayload;
    if (!firstName || !lastName || !phone || !designation)
      throw new Error("incomplete parameters");

    if (!userPayload.password) {
      if (userPayload.designation === "client") {
        const otp = UtilService.generate(4);
        userPayload.otp = otp;
        userPayload.password = otp;
        await this.notification.sendRegistrationSMS(userPayload.phone, otp);
      } else {
        userPayload.password = "123456";
      }
    }
    userPayload.password = bcrypt.hashSync(userPayload.password as string);

    const createdUser = await this.repository.createNew(userPayload);
    const user = await this.repository.findById(createdUser.id);
    if (createdUser.designation === "client")
      await RecyclePoint.create({ user: createdUser.id });

    user.profileImage = req.body.profileImage
      ? this.file.localUpload(req.body.profileImage, "/images/profile/", ".png")
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
      ? this.file.localUpload(req.body.profileImage, "/images/profile/", ".png")
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
}
