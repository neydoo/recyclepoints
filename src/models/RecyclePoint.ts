import { Document, Schema, Model, model, Error } from "mongoose";

export interface RecyclePointM extends Document {
  balance?: number;
  user: string;
}

export const recyclePointSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    balance: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RecyclePoint: Model<RecyclePointM> = model<RecyclePointM>(
  "RecyclePoint",
  recyclePointSchema
);
