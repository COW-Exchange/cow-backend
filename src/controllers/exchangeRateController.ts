import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

import {
  IExchangeRateResult,
  IExchangeRateResponse,
} from "../models/ExchangeRate";

const directoryPath = path.join(__dirname, "/../rates");

async function readRates(
  neededFiles: string[],
  fromCurrency: string,
  toCurrency: string,
  fromTime: string,
  toTime: string
): Promise<IExchangeRateResponse> {
  let rates: IExchangeRateResponse = [];
  const fromDate = new Date(fromTime);
  const toDate = new Date(toTime);
  neededFiles.map((fileName) => {
    JSON.parse(
      fs.readFileSync(path.join(directoryPath, `${fileName}.json`), "utf8")
    ).map((dayRate: IExchangeRateResult) => {
      //Should I filter here?
      const day = new Date(dayRate.time as string);
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
          date: dayRate.time,
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
  const neededFiles = [fromTime.slice(0, 4)];
  while (neededFiles[neededFiles.length - 1] !== toTime.slice(0, 4)) {
    neededFiles.push(
      (parseInt(neededFiles[neededFiles.length - 1]) + 1).toString()
    );
  }
  const rates = await readRates(
    neededFiles,
    fromCurrency,
    toCurrency,
    fromTime,
    toTime
  );
  if (rates) {
    res.status(200).json({ rates: rates });
  } else {
    res.status(404).json({ message: "invalid currency or timeframe" });
  }
};
