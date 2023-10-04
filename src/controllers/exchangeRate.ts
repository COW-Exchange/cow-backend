import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import { IExchangeRateResult } from "../models/ExchangeRate";
import exchangeServices from "../services/exchangeRate";

export const getIndex = (req: Request, res: Response) => {
  res.send("Currency Exchange API");
};

export const getRate = (req: Request, res: Response) => {
  const { fromCurrency, toCurrency, fromTime, toTime } = req.params;
  //this is not done
  const neededFiles = fromCurrency.slice(0, 4);
  const rate: IExchangeRateResult[] = JSON.parse(
    fs.readFileSync(
      path.join(
        exchangeServices.directoryPath,
        `${exchangeServices.returnLastFile()}.json`
      ),
      {
        encoding: "utf8",
        flag: "r",
      }
    )
  );

  if (rate) {
    res.json({ rate });
  } else {
    res.status(404).json({ message: "invalid currency or timeframe" });
  }
};
