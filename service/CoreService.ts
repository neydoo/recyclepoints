import { ActivityLog } from "../models/ActivityLog";
import request = require("request");

import * as nodemailer from "nodemailer";
import { Logger } from "@overnightjs/logger";
import { config } from "../config/app";

export type Options = {
  method: string;
  url: string;
  headers?: object;
  body?: string;
};

export type SmsData = {
  to: string;
  from: string;
  sms: string;
  type: string;
  channel: string;
  api_key: string;
};

export default class CoreService {
  protected options: Options;
  protected client: any;

  constructor() {
    this.client = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: config.mail.auth.api_user,
        pass: config.mail.auth.api_key,
      },
    });

    this.options = {
      method: "POST",
      url: config.sms.termii.url as string,
      headers: {
        "Content-Type": ["application/json", "application/json"],
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

      this.client.sendMail(email, (err: Error, info: any) => {
        if (err) {
          Logger.Imp(err);
        } else {
          Logger.Imp("Message sent: " + info.response);
        }
      });
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
      from: "talert",
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: config.sms.termii.apiKey as string,
    };

    const options = this.options;
    options.body = JSON.stringify(data);

    const response = request(options);

    console.log(response.body);
  }
}
