"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expo_server_sdk_1 = require("expo-server-sdk");
const _ = require("lodash");
let expo = new expo_server_sdk_1.Expo();
class PaginationService {
    constructor() { }
    paginate(model, res, currentpage, perpage, criteria, sortby, populate = {}) {
        const pagination = {
            page: currentpage || 1,
            limit: perpage || 10,
        };
        const params = criteria || { isDeleted: false };
        model
            .countDocuments(params)
            .then((count) => {
            const findQuery = model.find(params);
            if (!_.isEmpty(populate)) {
                Object.entries(populate).forEach(([key, value]) => {
                    findQuery.populate(key, value);
                });
            }
            findQuery.paginate(pagination);
            if (sortby) {
                findQuery.sort(sortby);
            }
            else {
                findQuery.sort("createdAt DESC");
            }
            return [count, findQuery];
        })
            .spread((count, data) => {
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
            .catch((err) => console.log(err));
    }
}
exports.default = PaginationService;
