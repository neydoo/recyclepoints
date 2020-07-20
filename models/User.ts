import { Document, Schema, Model, model, Error } from "mongoose";
import * as bcrypt from "bcrypt-nodejs";

enum Designation {
  Buster = "buster",
  Sorter = "sorter",
  Admin = "admin",
  Dev = "dev",
  Operator = "operator",
  Staff = "staff",
  Client = "client",
}
export interface IUserM extends Document {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
  password?: string;
  profileImage?: string;
  pay?: number;
  designation: Designation;
  cloudImage?: string;
  firstTimeLogin: boolean;
  isDeleted: boolean;
  otp?: string;
  fullName(): string;
  comparePassword(candidatePassword: string): boolean;
}

export const userSchema: Schema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    otp: { type: String },
    email: {
      type: String,
      lowercase: true,
      required: true,
      validate: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      index: { unique: true },
    },
    phone: { type: String, unique: true },
    password: { type: String, select: false },
    pay: { type: String },
    target: { type: String },
    targetType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    designation: {
      type: String,
      enum: ["buster", "admin", "dev", "sorter", "operator", "staff", "client"],
    },
    profileImage: { type: String, default: null },
    cloudImage: { type: String, default: null },
    isDeleted: { type: Boolean, required: true, default: false },
    deletedAt: { type: String, default: null },
    firstTimeLogin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// userSchema.pre<IUserM>("save", function save(next) {
//     const user = this;
//     const hash = bcrypt.hashSync(this.password);
//     user.password = hash;
//     next();
// });

userSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

userSchema.methods.fullName = function (): string {
  return this.firstName.trim() + " " + this.lastName.trim();
};

export const User: Model<IUserM> = model<IUserM>("User", userSchema);
