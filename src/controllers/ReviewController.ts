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
import { checkJwt } from "../middleware/auth";
import { ReviewM, Review } from "../models/Review";
import { ReviewService } from "../service/ReviewService";

@Controller("api/review")
@ClassMiddleware([checkJwt])
export class ReviewController extends AbstractController {
  private review: any = new ReviewService();
  constructor() {
    super(new Repository());
  }

  @Get("")
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const review: ReviewM[] = await Review.find({});
      res.status(200).send({ success: true, data: review });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("new/:id")
  public async createReview(req: Request, res: Response): Promise<void> {
    try {
      const review: ReviewM = await this.review.create(req);

      res.status(200).json({
        success: true,
        review,
        message: "review created successfully!",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Put("update/:id")
  public async updateRequest(req: Request, res: Response): Promise<void> {
    try {
      const review: ReviewM = await this.repository.update(req);

      res.status(200).json({
        success: true,
        review,
        message: "review updated successfully",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get(":reviewId")
  public async findRequest(req: Request, res: Response): Promise<void> {
    try {
      const review = await Review.findById(req.params.reviewId);

      res.status(200).json({ success: true, data: review });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get("buster/:id")
  public async fetchAcceptedRequests(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const review: ReviewM[] = await Review.find({
        buster: req.params.id,
      });

      res.status(200).json({ success: true, data: review });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Delete("destroy/:id")
  public async destroy(req: Request, res: Response): Promise<void> {
    try {
      await this.repository.forceDelete(req.params.id);
      res
        .status(200)
        .send({ success: true, message: "review deleted successfully" });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
}
