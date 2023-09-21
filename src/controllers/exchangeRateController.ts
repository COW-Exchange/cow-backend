import { Request, Response } from "express";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { IExchangeRateResult } from "../models/ExchangeRate";
import schedule from "node-schedule";
const path = require("path");
const fs = require("fs");
const directoryPath = path.join(__dirname, "/../rates");

const dailyUrl = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const ninetyUrl =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
const historicUrl =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml";

//Functions from ecb-euro-exchange-rates
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

export function parse(string: string): IExchangeRateResult[] {
  const data = new XMLParser({
    ignoreAttributes: false,
    isArray: () => true,
  }).parse(string);
  const result: IExchangeRateResult[] = [];
  const entries = data["gesmes:Envelope"][0]["Cube"][0]["Cube"];
  if (typeof entries !== "object") {
    throw new Error("Result data does not have the expected structure");
  }

  for (const current of entries) {
    const time: string = current?.["@_time"]?.[0];
    assertString(time, "time");
    const rates = {} as any;
    for (const item of current["Cube"]) {
      const currency = item["@_currency"]?.[0];
      assertString(currency, "curency");
      const rateString = item["@_rate"]?.[0];
      assertString(rateString, "rate");
      const rate = parseFloat(rateString);
      rates[currency] = rate;
    }

    result.push({ time, rates });
  }

  return result;
}
async function fetch(): Promise<IExchangeRateResult> {
  const result = await get(dailyUrl);
  const rates = parse(result);
  if (rates.length !== 1) {
    throw new Error(
      `Expected result to contain one single entry, but got ${rates.length}`
    );
  }
  return rates[0];
}

async function fetchHistoric90d(): Promise<IExchangeRateResult[]> {
  return parse(await get(ninetyUrl));
}

async function fetchHistoric(): Promise<IExchangeRateResult[]> {
  return parse(await get(historicUrl));
}
//My file functions
function returnLastFile() {
  let files = fs.readdirSync(directoryPath);
  if (files.length > 0) {
    return files[files.length - 1].replace(".json", "");
  }
}
function returnLastDate() {
  let lastDate: string | null = null;
  if (returnLastFile()) {
    const lastFileContent = JSON.parse(
      fs.readFileSync(path.join(directoryPath, `${returnLastFile()}.json`), {
        encoding: "utf8",
        flag: "r",
      })
    );
    lastDate = lastFileContent[lastFileContent.length - 1].date;
    return lastDate;
  }
}

const msInDay: number = 1000 * 60 * 60 * 24;
const present_date = new Date();
let daysBehind: number | null = null;
let jsLastDate = new Date("1900-01-01" as string);
if (returnLastDate()) {
  jsLastDate = new Date(returnLastDate() as string);
  daysBehind = Math.round(
    (present_date.getTime() - jsLastDate.getTime()) / msInDay
  );
}

if (daysBehind && daysBehind === 1) {
  console.log(daysBehind, "days behind, running current day method");
  fetch();
  console.log("rates update finished");
} else if (daysBehind && daysBehind < 90) {
  console.log(daysBehind, "days behind, running 90 day method");
  fetchHistoric90d().then((result) =>
    result.reverse().map((dayRate) => {
      const day = new Date(dayRate.time as string);
      if (day.getTime() > jsLastDate.getTime()) {
        fs.appendFileSync(
          path.join(directoryPath, `${dayRate.time.slice(0, 4)}.json`),
          JSON.stringify(dayRate)
        );
      }
    })
  );
  console.log("rates update finished");
} else if ((daysBehind && daysBehind >= 90) || daysBehind === null) {
  console.log(daysBehind, "days behind, running historic method");
  fetchHistoric().then((result) =>
    result.reverse().map((dayRate) => {
      const day = new Date(dayRate.time as string);
      if (
        day.getTime() > jsLastDate.getTime() ||
        jsLastDate.getFullYear === day.getFullYear
      ) {
        //here I will need to read the json and append to it then write the file
        // fs.appendFileSync(
        //   path.join(directoryPath, `${dayRate.time.slice(0, 4)}.json`),
        //   JSON.stringify(dayRate)
        // );
      } else if (day.getTime() > jsLastDate.getTime()) {
        //here I'm creating a new file from scratch
      }
    })
  );
}

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(1, 5)];
rule.hour = 17;
rule.minute = 0;

const dailyUpdate = schedule.scheduleJob(rule, function () {
  console.log("db update run");
});
export const getIndex = (req: Request, res: Response) => {
  res.send("Currency Exchange API");
};

export const getRate = (req: Request, res: Response) => {
  const { fromCurrency, toCurrency, time } = req.params;
  let rate = {};

  if (rate) {
    res.json({ rate });
  } else {
    res.status(404).json({ message: "invalid currency or timeframe" });
  }
};
