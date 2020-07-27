import { Expo } from "expo-server-sdk";
import * as _ from "lodash";

// Create a new Expo SDK client
let expo = new Expo();
import { Notification } from "../models/Notification";

import Core from "./CoreService";
import { UtilService } from "./UtilService";

export default class PaginationService {
  protected pushers: any;

  constructor() {}
  paginate(
    model: any,
    res: any,
    currentpage: number,
    perpage: number,
    criteria: any,
    sortby?: any,
    populate = {}
  ) {
    const pagination = {
      page: currentpage || 1,
      limit: perpage || 10,
    };
    const params = criteria || { isDeleted: false };
    model
      .countDocuments(params)
      .then((count: number) => {
        const findQuery = model.find(params);

        // E.G populate = { 'organization': { isDeleted: false }}
        if (!_.isEmpty(populate)) {
          Object.entries(populate).forEach(([key, value]) => {
            findQuery.populate(key, value);
          });
        }
        findQuery.paginate(pagination);
        if (sortby) {
          findQuery.sort(sortby);
        } else {
          findQuery.sort("createdAt DESC");
        }
        return [count, findQuery];
      })
      .spread((count: any, data: any) => {
        if (data.length) {
          const numberOfPages = Math.ceil(count / pagination.limit);
          const nextPage = pagination.page + 1;
          const meta = {
            page: pagination.page,
            perPage: pagination.limit,
            previousPage: pagination.page > 1 ? pagination.page - 1 : false,
            nextPage: numberOfPages >= nextPage ? nextPage : false,
            pageCount: numberOfPages,
            total: count,
          };
          res
            .status(200)
            .json({ success: false, message: "records retrieved", data, meta });
        }
        res.json();
      })
      .catch((err: any) => console.log(err));
  }
}
