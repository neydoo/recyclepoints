import { Document, Schema, Model, model, Error } from "mongoose";
import { RedemptionItemM } from "./RedemptionItem";
export enum Status {
  Pending = "pending",
  Accepted = "accepted",
  Approved = "approved",
  Declined = "declined",
  Completed = "completed",
  Collected = "collected",
  Cancelled = "cancelled",
}
export interface RequestM extends Document {
  requestedBy: string;
  acceptedBy?: string;
  type: string;
  quantity: string;
  deliveryType: string;
  items?: RecycleItems;
  redemptionItems?: any[];
  redemptionId?: string;
  status: Status;
  points?: number;
  weight?: number;
  createdAt?: Date;
}

export type RecycleItems = {
  BCC?: number;
  PET?: number;
  UBC?: number;
  PWS?: number;
  ONP?: number;
  GBS?: number;
};

export const requestSchema: Schema = new Schema(
  {
    requestedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["recycle", "redemption"], required: true },
    items: { type: Schema.Types.Mixed },
    quantity: { type: Number },
    redemptionId: { type: String },
    deliveryType: { type: String, enum: ["home", "pickup"] },
    redemptionItems: { type: Schema.Types.Array },
    status: {
      type: String,
      enum: [
        "accepted",
        "pending",
        "completed",
        "collected",
        "cancelled",
        "approved",
        "declined",
      ],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Request: Model<RequestM> = model<RequestM>(
  "Request",
  requestSchema
);
