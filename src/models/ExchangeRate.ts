import mongoose, { Document } from "mongoose";

export type ExchangeRates = {
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
};

export type ExchangeRateDaily = {
  date: Date;
  rates: ExchangeRates;
};

export type ExchangeRateUpdate = { [key: string]: ExchangeRateDaily[] };

export type ExchangeRateDocument = Document & {
  date: Date;
  rates: ExchangeRates;
};

export type ExchangeRateResponse = { date: Date; rate: number }[];

export const ExchangeRateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  rates: {
    type: {
      USD: Number,
      JPY: Number,
      BGN: Number,
      CZK: Number,
      DKK: Number,
      GBP: Number,
      HUF: Number,
      PLN: Number,
      RON: Number,
      SEK: Number,
      CHF: Number,
      ISK: Number,
      NOK: Number,
      HRK: Number,
      RUB: Number,
      TRY: Number,
      AUD: Number,
      BRL: Number,
      CAD: Number,
      CNY: Number,
      HKD: Number,
      IDR: Number,
      ILS: Number,
      INR: Number,
      KRW: Number,
      MXN: Number,
      MYR: Number,
      NZD: Number,
      PHP: Number,
      SGD: Number,
      THB: Number,
      ZAR: Number,
    },
    required: true,
  },
});

export default mongoose.model<ExchangeRateDocument>(
  "Exchangerate",
  ExchangeRateSchema
);
