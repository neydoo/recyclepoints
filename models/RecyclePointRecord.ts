import { Document, Schema, Model, model, Error } from "mongoose";
import { text } from "body-parser";

export interface RecyclePointRecordM extends Document {
  parentId: string;
  type: string;
  previousAmount: number;
  amount: number;
  balance: number;
  transactionId: string;
  details: string;
}

export const recyclePointRecordSchema: Schema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "RecyclePoint",
      required: true,
    },
    type: { type: String, enum: ["deduction", "addition"], required: true },
    previousAmount: { type: Number, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    balance: { type: Number, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

export const RecyclePointRecord: Model<RecyclePointRecordM> = model<
  RecyclePointRecordM
>("RecyclePointRecord", recyclePointRecordSchema);
