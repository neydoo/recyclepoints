import { Document, Schema, Model, model, Error } from "mongoose";

export interface RecycleItemM extends Document {
  name: string;
  recyclePoints: number;
}

export const recycleItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    recyclePoints: { type: Number, required: true, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RecycleItem: Model<RecycleItemM> = model<RecycleItemM>(
  "RecycleItem",
  recycleItemSchema
);
