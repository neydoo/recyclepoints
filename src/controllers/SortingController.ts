const moment = require('moment');
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
import { PdfService } from 'src/service/PdfService';

@Controller("api/sorting")
@ClassMiddleware([checkJwt])
export class SortingController {
  @Get("")
  @Middleware([isAdmin])
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        search,
        pay,
        type,
        product,
        arrivalTime,
      } = req.query;

      const criteria: any = { isDeleted: false };
      const searchCriteria: any = { designation: "sorter" };

      if (startDate) {
        criteria.createdAt = { ">=": startDate };
      }
      if (endDate) {
        criteria.createdAt = { "<=": endDate };
      }
      if (pay) {
        searchCriteria.pay = pay;
      }
      if (type) {
        criteria.type = type;
      }

      if (product) {
        criteria.item = product;
      }
      if (arrivalTime) {
        criteria.arrivalTime = arrivalTime;
      }

      if (search) {
        searchCriteria.$or = [
          { firstName: /search/ },
          { lastName: /search/ },
          { address: /search/ },
          { phone: /search/ },
        ];
      }

      const data = await DailySorting.find({ criteria }).populate({
        path: "user",
        match: searchCriteria,
      });
      res
        .status(200)
        .send({ success: true, message: "data retrieved successfully!", data });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }


  @Get("user/:id")
  public async userSortings(req: any, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const user = req.params.id ? req.params.id : req.user.id
      const criteria: any = { user, isDeleted: false };
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
      await DailySorting.updateOne({ id: req.params.id }, req.body, {
        new: true,
      });

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


  @Get("data")
  public async getData(req: any, res: Response): Promise<void> {
    try {
      const {
        PET,
        UBC,
        ONP,
        BCC,
        GBS,
        PWS,
        name,
        arrivalTime,
        startDate,
        endDate,
        pay,
      } = req.query;

      const criteria: any = {};
      const SubCriteria: any = {};

      if (name) {
        SubCriteria.$or = [{ firstName: /search/ }, { lastName: /search/ }];
      }

      if (arrivalTime) criteria.arrivalTime = arrivalTime;
      if (startDate) {
        criteria.createdAt = {
          $gte: startDate,
          $lte: endDate ? endDate : moment(),
        };
      }
      if (pay) SubCriteria.pay = pay;

      const sorting = await DailySorting.find(criteria).populate({
        path: "user",
        match: SubCriteria,
      });
      const sortingPromise = sorting.map((sort) => {
        const item: any = {};
        if (UBC) {
          item.UBC = sort.items.UBC
        }
        if (PWS) {
          item.PWS = sort.items.PWS
        }
        if (ONP) {
          item.ONP = sort.items.ONP
        }
        if (BCC) {
          item.BCC = sort.items.BCC
        }
        if (GBS) {
          item.GBS = sort.items.GBS
        }
        if (PET) {
          item.PET = sort.items.PET
        }
        return sort.items = item;
      });
      await Promise.all(sortingPromise)
      res.status(200).json({ success: true, message: "saved", data:sorting });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post('data/pdf')
  async downloadPdf(req: Request, res: Response) {
    try {
      const data = req.body;
      const pdf =  new PdfService();
      const file = await pdf.generateStaffDataPdf(data);
      res.status(200).json({ success: true, message: "saved", data:file });
    } catch (error) {

    }
  }
}
