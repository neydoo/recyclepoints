"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRepository = void 0;
const mongoose = require("mongoose");
class AbstractRepository {
    constructor(model, schema = "") {
        this._model = mongoose.model(model, schema);
    }
    createNew(data) {
        return new Promise((resolve, reject) => {
            this._model
                .create(data)
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    updateData(id, data) {
        return new Promise((resolve, reject) => {
            this._model
                .findByIdAndUpdate(id, data, { new: true })
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    findAll() {
        return new Promise((resolve, reject) => {
            this._model
                .find({ deleted_at: null })
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    findAllDeleted() {
        return new Promise((resolve, reject) => {
            this._model
                .find({ deleted_at: { $ne: null } })
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    findAllWithDeleted() {
        return new Promise((resolve, reject) => {
            this._model
                .find()
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    findLimit(limit = 5, orderColumn = "_id", orderDir = "1") {
        return new Promise((resolve, reject) => {
            this._model
                .find({ deleted_at: null })
                .sort({ [orderColumn]: orderDir })
                .limit(limit)
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    findById(id) {
        return new Promise((resolve, reject) => {
            this._model
                .findById(id)
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    findBy(where, value) {
        return new Promise((resolve, reject) => {
            this._model
                .find({ [where]: value })
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    findByFirst(where, value) {
        return new Promise((resolve, reject) => {
            this._model
                .findOne({ [where]: value })
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    softDelete(id) {
        return new Promise((resolve, reject) => {
            this._model
                .findById(id)
                .then((res) => {
                res.deleted_at = new Date();
                res.save();
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    forceDelete(id) {
        return new Promise((resolve, reject) => {
            this._model
                .findOneAndRemove({ _id: id })
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    countAllDocuments() {
        return new Promise((resolve, reject) => {
            this._model
                .countDocuments()
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    countDocumentsWhere(where, value) {
        return new Promise((resolve, reject) => {
            this._model
                .countDocuments({ [where]: value })
                .then((res) => {
                resolve(res);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
}
exports.AbstractRepository = AbstractRepository;
