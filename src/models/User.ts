import mongoose, { Document, Schema } from "mongoose";

export const UserCurrencies = [
  "USD",
  "JPY",
  "BGN",
  "CZK",
  "DKK",
  "GBP",
  "HUF",
  "PLN",
  "RON",
  "SEK",
  "CHF",
  "ISK",
  "NOK",
  "HRK",
  "RUB",
  "TRY",
  "AUD",
  "BRL",
  "CAD",
  "CNY",
  "HKD",
  "IDR",
  "ILS",
  "INR",
  "KRW",
  "MXN",
  "MYR",
  "NZD",
  "PHP",
  "SGD",
  "THB",
  "ZAR",
  "EUR", //this differs from the ExchangeRate model
];

let currencies: { [key: string]: boolean } = {};
UserCurrencies.forEach((currency) => {
  currencies[currency] = false;
});
type Currencies = typeof currencies;

// interface Currencies {
//   USD: boolean;
//   JPY: boolean;
//   BGN: boolean;
//   CZK: boolean;
//   DKK: boolean;
//   GBP: boolean;
//   HUF: boolean;
//   PLN: boolean;
//   RON: boolean;
//   SEK: boolean;
//   CHF: boolean;
//   ISK: boolean;
//   NOK: boolean;
//   HRK: boolean;
//   RUB: boolean;
//   TRY: boolean;
//   AUD: boolean;
//   BRL: boolean;
//   CAD: boolean;
//   CNY: boolean;
//   HKD: boolean;
//   IDR: boolean;
//   ILS: boolean;
//   INR: boolean;
//   KRW: boolean;
//   MXN: boolean;
//   MYR: boolean;
//   NZD: boolean;
//   PHP: boolean;
//   SGD: boolean;
//   THB: boolean;
//   ZAR: boolean;
// }

const CurrencySchema: { [key: string]: BooleanConstructor } = {};
UserCurrencies.forEach((currency) => {
  CurrencySchema[currency] = Boolean;
});

// const CurrencySchema = {
//   USD: Boolean,
//   JPY: Boolean,
//   BGN: Boolean,
//   CZK: Boolean,
//   DKK: Boolean,
//   GBP: Boolean,
//   HUF: Boolean,
//   PLN: Boolean,
//   RON: Boolean,
//   SEK: Boolean,
//   CHF: Boolean,
//   ISK: Boolean,
//   NOK: Boolean,
//   HRK: Boolean,
//   RUB: Boolean,
//   TRY: Boolean,
//   AUD: Boolean,
//   BRL: Boolean,
//   CAD: Boolean,
//   CNY: Boolean,
//   HKD: Boolean,
//   IDR: Boolean,
//   ILS: Boolean,
//   INR: Boolean,
//   KRW: Boolean,
//   MXN: Boolean,
//   MYR: Boolean,
//   NZD: Boolean,
//   PHP: Boolean,
//   SGD: Boolean,
//   THB: Boolean,
//   ZAR: Boolean,
// };

const CurrencyDefault: { [key: string]: boolean } = {};
UserCurrencies.forEach((currency) => {
  CurrencyDefault[currency] = false;
});
// const CurrencyDefault = {
//   USD: false,
//   JPY: false,
//   BGN: false,
//   CZK: false,
//   DKK: false,
//   GBP: false,
//   HUF: false,
//   PLN: false,
//   RON: false,
//   SEK: false,
//   CHF: false,
//   ISK: false,
//   NOK: false,
//   HRK: false,
//   RUB: false,
//   TRY: false,
//   AUD: false,
//   BRL: false,
//   CAD: false,
//   CNY: false,
//   HKD: false,
//   IDR: false,
//   ILS: false,
//   INR: false,
//   KRW: false,
//   MXN: false,
//   MYR: false,
//   NZD: false,
//   PHP: false,
//   SGD: false,
//   THB: false,
//   ZAR: false,
// };
export interface UserInterface {
  id: string;
  email: { text: string; iv: Buffer };
  password: string;
  selectedCurrencies: Currencies;
  ownCurrencies: Currencies;
  baseCurrency: keyof Currencies;
  timeFrame: number;
  resetToken?: string;
  resetTokenExpiration?: Date;
}
export type UserDocument = Document & UserInterface;

const UserSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: { text: String, iv: Buffer },
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  selectedCurrencies: {
    type: CurrencySchema,
    default: CurrencyDefault,
  },
  ownCurrencies: {
    type: CurrencySchema,
    default: CurrencyDefault,
  },
  baseCurrency: { type: String, default: "EUR" },
  timeFrame: {
    type: Number,
    default: 7,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiration: {
    type: Date,
  },
});

export default mongoose.model<UserDocument>("User", UserSchema);
