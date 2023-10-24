import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import path from "path";
import fs from "fs";

import {
  IExchangeRateResult,
  IExchangeRateUpdate,
} from "../models/ExchangeRate";

const dailyUrl = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const ninetyUrl =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
const historicUrl =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml";

const directoryPath = path.join(__dirname, "/../rates");

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

function returnLastFile(): any {
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
export async function writeFiles() {
  await getUpdate();
  Object.keys(update).forEach((year) => {
    if (jsLastDate.getFullYear() <= parseInt(year))
      fs.writeFileSync(
        path.join(directoryPath, `${year}.json`),
        JSON.stringify(update[year])
      );
  });
}
