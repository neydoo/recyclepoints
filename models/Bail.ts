import { Document, Schema, Model, model, Error } from "mongoose";
import { RequestService } from "../service/RequestService";

export interface BailM extends Document {
  balance: number;
  isDeleted: boolean;
  user: string;
}

export const dailySortingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    sorts: { type: Number, default: 0 },
    items: { type: Schema.Types.Mixed },
    arrivalTime: { type: Date, default: Date.now() },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

dailySortingSchema.methods.points = async function (): Promise<number> {
  return await RequestService.prototype.calculatePoints(this.items);
};

export const Bail: Model<BailM> = model<BailM>(
  "Bail",
  dailySortingSchema
);
