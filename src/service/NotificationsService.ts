import { Expo } from "expo-server-sdk";

// Create a new Expo SDK client
let expo = new Expo();
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

  public async sendPushNotification(
    title: string,
    body: string,
    tokens: string[]
  ) {
    try {
      let notifications = [];
      if (tokens.length > 1) {
        for (let pushToken of tokens) {
          if (!Expo.isExpoPushToken(pushToken)) {
            console.error(
              `Push token ${pushToken} is not a valid Expo push token`
            );
            continue;
          }

          notifications.push({
            to: pushToken,
            // sound: "default",
            title: title,
            body: body,
            data: { body },
          });
        }
      } else {
        if (!Expo.isExpoPushToken(tokens)) {
          console.error(`Push token ${tokens} is not a valid Expo push token`);
          notifications.push({
            to: tokens,
            // sound: "default",
            title: title,
            body: body,
            data: { body },
          });
        }
      }
      await expo.chunkPushNotifications(notifications);
    } catch (error) {
      console.log(error);
    }
  }

  async sendToken(token: string) {
    expo.chunkPushNotifications([
      {
        to: token,
        // sound: "default",
        title: "title",
        body: "body",
        data: { body: "body" },
      },
    ]);
  }
}
