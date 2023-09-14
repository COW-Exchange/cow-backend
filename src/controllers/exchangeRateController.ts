import { Request, Response } from "express";

export const getIndex = (req: Request, res: Response) => {
  res.send("Currency Exchange API");
};

export const getRate = (req: Request, res: Response) => {
  const { fromCurrency, toCurrency } = req.params;

  const mockRates: any = {
    USD: {
      EUR: 0.85,
      GBP: 0.75,
    },
    EUR: {
      USD: 1.18,
      GBP: 0.9,
    },
  };

  const rate = mockRates[fromCurrency] && mockRates[fromCurrency][toCurrency];

  if (rate) {
    res.json({ from: fromCurrency, to: toCurrency, rate });
  } else {
    res
      .status(404)
      .json({ message: "Conversion rate not found for given currencies" });
  }
};
