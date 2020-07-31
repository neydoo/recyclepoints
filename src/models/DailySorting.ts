import { Document, Schema, Model, model, Error } from "mongoose";
import { RequestService } from "../service/RequestService";
import { RecycleItems } from './Request';

export interface DailySortingM extends Document {
  weight: number;
  points: number;
  arrivalTime: any;
  items: RecycleItems;
  user: string;
  isDeleted?: boolean;
  createdAt?: any;
}

export const dailySortingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    arrivalTime:{type: Schema.Types.Date, required:true},
    points: { type: Number, default: 0 },
    items: { type: Schema.Types.Mixed },
    weight: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DailySorting: Model<DailySortingM> = model<DailySortingM>(
  "DailySorting",
  dailySortingSchema
);
