const moment = require("moment");
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
import { PdfService } from "../service/PdfService";
import { User } from "../models/User";

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
        userId,
        arrivalTime,
      } = req.query;

      const criteria: any = { isDeleted: false };
      const searchCriteria: any = { designation: "sorter" };
      let users: any = [];
      if (startDate) {
        criteria.createdAt = {
          $lte: endDate ? endDate : moment(),
          $gte: startDate,
        };
      }

      if (pay) {
        searchCriteria.pay = pay;
      }

      if (type) {
        criteria.type = type;
      }

      if (userId) {
        searchCriteria._id = userId;
      }

      if (product) {
        criteria.item = product;
      }

      if (arrivalTime) {
        criteria.arrivalTime = arrivalTime;
      }

      if (search) {
        searchCriteria.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
        users = await User.find(searchCriteria);
      }

      if (users?.length) {
        const userIds = users.map((u: any) => u.id);
        criteria.requestedBy = userIds;
      } else if (!users.length && search) {
        criteria.requestedBy = null;
      }

      const data = await DailySorting.find(criteria).populate("user");
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
      const user = req.params.id ? req.params.id : req.user.id;
      const criteria: any = { user, isDeleted: false };

      if (startDate) {
        criteria.createdAt = {
          $lte: endDate ? endDate : moment(),
          $gte: startDate,
        };
      }

      const data: DailySortingM[] = await DailySorting.find(criteria);
      res
        .status(200)
        .send({ success: true, message: "data retrieved successfully!", data });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("new")
  public async create(req: any, res: Response): Promise<void> {
    try {
      const { weight, points, arrivalTime, items } = req.body;

      if (!weight || !points || !arrivalTime || !items)
        throw new Error("incomplete parameters");

      const sortData = req.body;
      sortData.user = req.user.id;

      const data = await DailySorting.create(sortData);

      res.status(200).send({
        success: true,
        message: "item saved successfully!",
        data,
      });
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

  @Get("dashboard/:id")
  public async dashboardData(req: Request, res: Response): Promise<void> {
    try {
      const sortings = await DailySorting.find({ user: req.params.id });
      const today = moment().startOf("day");
      const yesterday = moment().startOf("day").subtract(1, "day");
      const data = {
        yesterday: 0,
        today: 0,
        allTime: sortings.length,
      };
      const sortingsPromise = sortings.map((sort) => {
        if (sort.createdAt >= today) data.today += 1;
        if (sort.createdAt >= yesterday && sort.createdAt <= today)
          data.yesterday += 1;
      });
      await Promise.all(sortingsPromise);
      res.status(200).send({
        success: true,
        message: "dashboard info retrieved",
        data,
      });
    } catch (error) {
      console.log(error);
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
        userId,
      } = req.query;

      const criteria: any = {};
      const subCriteria: any = {};

      let users: any[] = [];
      if (pay || name) {
        if (pay) subCriteria.pay = pay;
        if (name) {
          subCriteria.$or = [
            { firstName: { $regex: name, $options: "i" } },
            { lastName: { $regex: name, $options: "i" } },
          ];
        }
        users = await User.find(subCriteria);
      }

      if (users?.length && !userId) {
        const userIds = users.map((u: any) => u.id);
        criteria.user = userIds;
      } else if (!users.length && name) {
        criteria.user = null;
      } else if (userId) {
        criteria.user = userId;
      }

      if (arrivalTime) criteria.arrivalTime = arrivalTime;
      if (startDate) {
        criteria.createdAt = {
          $gte: startDate,
          $lte: endDate ? endDate : moment(),
        };
      }

      const sorting = await DailySorting.find(criteria).populate("user");
      // const sortingPromise = sorting.map((sort) => {
      //   const item: any = {};
      //   if (UBC) {
      //     item.UBC = sort.items.UBC;
      //   }
      //   if (PWS) {
      //     item.PWS = sort.items.PWS;
      //   }
      //   if (ONP) {
      //     item.ONP = sort.items.ONP;
      //   }
      //   if (BCC) {
      //     item.BCC = sort.items.BCC;
      //   }
      //   if (GBS) {
      //     item.GBS = sort.items.GBS;
      //   }
      //   if (PET) {
      //     item.PET = sort.items.PET;
      //   }
      //   return (sort.items = item);
      // });
      // await Promise.all(sortingPromise);
      res.status(200).json({ success: true, message: "saved", data: sorting });
    } catch (error) {
      res.status(400).json({ success: false, error, message: error.message });
    }
  }

  @Post("data/pdf")
  async downloadPdf(req: Request, res: Response) {
    try {
      const data = req.body;
      const pdf = new PdfService();
      const file = await pdf.generateStaffDataPdf(data);
      res.status(200).json({ success: true, message: "saved", data: file });
    } catch (error) {}
  }
}
