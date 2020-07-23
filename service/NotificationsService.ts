import { Notification } from "../models/Notification";

import Core from "./CoreService";
import { UtilService } from "./UtilService";

export default class NotificationsService {
  protected pushers: any;

  constructor() {
    // this.pushers = new pusher({
    //     appId: config.pusher.appId,
    //     key: config.pusher.key,
    //     secret: config.pusher.secret,
    //     cluster: config.pusher.cluster,
    // });
  }
  /**
   * TODO: socket.io implementation
   * @param notifications
   * @param type
   * @param data
   * @param req
   * @param userId
   */
  public async triggerNotification(
    notifications: string = "notifications",
    type: string,
    data: any,
    req: any,
    userId: any
  ) {
    // await this.pushers.trigger(notifications, type, data, req.headers["x-socket-id"]);
    return await this.saveNotification(
      (notifications = "notifications"),
      type,
      data,
      userId
    );
  }

  private async saveNotification(
    notifications: string = "notifications",
    type: any,
    data: any,
    userId: any
  ) {
    const notify = await Notification.create({
      userId,
      name: notifications,
      type,
      data: JSON.stringify(data),
    });

    return notify;
  }

  public async sendRegistrationSMS(number: string, otp: string) {
    const coreService = new Core();
    const utilService = new UtilService();

    number = utilService.formatPhone(number);
    const message =
      "Thank you for registering with Recycle Points. Here's your code: " + otp;
    await coreService.sendSms(message, number);
  }

  public async sendForgetSMS(number: string, otp: string) {
    const coreService = new Core();
    const utilService = new UtilService();

    number = utilService.formatPhone(number);
    const message = "You forgot your password? Here's your code: " + otp;
    await coreService.sendSms(message, number);
  }
}
