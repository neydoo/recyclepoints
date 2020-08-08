import Core from "./CoreService";
import Notification from "./NotificationsService";
import { RequestM, Request as ItemRequest, Status } from "../models/Request";
import { ReviewM, Review } from "../models/Review";
import { ReviewRepository as Repository } from "../abstract/ReviewRepository";
import { User } from "../models/User";

export class ReviewService {
  protected repository: Repository;
  protected sms: any;
  private core: any;
  protected notification: any;
  constructor() {
    this.repository = new Repository();
    this.core = new Core();
    this.notification = new Notification();
  }

  public async create(req: any): Promise<any> {
    const payload: ReviewM = req.body;
    const user = await User.findById(req.user.id);
    const request: any = await ItemRequest.findById(req.params.id);

    payload.buster = request.acceptedBy;
    const existingReview = await Review.findOne({ recycle: req.params.id });
    let review;
    if (existingReview) {
      review = await Review.findByIdAndUpdate(existingReview.id, payload, {
        new: true,
      });
    } else {
      payload.recycle = req.params.id;
      review = await Review.create(payload);
    }
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

  public async update(req: any): Promise<any> {
    const payload: ReviewM = req.body;

    const review = await Review.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });
    const user = await User.findById(req.params.id);

    this.core.activityLog(req, user!.id, "Update review");

    return review;
  }
}
