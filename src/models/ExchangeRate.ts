import mongoose, { Document } from "mongoose";

export type IExchangeRates = {
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

export type IExchangeRateResult = {
  time: string;
  rates: IExchangeRates;
};

export type IExchangeRateUpdate = { [key: string]: IExchangeRateResult[] };

export type IExchangeRateResponse = { date: string; rate: number }[];
