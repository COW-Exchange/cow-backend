import express from "express";
import cors from "cors";

import apiErrorHandler from "./middleware/apiErrorHandler";
import exchangeRateRoutes from "./routes/exchangeRate";
import userRoutes from "./routes/user";
import chatGptRoutes from "./routes/chatGptRoutes";
import { getUpdate } from "./services/exchangeRate";
import schedule from "node-schedule";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/exchange-rate", exchangeRateRoutes);
app.use("/users", userRoutes);
app.use("/chatgpt", chatGptRoutes);

// app.use(apiErrorHandler);

// getUpdate();

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(1, 5)];
rule.hour = 17;
rule.minute = 0;

const dailyUpdate = schedule.scheduleJob(rule, function () {
  console.log("db update run");
  getUpdate();
});

export default app;
