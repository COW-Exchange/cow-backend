// import mongoose, { Document, Schema } from "mongoose";

// interface IExchangeRate extends Document {}

// const ExchangeRateSchema: Schema = new Schema({});

// export default mongoose.model<IExchangeRate>(
//   "ExchangeRate",
//   ExchangeRateSchema
// );

export interface IExchangeRates {
  USD: number;
  JPY: number;
  BGN: number;
  CZK: number;
  DKK: number;
  GBP: number;
  HUF: number;
  PLN: number;
  RON: number;
  SEK: number;
  CHF: number;
  ISK: number;
  NOK: number;
  HRK: number;
  RUB: number;
  TRY: number;
  AUD: number;
  BRL: number;
  CAD: number;
  CNY: number;
  HKD: number;
  IDR: number;
  ILS: number;
  INR: number;
  KRW: number;
  MXN: number;
  MYR: number;
  NZD: number;
  PHP: number;
  SGD: number;
  THB: number;
  ZAR: number;
}

export interface IExchangeRateResult {
  date: string;
  rates: IExchangeRates;
}
