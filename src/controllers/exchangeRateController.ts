import { Request, Response } from "express";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import {
  IExchangeRateResult,
  IExchangeRateUpdate,
  IExchangeRateResponse,
} from "../models/ExchangeRate";
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

function parse(string: string): IExchangeRateResult[] {
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
    lastDate = lastFileContent[lastFileContent.length - 1].time;
    return lastDate;
  }
}

const msInDay: number = 1000 * 60 * 60 * 24;
const present_date = new Date();
let daysBehind: number | null = null;
let jsLastDate = new Date("1900-01-01" as string);
let update: Partial<IExchangeRateUpdate> = {};

function pushDayRate(dayRate: IExchangeRateResult) {
  const day = new Date(dayRate.time as string);
  if (day.getTime() > jsLastDate.getTime()) {
    (update[dayRate.time.slice(0, 4)] =
      update[dayRate.time.slice(0, 4)] || []).push(dayRate);
    //The || operator in JavaScript does not return a boolean value.
    //If the left hand side is truthy, it returns the left hand side, otherwise it returns the right hand side.
    //fun - this way you can create the array and push to it even if it does not exist
  }
}

async function getUpdate() {
  if (returnLastDate()) {
    jsLastDate = new Date(returnLastDate() as string);
    daysBehind = Math.floor(
      (present_date.getTime() - jsLastDate.getTime()) / msInDay
    );
    update[returnLastFile()] = JSON.parse(
      fs.readFileSync(path.join(directoryPath, `${returnLastFile()}.json`), {
        encoding: "utf8",
        flag: "r",
      })
    );
  }
  if (daysBehind && daysBehind === 1) {
    console.log(daysBehind, "days behind, running current day method");
    await fetch().then((dayRate) => {
      pushDayRate(dayRate);
    });
  } else if (daysBehind && daysBehind < 90) {
    console.log(daysBehind, "days behind, running 90 day method");
    await fetchHistoric90d().then((result) =>
      result.reverse().map((dayRate) => {
        pushDayRate(dayRate);
      })
    );
  } else if ((daysBehind && daysBehind >= 90) || daysBehind === null) {
    console.log(daysBehind, "days behind, running historic method");
    await fetchHistoric().then((result) =>
      result.reverse().map((dayRate) => {
        pushDayRate(dayRate);
      })
    );
  }
}
async function writeFiles() {
  await getUpdate();
  Object.keys(update).forEach((year) => {
    if (jsLastDate.getFullYear() <= parseInt(year))
      fs.writeFileSync(
        path.join(directoryPath, `${year}.json`),
        JSON.stringify(update[year])
      );
  });
}
writeFiles();

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(1, 5)];
rule.hour = 17;
rule.minute = 0;

const dailyUpdate = schedule.scheduleJob(rule, function () {
  console.log("db update run");
  writeFiles();
});

export const getIndex = (req: Request, res: Response) => {
  res.send("Currency Exchange API");
};

export const getRate = (req: Request, res: Response) => {
  let { fromCurrency, toCurrency, fromTime, toTime } = req.params;
  const neededFiles = [fromTime.slice(0, 4)];
  while (neededFiles[neededFiles.length - 1] !== toTime.slice(0, 4)) {
    neededFiles.push(
      (parseInt(neededFiles[neededFiles.length - 1]) + 1).toString()
    );
  }
  let rates: IExchangeRateResponse = [];

  neededFiles.map((fileName) => {
    fs.readFile(
      `${fileName}.json`,
      (err: any, res: Promise<IExchangeRateResult[]>) => {
        res.then((result) =>
          result.map((dayRate) => {
            const day = new Date(dayRate.time as string);
            let fromDate = new Date(fromTime);
            let toDate = new Date(toTime);
            if (
              day.getTime() >= fromDate.getTime() &&
              day.getTime() <= toDate.getTime()
            ) {
              let rate = 0;
              if (fromCurrency === "EUR") {
                rate =
                  dayRate.rates[toCurrency as keyof typeof dayRate.rates] / 1;
              } else if (toCurrency === "EUR") {
                rate =
                  1 / dayRate.rates[fromCurrency as keyof typeof dayRate.rates];
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
          })
        );
        if (err instanceof Error) {
          console.log(err);
        }
      }
    );
  });

  if (rates) {
    res.status(200).json({ rates: rates });
  } else {
    res.status(404).json({ message: "invalid currency or timeframe" });
  }
};
