"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const PDF = require("pdfkit");
const PdfTable = require("voilab-pdf-table");
const moment = require("moment");
const fs = require("fs");
const app_1 = require("../config/app");
class PdfService {
    generateDataPdf(columns, data, type) {
        try {
            const logoLocation = app_1.config.recycle.logoUrl;
            const doc = new PDF({ size: "legal" });
            const currentDate = moment().format("Do MMMM YYYY");
            const table = new PdfTable(doc, {
                bottomMargin: 30,
            });
            let page = 1;
            doc.fontSize(11);
            const buffers = [];
            doc.on("data", buffers.push.bind(buffers));
            const waitForEvent = (type) => new Promise((resolve) => {
                doc.on(type, resolve);
            });
            doc.on("pageAdded", () => {
                page += 1;
            });
            const leftOptions = { width: 410, align: "left" };
            const rightOptions = { width: 410, align: "right" };
            const centerOptions = { width: 410, align: "center" };
            const centerUnderlinedOptions = Object.assign(centerOptions, {
                underline: true,
            });
            doc
                .image(logoLocation, doc.x, doc.y, { fit: [70, 70] })
                .moveDown()
                .rect(doc.x, doc.y, 410, 2.5)
                .fillAndStroke("black")
                .moveDown(2);
            doc
                .fontSize(11)
                .font("Helvetica")
                .text("Recycle Points", rightOptions)
                .moveDown(0.25);
            doc
                .font("Helvetica-Bold")
                .text(`Data For ${type}`, centerUnderlinedOptions)
                .font("Helvetica")
                .moveDown(2);
            table
                .setColumnsDefaults({
                headerBorder: "B",
                align: "right",
            })
                .addColumns(columns)
                .onPageAdded(function (tb) {
                tb.addHeader();
            });
            table.addBody(data);
            doc.moveDown(2);
            doc.end();
            return waitForEvent("end").then(() => {
                const pdfDataBuffer = Buffer.concat(buffers);
                fs.unlink(logoLocation, () => {
                });
                return pdfDataBuffer;
            });
        }
        catch (error) { }
    }
    generateBusterDataPdf(data) {
        const tableOptions = [
            {
                id: "S/N",
                width: 10,
                header: "S/N",
            },
            {
                id: "recycler",
                width: 10,
                header: "Recycler",
            },
            {
                id: "Date",
                width: 15,
                header: "Date",
            },
            {
                id: "PET",
                width: 10,
                header: "PET",
            },
            {
                id: "UBC",
                width: 10,
                header: "UBC",
            },
            {
                id: "PWS",
                width: 10,
                header: "PWS",
            },
            {
                id: "ONP",
                width: 10,
                header: "ONP",
            },
            {
                id: "BCC",
                width: 10,
                header: "BCC",
            },
            {
                id: "GBS",
                width: 10,
                header: "GBS",
            },
            {
                id: "points",
                width: 20,
                header: "Points",
            },
        ];
        const tableData = data.map((datum, i) => {
            return {
                "s/n": i + 1,
                recycler: `${datum.requestedBy.firstname} ${datum.requestedBy.lastname}`,
                date: datum.createdAt,
                PET: datum.items.PET,
                UBC: datum.items.UBC,
                BCC: datum.items.BCC,
                PWS: datum.items.PWS,
                ONP: datum.items.ONP,
                GBS: datum.items.GBS,
                points: datum.points,
            };
        });
        return this.generateDataPdf(tableOptions, tableData, "BUSTER");
    }
    generateBalerDataPdf(data) {
        const tableOptions = [
            {
                id: "s_n",
                width: 10,
                header: "S/N",
            },
            {
                id: "arrivalTime",
                width: 15,
                header: "Arrival Time",
            },
            {
                id: "weight",
                width: 10,
                header: "Weight",
            },
            {
                id: "pay",
                width: 10,
                header: "Pay",
            },
            {
                id: "type",
                width: 20,
                header: "Type",
            },
            {
                id: "baler",
                width: 20,
                header: "Baled By",
            },
            {
                id: "date",
                width: 20,
                header: "Date",
            },
        ];
        const first = data[0];
        if (first.items.PET)
            tableOptions.push({
                id: "PET",
                width: 10,
                header: "PET",
            });
        if (first.items.BCC)
            tableOptions.push({
                id: "BCC",
                width: 10,
                header: "BCC",
            });
        if (first.items.ONP)
            tableOptions.push({
                id: "ONP",
                width: 10,
                header: "ONP",
            });
        if (first.items.UBC)
            tableOptions.push({
                id: "UBC",
                width: 10,
                header: "UBC",
            });
        if (first.items.PWS)
            tableOptions.push({
                id: "PWS",
                width: 10,
                header: "PWS",
            });
        if (first.items.GBS)
            tableOptions.push({
                id: "GBS",
                width: 10,
                header: "GBS",
            });
        const tableData = data.map((datum, i) => {
            return {
                s_n: i + 1,
                arrivalTime: moment(datum.arrivalTime).format('hA'),
                PET: datum.items.PET,
                UBC: datum.items.UBC,
                BCC: datum.items.BCC,
                PWS: datum.items.PWS,
                ONP: datum.items.ONP,
                GBS: datum.items.GBS,
                pay: datum.user.pay,
                weight: datum.weight,
                baler: `${datum.user.firstname} ${datum.user.lastname}`,
                date: datum.createdAt,
                type: datum.type,
            };
        });
        return this.generateDataPdf(tableOptions, tableData, "BALER");
    }
    generateStaffDataPdf(data) {
        const tableOptions = [
            {
                id: "s_n",
                width: 10,
                header: "S/N",
            },
            {
                id: "arrivalTime",
                width: 15,
                header: "Arrival Time",
            },
            {
                id: "pay",
                width: 10,
                header: "Pay",
            },
            {
                id: "verified_by",
                width: 10,
                header: "Verified By",
            },
            {
                id: "date",
                width: 20,
                header: "Date",
            },
        ];
        const first = data[0];
        if (first.items.PET)
            tableOptions.push({
                id: "PET",
                width: 10,
                header: "PET",
            });
        if (first.items.BCC)
            tableOptions.push({
                id: "BCC",
                width: 10,
                header: "BCC",
            });
        if (first.items.ONP)
            tableOptions.push({
                id: "ONP",
                width: 10,
                header: "ONP",
            });
        if (first.items.UBC)
            tableOptions.push({
                id: "UBC",
                width: 10,
                header: "UBC",
            });
        if (first.items.PWS)
            tableOptions.push({
                id: "PWS",
                width: 10,
                header: "PWS",
            });
        if (first.items.GBS)
            tableOptions.push({
                id: "GBS",
                width: 10,
                header: "GBS",
            });
        const tableData = data.map((datum, i) => {
            return {
                s_n: i + 1,
                arrivalTime: moment(datum.arrivalTime).format('hA'),
                PET: datum.items.PET,
                UBC: datum.items.UBC,
                BCC: datum.items.BCC,
                PWS: datum.items.PWS,
                ONP: datum.items.ONP,
                GBS: datum.items.GBS,
                pay: datum.user.pay,
                weight: datum.weight,
                verified_by: `${datum.user.firstname} ${datum.user.lastname}`,
                date: datum.createdAt,
            };
        });
        return this.generateDataPdf(tableOptions, tableData, "STAFF");
    }
    generateSorterDataPdf(data) {
        const tableOptions = [
            {
                id: "s_n",
                width: 10,
                header: "S/N",
            },
            {
                id: "arrivalTime",
                width: 15,
                header: "Arrival Time",
            },
            {
                id: "weight",
                width: 10,
                header: "Weight",
            },
            {
                id: "pay",
                width: 10,
                header: "Pay",
            },
            {
                id: "sorted_by",
                width: 10,
                header: "Sorted By",
            },
            {
                id: "date",
                width: 20,
                header: "Date",
            },
        ];
        const first = data[0];
        if (first.items.PET)
            tableOptions.push({
                id: "PET",
                width: 10,
                header: "PET",
            });
        if (first.items.BCC)
            tableOptions.push({
                id: "BCC",
                width: 10,
                header: "BCC",
            });
        if (first.items.ONP)
            tableOptions.push({
                id: "ONP",
                width: 10,
                header: "ONP",
            });
        if (first.items.UBC)
            tableOptions.push({
                id: "UBC",
                width: 10,
                header: "UBC",
            });
        if (first.items.PWS)
            tableOptions.push({
                id: "PWS",
                width: 10,
                header: "PWS",
            });
        if (first.items.GBS)
            tableOptions.push({
                id: "GBS",
                width: 10,
                header: "GBS",
            });
        const tableData = data.map((datum, i) => {
            return {
                s_n: i + 1,
                arrivalTime: moment(datum.arrivalTime).format('hA'),
                PET: datum.items.PET,
                UBC: datum.items.UBC,
                BCC: datum.items.BCC,
                PWS: datum.items.PWS,
                ONP: datum.items.ONP,
                GBS: datum.items.GBS,
                pay: datum.user.pay,
                weight: datum.weight,
                sorted_by: `${datum.user.firstname} ${datum.user.lastname}`,
                date: datum.createdAt,
            };
        });
        return this.generateDataPdf(tableOptions, tableData, "SORTER");
    }
}
exports.PdfService = PdfService;
