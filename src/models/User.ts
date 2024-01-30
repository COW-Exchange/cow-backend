import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { convertDate } from "../utils/functions";

interface IUserMethods {
  isValidPassword(password: string): Promise<boolean>;
}

interface IUser extends Document, IUserMethods {
  email: string;
  password: string;
  selectedCurrencies: Array<string>;
  baseCurrency: string;
  timeFrame: { from: string; to: string };
  ownCurrencies: {
    USD: boolean;
    JPY: boolean;
    BGN: boolean;
    CZK: boolean;
    DKK: boolean;
    GBP: boolean;
    HUF: boolean;
    PLN: boolean;
    RON: boolean;
    SEK: boolean;
    CHF: boolean;
    ISK: boolean;
    NOK: boolean;
    HRK: boolean;
    RUB: boolean;
    TRY: boolean;
    AUD: boolean;
    BRL: boolean;
    CAD: boolean;
    CNY: boolean;
    HKD: boolean;
    IDR: boolean;
    ILS: boolean;
    INR: boolean;
    KRW: boolean;
    MXN: boolean;
    MYR: boolean;
    NZD: boolean;
    PHP: boolean;
    SGD: boolean;
    THB: boolean;
    ZAR: boolean;
  };
  resetToken?: string;
  resetTokenExpiration?: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  selectedCurrencies: {
    type: [String],
    default: [],
  },
  baseCurrency: { type: String, default: "EUR" },
  timeFrame: {
    type: { from: String, to: String },
    default: {
      from: convertDate(
        new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
      ),
      to: convertDate(new Date()),
    },
  },
  ownCurrencies: {
    type: {
      USD: Boolean,
      JPY: Boolean,
      BGN: Boolean,
      CZK: Boolean,
      DKK: Boolean,
      GBP: Boolean,
      HUF: Boolean,
      PLN: Boolean,
      RON: Boolean,
      SEK: Boolean,
      CHF: Boolean,
      ISK: Boolean,
      NOK: Boolean,
      HRK: Boolean,
      RUB: Boolean,
      TRY: Boolean,
      AUD: Boolean,
      BRL: Boolean,
      CAD: Boolean,
      CNY: Boolean,
      HKD: Boolean,
      IDR: Boolean,
      ILS: Boolean,
      INR: Boolean,
      KRW: Boolean,
      MXN: Boolean,
      MYR: Boolean,
      NZD: Boolean,
      PHP: Boolean,
      SGD: Boolean,
      THB: Boolean,
      ZAR: Boolean,
    },
    default: {
      USD: false,
      JPY: false,
      BGN: false,
      CZK: false,
      DKK: false,
      GBP: false,
      HUF: false,
      PLN: false,
      RON: false,
      SEK: false,
      CHF: false,
      ISK: false,
      NOK: false,
      HRK: false,
      RUB: false,
      TRY: false,
      AUD: false,
      BRL: false,
      CAD: false,
      CNY: false,
      HKD: false,
      IDR: false,
      ILS: false,
      INR: false,
      KRW: false,
      MXN: false,
      MYR: false,
      NZD: false,
      PHP: false,
      SGD: false,
      THB: false,
      ZAR: false,
    },
  },

  resetToken: {
    type: String,
  },
  resetTokenExpiration: {
    type: Date,
  },
});

UserSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
