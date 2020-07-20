import Core from "./CoreService";
import Notification from "./NotificationsService";
import { ReviewM } from "../models/Review";
import { RequestRepository as Repository } from "../Abstract/RequestRepository";
import { User } from "../models/user";

export class RecycleRequestService {
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
    const payload: ReviewM = req.body;
    payload.recycle = req.params.id;
    const user = await User.findById(req.user.id);
    const review = await this.repository.createNew(payload);

    this.core.activityLog(req, user!.id, "Reviewed");

    this.notification.triggerNotification(
      "notifications",
      "reqeust",
      {
        user,
        message: { message: user!.lastName + " Just created a new review." },
      },
      req,
      user!.id
    );

    return review;
  }

  public async update(req: any): Promise<void> {
    const payload: ReviewM = req.body;

    const review = await this.repository.updateData(
      req.params.id,
      payload
    );
    const user = await User.findById(req.params.id);

    this.core.activityLog(req, user!.id, "Update review");

    return review;
  }
}
