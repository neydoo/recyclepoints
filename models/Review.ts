import { Document, Schema, Model, model, Error } from "mongoose";

export interface ReviewM extends Document {
  recycle: string;
  buster: string;
  rating: number;
  message: string;
}

export const reviewsSchema: Schema = new Schema(
  {
    recycle: { type: Schema.Types.ObjectId, ref: "Request" },
    buster: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    message: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Review: Model<ReviewM> = model<ReviewM>("Review", reviewsSchema);
