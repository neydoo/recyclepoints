import Core from "./CoreService";
import Notification from "./NotificationsService";
import { RequestM, Request as ItemRequest, Status } from "../models/Request";
import { RecyclePoint, RecyclePointM } from "../models/RecyclePoint";
import { RecycleItem, RecycleItemM } from "../models/RecycleItem";
import { RecyclePointRecord } from "../models/RecyclePointRecord";
import { RequestRepository as Repository } from "../abstract/RequestRepository";
import { User, IUserM, Designation } from "../models/User";
import { RedemptionItem } from "../models/RedemptionItem";
import { UserNotification } from "../models/UserNotification";
import { UtilService } from "./UtilService";

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
    if (!req.user.id) throw new Error("invalid user");
    payload.requestedBy = req.user.id;
    console.log("start create request");
    if (!payload.type) {
      throw new Error("invalid request type");
    }
    let balance: any;
    let recyclePoints: any;
    if (payload.type === "redemption") {
      if (!payload.redemptionItems?.length)
        throw new Error("please select an item for redemption");
      ({ balance } = (await RecyclePoint.findOne({
        user: req.user.id,
      })) as any);

      // ({ recyclePoints } = (await RedemptionItem.findById(
      //   payload.redemptionItem
      // )) as any);
      const itemIds = payload.redemptionItems?.map((item) => item.id);
      const requestedItems: any[] = await RedemptionItem.find({ _id: itemIds });

      recyclePoints = requestedItems.reduce((curr, item, i) => {
        const { quantity } = payload.redemptionItems?.find(
          (i) => i.id === item.id
        );
        return (curr += item.recyclePoints * quantity);
      }, 0);
      console.log(
        `${balance} of user${req.user.id} with recyclepoints ${recyclePoints}`
      );

      if (balance < recyclePoints)
        throw new Error(
          "you need more recycle points to complete this request"
        );

      payload.points = recyclePoints;

      payload.redemptionId = `RE${UtilService.generate(6)}`;
      // payload.meta = payload;
    }
    console.log(`get user details`);

    const user = (await User.findById(req.user.id)) as IUserM;
    console.log(`gotten user details`);
    console.log(`creating request`);
    const request: any = await this.repository.createNew(payload);
    console.log(`created request`);

    if (request.type === "redemption") {
      const details = "redemption request";
      await this.deductPoints(recyclePoints, request.id, user, details);
    }

    if (request.type === "recycle") {
      const admins = await User.find({
        isDeleted: false,
        $or: [
          { designation: Designation.Admin },
          { desgnation: Designation.Buster },
        ],
      });

      admins.forEach(async (admin) => {
        await UserNotification.create({
          title: "New recycle request",
          userId: admin.id,
          body: `${user.fullName} just made a recycle request`,
        });
      });
    }
    if (request.type === "redemption") {
      const admins = await User.find({
        isDeleted: false,
        designation: Designation.Admin,
      });

      admins.forEach(async (admin) => {
        await UserNotification.create({
          title: "New redemption request",
          userId: admin.id,
          body: `${user.fullName} just made a recycle request`,
        });
      });
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

    const request = await ItemRequest.findById(req.params.id).populate(
      "requestedBy"
    );
    const user = await User.findById(req.user.id);

    await this.repository.updateData(req.params.id, payload);
    this.core.activityLog(req, user!.id, "Update request");

    return request;
  }

  public async accept(req: any): Promise<void> {
    const request = (await ItemRequest.findById(req.params.id)) as any;
    if (!request) throw new Error("invalid request");
    if (request.status !== "pending")
      throw new Error(" request has already been accepted");
    if (req.body.buster) request.acceptedBy = req.body.buster;

    if (!req.body.buster && req.user.designation !== "admin") {
      console.log(req.user.designation)
      throw new Error(`you're not allowed to perform this operation`);
    } else {
      request.acceptedBy = req.user.id;
    }

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
