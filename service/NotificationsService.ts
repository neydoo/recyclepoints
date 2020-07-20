import { Notification } from "../models/Notification";

import core from "./CoreService";

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
    const message =
      "Thank you for registering for Recycle Points. Here's your otp: " + otp;
    await core.prototype.sendSms(message, number);
  }
}
