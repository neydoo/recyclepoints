"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const moment = require("moment");
const cron = require("node-cron");
const Bale_1 = require("../models/Bale");
const DailySorting_1 = require("../models/DailySorting");
const Verification_1 = require("../models/Verification");
const DataHistory_1 = require("../models/DataHistory");
exports.default = cron.schedule("* 59 23 * * *", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const today = moment().startOf("day");
    let balingWeight = 0, sortingWeight = 0, totalPoints = 0;
    console.log(`start saving data collated for today ${today}`);
    const todaysBalings = yield Bale_1.Bale.find({ createdAt: { $gte: today } });
    if (todaysBalings.length) {
        balingWeight = todaysBalings.reduce((curr, bale) => {
            const { weight } = bale;
            return curr + weight;
        });
    }
    const todaysSortings = yield DailySorting_1.DailySorting.find({
        createdAt: { $gte: today },
    });
    if (todaysSortings.length) {
        sortingWeight = todaysSortings.reduce((curr, sort) => {
            const { weight } = sort;
            return curr + weight;
        });
    }
    const todaysVerifications = yield Verification_1.Verification.find({
        createdAt: { $gte: today },
    });
    if (todaysVerifications.length) {
        totalPoints = todaysVerifications.reduce((curr, request) => {
            const { points } = request;
            return curr + points;
        });
    }
    const todaysItems = {
        BCC: 0,
        PET: 0,
        UBC: 0,
        PWS: 0,
        ONP: 0,
        GBS: 0,
    };
    const todaysItemsPromise = todaysVerifications.map((request) => {
        const { items } = request;
        todaysItems.BCC += items.BCC || 0;
        todaysItems.PET += items.PET || 0;
        todaysItems.UBC += items.UBC || 0;
        todaysItems.PWS += items.PWS || 0;
        todaysItems.ONP += items.ONP || 0;
        todaysItems.GBS += items.GBS || 0;
    });
    yield Promise.all(todaysItemsPromise);
    yield DataHistory_1.DataHistory.create({
        items: todaysItems,
        balingWeight,
        sortingWeight,
        pointsEarned: totalPoints,
        date: today,
    });
    console.log(`done saving data collated for today ${today}`);
}), {
    scheduled: true,
    timezone: "Europe/Zagreb",
});
