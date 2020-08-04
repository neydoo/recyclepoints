import { Document, Schema, Model, model, Error } from "mongoose";
import * as bcrypt from "bcrypt-nodejs";
import { UtilService } from "../service/UtilService";

export enum Designation {
  Buster = "buster",
  Sorter = "sorter",
  Admin = "admin",
  Dev = "dev",
  Operator = "operator",
  Staff = "verification-staff",
  Client = "client",
}
export interface IUserM extends Document {
  firstName: string;
  lastName: string;
  address: string;
  email?: string;
  phone: string;
  password?: string;
  profileImage?: string;
  pay?: number;
  designation?: Designation;
  cloudImage?: string;
  country?: string;
  state?: string;
  landmark?: string;
  ageRange?: string;
  lga?: string;
  otp: string;
  firstTimeLogin: boolean;
  disabled: boolean;
  unverified: boolean;
  active: boolean;
  isDeleted: boolean;
  notificationTokens?: string[];
  fullName(): string;
  comparePassword(candidatePassword: string): boolean;
  compareOtp(candidatePassword: string): boolean;
}

export const userSchema: Schema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    otp: { type: String, select: false },
    phone: { type: String, unique: true },
    password: { type: String, select: false },
    notificationTokens: [
      {
        type: String,
        select: false,
      },
    ],
    pay: { type: Number, default: 0 },
    target: { type: String },
    country: { type: String },
    state: { type: String },
    lga: { type: String },
    ageRange: { type: String },
    landmark: { type: String },
    targetType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    designation: {
      type: String,
      enum: [
        "buster",
        "admin",
        "dev",
        "sorter",
        "operator",
        "verification-staff",
        "client",
      ],
    },
    profileImage: { type: String, default: null },
    cloudImage: { type: String, default: null },
    isDeleted: { type: Boolean, required: true, default: false },
    disabled: { type: Boolean, required: true, default: false },
    unverified: { type: Boolean, required: true, default: false },
    active: { type: Boolean, required: true, default: true },
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
userSchema.methods.compareOtp = function (candidatePassword: string) {
  return this.otp ? bcrypt.compareSync(candidatePassword, this.otp) : false;
};

userSchema.methods.fullName = function (): string {
  return this.firstName.trim() + " " + this.lastName.trim();
};

userSchema.pre("save", async function (next) {
  const data = this as IUserM;
  data.phone = UtilService.formatPhone(data.phone);
  next();
});

export const User: Model<IUserM> = model<IUserM>("User", userSchema);
