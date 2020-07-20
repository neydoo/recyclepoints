import { Document, Schema, Model, model, Error } from "mongoose";

export interface RedemptionItemM extends Document {
  name: string;
  recyclePoints: string;
  image: any;
}

export const redemptionItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    recyclePoints: { type: Number, required: true, default: 0 },
    image: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RedemptionItem: Model<RedemptionItemM> = model<RedemptionItemM>(
  "RedemptionItem",
  redemptionItemSchema
);
