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
  resolvedBy?: string;
  type: string;
  deliveryType: string;
  items?: RecycleItems;
  redemptionItems?: any[];
  redemptionId?: string;
  status: Status;
  points?: number;
  weight?: number;
  createdAt?: Date;
  meta: any;
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
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["recycle", "redemption"], required: true },
    items: { type: Schema.Types.Mixed },
    redemptionId: { type: String },
    deliveryType: { type: String, enum: ["home", "pickup"] },
    redemptionItems: [{
      id: { type: Schema.Types.ObjectId, ref: "RedemptionItem"  },
      quantity: { type: String }
    }],
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
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Request: Model<RequestM> = model<RequestM>(
  "Request",
  requestSchema
);
