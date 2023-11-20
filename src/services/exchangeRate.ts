import axios from "axios";
import { XMLParser } from "fast-xml-parser";

import ExchangeRate, {
  ExchangeRateDocument,
  ExchangeRates,
} from "../models/ExchangeRate";

import { ExchangeRateDaily } from "../models/ExchangeRate";

const dailyUrl = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const ninetyUrl =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
const historicUrl =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml";

async function get(url: string): Promise<string> {
  const result = await axios.get<string>(url);
  return result.data;
}

function assertString(
  value: unknown,
  valueName: string
): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected ${valueName} to be a string`);
  }
}

function parse(string: string): ExchangeRateDaily[] {
  const data = new XMLParser({
    ignoreAttributes: false,
    isArray: () => true,
  }).parse(string);
  const result: ExchangeRateDaily[] = [];
  const entries = data["gesmes:Envelope"][0]["Cube"][0]["Cube"];
  if (typeof entries !== "object") {
    throw new Error("Result data does not have the expected structure");
  }

  for (const current of entries) {
    const date = current?.["@_time"]?.[0];
    assertString(date, "date");
    let rates: ExchangeRates = {
      USD: 0,
      JPY: 0,
      BGN: 0,
      CZK: 0,
      DKK: 0,
      GBP: 0,
      HUF: 0,
      PLN: 0,
      RON: 0,
      SEK: 0,
      CHF: 0,
      ISK: 0,
      NOK: 0,
      HRK: 0,
      RUB: 0,
      TRY: 0,
      AUD: 0,
      BRL: 0,
      CAD: 0,
      CNY: 0,
      HKD: 0,
      IDR: 0,
      ILS: 0,
      INR: 0,
      KRW: 0,
      MXN: 0,
      MYR: 0,
      NZD: 0,
      PHP: 0,
      SGD: 0,
      THB: 0,
      ZAR: 0,
    };
    for (const item of current["Cube"]) {
      const currency = item["@_currency"]?.[0];
      assertString(currency, "currency");
      const rateString = item["@_rate"]?.[0];
      assertString(rateString, "rate");
      const rate = parseFloat(rateString);
      rates[currency as keyof ExchangeRates] = rate;
    }

    result.push({ date: new Date(date), rates: rates });
  }

  return result;
}
async function fetch(): Promise<ExchangeRateDaily> {
  const result = await get(dailyUrl);
  const rates = parse(result);
  if (rates.length !== 1) {
    throw new Error(
      `Expected result to contain one single entry, but got ${rates.length}`
    );
  }
  return rates[0];
}

async function fetchHistoric90d(): Promise<ExchangeRateDaily[]> {
  return parse(await get(ninetyUrl));
}

async function fetchHistoric(): Promise<ExchangeRateDaily[]> {
  return parse(await get(historicUrl));
}

const msInDay: number = 1000 * 60 * 60 * 24;
const present_date = new Date();
let daysBehind: number | null = null;

export async function getUpdate() {
  await getLastDate().then(
    (date) =>
      (daysBehind = Math.floor(
        (present_date.getTime() - date.getTime()) / msInDay
      ))
  );

  if (daysBehind && daysBehind === 1) {
    console.log(daysBehind, "days behind, running current day method");
    await fetch().then((dayRate) => {
      addRate(new ExchangeRate(dayRate));
    });
  } else if (daysBehind && daysBehind < 90) {
    console.log(daysBehind, "days behind, running 90 day method");
    await fetchHistoric90d().then((result) =>
      result.reverse().map((dayRate) => {
        addRate(new ExchangeRate(dayRate));
      })
    );
  } else if ((daysBehind && daysBehind >= 90) || daysBehind === null) {
    console.log(daysBehind, "days behind, running historic method");
    await fetchHistoric().then((result) =>
      result.reverse().map((dayRate) => {
        addRate(new ExchangeRate(dayRate));
      })
    );
  }
}

export const addRate = async (
  rate: ExchangeRateDocument
): Promise<ExchangeRateDocument> => {
  return await rate.save();
};

export const getLastDate = async (): Promise<Date> => {
  let date: Date = new Date("1900-01-01");

  try {
    const lastRate = await ExchangeRate.find().sort({ date: -1 }).limit(1);
    if ("date" in lastRate) {
      if (lastRate.date instanceof Date) {
        date = lastRate.date;
      }
    }
  } catch (error) {}

  return date;
};
