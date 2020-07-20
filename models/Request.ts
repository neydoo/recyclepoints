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
  redemptionItem?: string | RedemptionItemM;
  status: Status;
  points?: number;
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
    deliveryType: { type: String, enum: ["home", "pickup"] },
    redemptionItem: { type: Schema.Types.ObjectId, ref: "RedemptionItem" },
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
      isDeleted: { type: Boolean, default: false },
    },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Request: Model<RequestM> = model<RequestM>(
  "Request",
  requestSchema
);
