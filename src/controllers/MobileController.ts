import { NextFunction, Request, Response } from "express";
import {
  Controller,
  ClassMiddleware,
  Get,
  Put,
  Post,
  Delete,
} from "@overnightjs/core";
import { AbstractController } from "./AbstractController";
import { RequestRepository as Repository } from "../abstract/RequestRepository";
import { checkJwt, isValidUser } from "../middleware/auth";
import { RequestM, Request as ItemRequest, Status } from "../models/Request";
import { RequestService } from "../service/RequestService";
import NotificationsService from "../service/NotificationsService";
import PaginationService from "../service/PaginationService";

@Controller("api/mobile")
export class MobileController extends AbstractController {
  private request: any = new RequestService();
  constructor() {
    super(new Repository());
  }

  @Post("test-notification")
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const notification = new NotificationsService();
      await notification.sendToken("ExponentPushToken[Sr7cq8HpzQpZw2Euz0pZPt]");
      res.status(200).json({ success: true, message: 'error.message' });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("new")
  public async createRequest(req: Request, res: Response): Promise<void> {
    try {
      // console.log(req);
      const request: RequestM = await this.request.create(req);

      res.status(200).json({
        success: true,
        data: request,
        message: "request created successfully!",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Put("update/:id")
  public async updateRequest(req: Request, res: Response): Promise<void> {
    try {
      const request: RequestM = await this.request.update(req);

      res.status(200).json({
        success: true,
        data: request,
        message: "request updated successfully",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
  @Post("accept/:id")
  public async acceptRequest(req: Request, res: Response): Promise<void> {
    try {
      const request: any = await this.request.accept(req);
      const notification = new NotificationsService();

      const { requestedBy } = request;

      await notification.sendPushNotification(
        "points awarded",
        `your recycle request has been accepted`,
        requestedBy.notificationTokens
      );

      res.status(200).json({
        success: true,
        data: request,
        message: "request updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("complete/:id")
  public async completeRequest(req: any, res: Response): Promise<void> {
    try {
      const notification = new NotificationsService();
      const itemrequest: any = (await ItemRequest.findById(
        req.params.id
      ).populate("reqeustedBy")) as RequestM;
      let items;

      const { notificationTokens }: any = itemrequest.acceptedBy;
      if (itemrequest.type === "redemption")
        throw new Error("invalid request selected");

      if (itemrequest.type === "recycle") {
        if (itemrequest.status === "completed")
          throw new Error("request is already completed");

        items = req.body.items ? req.body.items : itemrequest.items;
        if (!items) {
          throw new Error("there are no recycle items for this request");
        }
        const points = await this.request.calculatePoints(items);
        const details = "recycle";
        await this.request.addPoints(
          points,
          itemrequest.id,
          itemrequest.requestedBy,
          details
        );
        itemrequest.points = points;
      }
      itemrequest.status = Status.Completed;
      await itemrequest.save();

      await notification.sendPushNotification(
        "points awarded",
        `you've recieved ${itemrequest.points} points`,
        notificationTokens
      );

      res.status(200).json({
        success: true,
        data: itemrequest,
        message: "request updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get(":requestId")
  public async findRequest(req: Request, res: Response): Promise<void> {
    try {
      const request: RequestM = await this.repository.findById(
        req.params.requestId
      );

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("decline/:requestId")
  public async declineRequest(req: Request, res: Response): Promise<void> {
    try {
      const notification = new NotificationsService();
      const request: any = await ItemRequest.findOne({
        _id: req.params.requestId,
        status: Status.Pending,
      }).populate("requestedBy");

      request.status = Status.Declined;
      const details = "redemption declined";
      await this.request.addPoints(
        request.points,
        request.id,
        request.requestedBy,
        details
      );
      request.save();

      await notification.sendPushNotification(
        "request declined",
        `your request has been declined`,
        request.requestedBy.notificationTokens
      );

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("approve/:requestId")
  public async approveRequest(req: Request, res: Response): Promise<void> {
    try {
      const notification = new NotificationsService();
      const request: any = await ItemRequest.findOne({
        _id: req.params.requestId,
        status: Status.Pending,
      });
      request.status = Status.Approved;

      request.save();

      await notification.sendPushNotification(
        "request approved",
        `your request has been approved`,
        request.requestedBy.notificationTokens
      );
      res.status(200).json({ success: true, data: request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get("list/user")
  public async getUserRecycleRequests(req: any, res: Response): Promise<void> {
    try {
      const { startDate, endDate, status, type } = req.query;
      const criteria: any = {
        requestedBy: req.user.id,
        isDeleted: false,
      };
      if (type) {
        criteria.type = type;
      }
      if (startDate) {
        criteria.createdAt = { ">=": startDate };

        if (endDate) {
          criteria.createdAt = { "<=": endDate };
        }
        criteria.createdAt = { "<=": Date.now() };
      }

      if (status) {
        criteria.status = status;
      }
      const request = await ItemRequest.find(criteria)
        .populate("acceptedBy")
        .populate("requestedBy")
        .populate("redemptionItem");

      // const pagination = new PaginationService();

      // pagination.paginate(ItemRequest,res,1,2,criteria)

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  // @Get("list/user/redemption")
  // public async getUserRedemptionRequests(
  //   req: any,
  //   res: Response
  // ): Promise<void> {
  //   try {
  //     console.log(req.user.id);
  //     const request = await ItemRequest.find({
  //       requestedBy: req.user.id,
  //       isDeleted: false,
  //       type: "redemption",
  //     });

  //     res.status(200).json({ success: true, request });
  //   } catch (error) {
  //     res.status(400).json({ success: false, error, message: error.message });
  //   }
  // }

  @Get("buster/accepted")
  public async fetchAcceptedRequests(req: any, res: Response): Promise<void> {
    try {
      const request = await ItemRequest.find({
        acceptedBy: req.user.id,
      });

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get("buster/pending")
  public async fetchPendingRequests(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const request = await ItemRequest.find({
        status: Status.Pending,
        type: "recycle",
      });

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get("buster/completed")
  public async fetchCompletedRequests(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const request = await ItemRequest.find({
        status: Status.Collected,
        type: "recycle",
      });

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("remind-buster/:id")
  public async remindBuster(req: Request, res: Response): Promise<void> {
    try {
      const request: any = await ItemRequest.findOne({
        _id: req.params.id,
        status: Status.Accepted,
        type: "recycle",
      })
        .populate("requestedBy")
        .populate("acceptedBy");
      const notification = new NotificationsService();

      if (!request) throw new Error("invalid request selected for reminder");

      if (request.acceptedBy?.notificationTokens?.length)
        await notification.sendPushNotification(
          "pickup reminder",
          `${request.requestedBy.firstName} has sent a pickup reminder`,
          request.acceptedBy.notificationTokens
        );

      if (request.requestedBy?.notificationTokens?.length) console.log("hi");
      await notification.sendPushNotification(
        "pickup reminder",
        `reminder sent`,
        request.requestedBy.notificationTokens
      );
      res.status(200).json({ success: true, message: "sent reminder" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Delete("destroy/:id")
  public async destroy(req: Request, res: Response): Promise<void> {
    try {
      await this.request.forceDelete(req.params.id);
      res
        .status(200)
        .send({ success: true, message: "request deleted successfully" });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
}
