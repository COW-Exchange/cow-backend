import { Request, Response } from "express";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import schedule from "node-schedule";
const path = require("path");
const fs = require("fs");
const directoryPath = path.join(__dirname, "/../rates");

function returnLastFile() {
  let files = fs.readdirSync(directoryPath);
  return files[files.length - 1].replace(".txt", "");
}
function returnLastDate() {
  let lastDate: string | null = null;
  const lastFileContent = JSON.parse(
    fs.readFileSync(path.join(directoryPath, `${returnLastFile()}.txt`), {
      encoding: "utf8",
      flag: "r",
    })
  );
  lastDate = lastFileContent[lastFileContent.length - 1].date;
  return lastDate;
}
const msInDay: number = 1000 * 60 * 60 * 24;
const present_date = new Date();
let daysBehind: number | null = null;
if (returnLastDate()) {
  const jsLastDate = new Date(returnLastDate() as string);
  daysBehind = (present_date.getTime() - jsLastDate.getTime()) / msInDay;
} else {
  console.log("full db build");
}
if ((daysBehind = 1)) {
  console.log("current day method");
} else if (daysBehind < 90) {
  console.log("90 day method");
} else if (daysBehind >= 90) {
  console.log("historic method");
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
