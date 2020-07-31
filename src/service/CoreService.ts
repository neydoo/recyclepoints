import { ActivityLog } from "../models/ActivityLog";
import axios, { AxiosRequestConfig } from "axios";
import * as sgMail from "@sendgrid/mail";

// import * as nodemailer from "nodemailer";
import { Logger } from "@overnightjs/logger";
import { config } from "../config/app";
import { UtilService } from "./UtilService";
import { getMaxListeners } from "process";

sgMail.setApiKey(config.mail.sendgrid.api_key);
// export type Options = {
//   method: string;
//   url: string;
//   headers?: object;
//   data?: string;
// };

export type SmsData = {
  to: string;
  from: string;
  sms: string;
  type: string;
  channel: string;
  api_key: string;
};

export default class CoreService {
  protected options: AxiosRequestConfig;
  protected client: any;

  constructor() {
    this.options = {
      method: "POST",
      url: config.sms.termii.url as string,
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  public async activityLog(req: any, userId: string, description: string) {
    if (userId) {
      const logs = await ActivityLog.create({
        userId,
        description,
        ipAddress:
          req.header("x-forwarded-for") || req.connection.remoteAddress,
      });

      return logs;
    }
  }

  public Email(data: any, subject: string, message: string) {
    try {
      const email = {
        from: config.app.name,
        to: data.email ? data.email : config.app.email,
        subject,
        html: message,
      };

      // this.client.sendMail(email, (err: Error, info: any) => {
      //   if (err) {
      //     Logger.Imp(err);
      //   } else {
      //     Logger.Imp("Message sent: " + info.response);
      //   }
      // });
    } catch (error) {
      throw new Error(error);
    }
  }

  public html(data: any): string {
    return `<div id="content" style="background-color: #1D4BB7width:100%">
            <nav>
                <div class="container-fluid">
                    <span><a href="https://refill-app.herokuapp.com"><img src="https://refillappapi.herokuapp.com/uploads/images/refill_logo.png" style="width: 120px height: 45px padding:10px" class="img-responsive"></a></span>
                </div>
            </nav>
            <div style="background-color: #fefefepadding:20pxcolor:#000">${data}</div>
        </div>`;
  }

  public async sendSms(message: string, number: string) {
    if (!message || !number) return;
    const data: SmsData = {
      to: number,
      from: "N-Alert",
      sms: message,
      type: "plain",
      channel: "dnd",
      api_key: config.sms.termii.apiKey as string,
    };

    const options = this.options;
    options.url += "/sms/send";

    options.data = data;

    console.log(options);
    try {
      const response = await axios(options);
      console.log(response.data);
      if (Math.abs(response.data.balance) < 50) {
        const data = {
          email: "enoch4real7@gmail.com",
          subject: "low sms balance",
          text: "",
          html: "",
        };
        data.text = "We are glad to have you on board";
        data.html = `<p> Please top up sms balance- N${Math.abs(
          response.data.balance
        )}</p>`;

        this.sendMail(data);
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  async sendMail(data: any) {
    try {
      const msg = {
        to: data.email,
        from: "support@recyclepoints.com",
        subject: data.subject,
        text: data.text,
        html: data.html,
      };
      sgMail.send(msg);
    } catch (error) {
      throw new Error(error);
    }
  }
}
