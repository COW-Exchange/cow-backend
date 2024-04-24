import { Request, Response } from "express";
import { getAllRatesInInterval } from "../services/exchangeRate";
import { CurrencyList } from "../models/ExchangeRate";

export const getIndex = (req: Request, res: Response) => {
  res.send("Currency Exchange API");
};

export const getRates = async (req: Request, res: Response) => {
  let { fromTime, toTime } = req.params;

  const rates = await getAllRatesInInterval(fromTime, toTime);
  if (rates) {
    res.status(200).json({ rates: rates });
  } else {
    res.status(404).json({ message: "invalid currency or dateframe" });
  }
};

export const getCurrencies = async (req: Request, res: Response) => {
  let currencies = [...CurrencyList, "EUR"].sort();
  res.status(200).json({ currencies: currencies });
};
