import Core from "./CoreService";
import Notification from "./NotificationsService";
import { RequestM, Request as ItemRequest, Status } from "../models/Request";
import { RecyclePoint, RecyclePointM } from "../models/RecyclePoint";
import { RecycleItem, RecycleItemM } from "../models/RecycleItem";
import { RecyclePointRecord } from "../models/RecyclePointRecord";
import { RequestRepository as Repository } from "../abstract/RequestRepository";
import { User, IUserM } from "../models/User";
import { RedemptionItem } from "../models/RedemptionItem";

export class RequestService {
  protected repository: Repository;
  protected sms: any;
  private core: any;
  protected notification: any;
  constructor() {
    this.repository = new Repository();
    this.core = new Core();
    this.notification = new Notification();
  }

  public async create(req: any): Promise<void> {
    const payload: RequestM = req.body;
    payload.requestedBy = req.user.id;
    if (!payload.type) {
      throw new Error("invalid request type");
    }
    let balance: any;
    let recyclePoints: any;
    if (payload.type === "redemption") {
      if (!payload.redemptionItem)
        throw new Error("please select an item for redemption");
      ({ balance } = (await RecyclePoint.findOne({
        user: req.user.id,
      })) as any);

      ({ recyclePoints } = (await RedemptionItem.findById(
        payload.redemptionItem
      )) as any);

      if (balance < recyclePoints)
        throw new Error(
          "you need more recycle points to complete this request"
        );

      payload.points = recyclePoints;
    }

    const user = (await User.findById(req.user.id)) as IUserM;
    const request: any = await this.repository.createNew(payload);

    if (request.type === "redemption") {
      const details = "redemption request";
      await this.deductPoints(recyclePoints, request.id, user, details);
    }
    this.core.Email(
      user,
      "New Request",
      this.core.html(
        `<p style="color: #000">Hello
          ${user!.firstName} ${user!.lastName},
          </p>
          <p style="color: #000">
          Your ${payload.type} request has been placed successfully.
          </p>`
      )
    );

    this.core.activityLog(req, user!.id, "Reqeusted");

    this.notification.triggerNotification(
      "notifications",
      "reqeust",
      {
        user,
        message: { message: user!.lastName + " Just created a new request." },
      },
      req,
      user!.id
    );

    return request;
  }

  public async update(req: any): Promise<any> {
    const payload: any = req.body;

    const request = await this.repository.updateData(req.params.id, payload);
    const user = await User.findById(req.user.id);

    this.core.activityLog(req, user!.id, "Update request");

    return request;
  }

  public async accept(req: any): Promise<void> {
    if (req.user.designation !== "buster")
      throw new Error(`you're not allowed to perform this operation`);
    const request = (await this.repository.findById(req.params.id)) as any;
    if (!request) throw new Error("invalid request");
    if (request.status !== "pending")
      throw new Error(" request has already been accepted");

    request.acceptedBy = req.user.id;
    request.status = Status.Accepted;

    await request.save();

    const user = (await User.findById(req.user.id)) as any;

    this.core.activityLog(req, user.id, "Update request");

    return request;
  }

  public async deductPoints(
    points: number,
    requestId: string,
    user: IUserM,
    details: string
  ) {
    const recyclePoint: any = (await RecyclePoint.findOne({
      user: user.id,
    })) as RecyclePointM;

    await RecyclePointRecord.create({
      parentId: recyclePoint.id,
      type: "deduction",
      previousAmount: recyclePoint.balance,
      amount: points,
      balance: recyclePoint.balance - points,
      transactionId: requestId,
      details,
    });
    recyclePoint.balance -= points;
    await recyclePoint.save();
  }

  public async addPoints(
    points: number,
    requestId: string,
    user: string,
    details: string
  ) {
    const recyclePoint = (await RecyclePoint.findOne({
      user,
    })) as RecyclePointM;

    await RecyclePointRecord.create({
      parentId: recyclePoint.id,
      type: "addition",
      previousAmount: recyclePoint.balance as number,
      amount: points,
      balance: (recyclePoint.balance as number) + points,
      transactionId: requestId,
      details,
    });
    recyclePoint.balance = (recyclePoint.balance as number) + points;
    await recyclePoint.save();
  }

  public async calculatePoints(items: any) {
    if (!items) throw new Error("invalid item");
    const recycleItems = (await RecycleItem.find({
      isDeleted: false,
    })) as RecycleItemM[];
    let points = 0;

    await Promise.all(
      recycleItems.map((recycleItem) => {
        console.log(items[recycleItem.name]);
        const point = items[recycleItem.name] * recycleItem.recyclePoints;
        points += point;
      })
    );

    return points;
  }
}
