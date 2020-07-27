import { NextFunction, Request, Response } from "express";
import {
  Controller,
  ClassMiddleware,
  Get,
  Post,
  Middleware,
} from "@overnightjs/core";
import { checkJwt, isValidUser, isAdmin, isDev } from "../middleware/auth";
import { DailySorting, DailySortingM } from "../models/DailySorting";

@Controller("api/sorting")
@ClassMiddleware([checkJwt])
export class SortingController {
  @Get("")
  @Middleware([isAdmin])
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const criteria: any = { isDeleted: false };
      if (startDate) {
        criteria.createdAt = { ">=": startDate };
      }
      if (endDate) {
        criteria.createdAt = { "<=": endDate };
      }
      const data: DailySortingM[] = await DailySorting.find({ criteria });
      res
        .status(200)
        .send({ success: true, message: "data retrieved successfully!", data });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Get("user")
  public async userSortings(req: any, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const criteria: any = { user: req.user.id, isDeleted: false };
      if (startDate) {
        criteria.createdAt = { ">=": startDate };
      }
      if (endDate) {
        criteria.createdAt = { "<=": endDate };
      }
      const data: DailySortingM[] = await DailySorting.find({ criteria });
      res
        .status(200)
        .send({ success: true, message: "data retrieved successfully!", data });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("update/:id")
  public async update(req: Request, res: Response): Promise<void> {
    try {
      await DailySorting.updateOne({ id: req.params.id }, req.body);

      res.status(200).send({
        success: true,
        message: "item updated successfully!",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("remove/:id")
  @Middleware([isDev])
  public async enable(req: Request, res: Response): Promise<void> {
    try {
      await DailySorting.updateOne({ id: req.params.id }, { isDeleted: true });

      res.status(200).send({
        success: true,
        message: "item disabled successfully!",
      });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }
}
