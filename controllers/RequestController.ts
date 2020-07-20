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
import { RequestRepository as Repository } from "../Abstract/RequestRepository";
import { checkJwt, isValidUser } from "../middleware/auth";
import { RequestM, Request as ItemRequest, Status } from "../models/Request";
import { RequestService } from "../service/RequestService";

@Controller("api/request")
@ClassMiddleware([checkJwt])
export class RequestController extends AbstractController {
  private request: any = new RequestService();
  constructor() {
    super(new Repository());
  }

  @Get("")
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const request: RequestM = await this.repository.findAll();
      res.status(200).send({ success: true, request });
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
        request,
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
        request,
        message: "request updated successfully",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
  @Post("accept/:id")
  public async acceptRequest(req: Request, res: Response): Promise<void> {
    try {
      const request: RequestM = await this.request.accept(req);

      res.status(200).json({
        success: true,
        request,
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
      const itemrequest = (await ItemRequest.findById(
        req.params.id
      )) as RequestM;
      let items;

      if (itemrequest.type === "redemption")
        throw new Error("invalid request selected");

      if (itemrequest.type === "recycle") {
        if (itemrequest.status === "completed")
          throw new Error("request is already completed");

        items = req.body.items ? req.body.items : itemrequest.items;
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

      res.status(200).json({ success: true, request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("decline/:requestId")
  public async declineRequest(req: Request, res: Response): Promise<void> {
    try {
      const request: any = await ItemRequest.findOne({
        _id: req.params.requestId,
        status: Status.Pending,
      });

      request.status = Status.Declined;
      const details = "redemption declined";
      await this.request.addPoints(
        request.points,
        request.id,
        request.requestedBy,
        details
      );
      request.save();
      res.status(200).json({ success: true, request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("approve/:requestId")
  public async approveRequest(req: Request, res: Response): Promise<void> {
    try {
      const request: any = await ItemRequest.findOne({
        _id: req.params.requestId,
        status: Status.Pending,
      });
      request.status = Status.Approved;

      request.save();
      res.status(200).json({ success: true, request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get("list/user/recycle")
  public async getUserRecycleRequests(req: any, res: Response): Promise<void> {
    try {
      console.log(req.user.id);
      const request = await ItemRequest.find({
        requestedBy: req.user.id,
        isDeleted: false,
        type: "recycle",
      });

      res.status(200).json({ success: true, request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get("list/user/redemption")
  public async getUserRedemptionRequests(
    req: any,
    res: Response
  ): Promise<void> {
    try {
      console.log(req.user.id);
      const request = await ItemRequest.find({
        requestedBy: req.user.id,
        isDeleted: false,
        type: "redemption",
      });

      res.status(200).json({ success: true, request });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get("buster/accepted")
  public async fetchAcceptedRequests(req: any, res: Response): Promise<void> {
    try {
      const request = await ItemRequest.find({
        acceptedBy: req.user.id,
      });

      res.status(200).json({ success: true, request });
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

      res.status(200).json({ success: true, request });
    } catch (error) {
      res.status(401).json({ success: false, error, message: error.message });
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

      res.status(200).json({ success: true, request });
    } catch (error) {
      res.status(401).json({ success: false, error, message: error.message });
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
      res.status(401).json({ success: false, error, message: error.message });
    }
  }
}
