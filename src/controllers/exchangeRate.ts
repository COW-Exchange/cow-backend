import { Request, Response } from "express";
import fs from "fs";
import path from "path";

import {
  ExchangeRateDaily,
  ExchangeRateResponse,
} from "../models/ExchangeRate";

const directoryPath = path.join(__dirname, "/../rates");

async function readRates(
  fromCurrency: string,
  toCurrency: string,
  fromTime: string,
  toTime: string
): Promise<ExchangeRateResponse> {
  const neededYears = [fromTime.slice(0, 4)];
  while (neededYears[neededYears.length - 1] !== toTime.slice(0, 4)) {
    neededYears.push(
      (parseInt(neededYears[neededYears.length - 1]) + 1).toString()
    );
  }
  let rates: ExchangeRateResponse = [];
  const fromDate = new Date(fromTime);
  const toDate = new Date(toTime);
  neededYears.map((year) => {
    JSON.parse(
      fs.readFileSync(path.join(directoryPath, `${year}.json`), "utf8")
    ).map((dayRate: ExchangeRateDaily) => {
      const day = dayRate.date;
      if (
        day.getTime() >= fromDate.getTime() &&
        day.getTime() <= toDate.getTime()
      ) {
        let rate = 0;
        if (fromCurrency === "EUR") {
          rate = dayRate.rates[toCurrency as keyof typeof dayRate.rates] / 1;
        } else if (toCurrency === "EUR") {
          rate = 1 / dayRate.rates[fromCurrency as keyof typeof dayRate.rates];
        } else {
          rate =
            dayRate.rates[toCurrency as keyof typeof dayRate.rates] /
            dayRate.rates[fromCurrency as keyof typeof dayRate.rates];
        }
        rates.push({
          date: day,
          rate: rate,
        });
      }
    });
  });
  return rates;
}

export const getIndex = (req: Request, res: Response) => {
  res.send("Currency Exchange API");
};

export const getRate = async (req: Request, res: Response) => {
  let { fromCurrency, toCurrency, fromTime, toTime } = req.params;

  const rates = await readRates(fromCurrency, toCurrency, fromTime, toTime);
  if (rates) {
    res.status(200).json({ rates: rates });
  } else {
    res.status(404).json({ message: "invalid currency or dateframe" });
  }
};
