import express from "express";
import cors from "cors";

import apiErrorHandler from "./middleware/apiErrorHandler";
import exchangeRateRoutes from "./routes/exchangeRate";
import userRoutes from "./routes/user";
import chatGptRoutes from "./routes/chatGptRoutes";
import { getUpdate } from "./services/exchangeRate";
import schedule from "node-schedule";
import { sendNewsletter } from "./services/email";

const app = express();

app.use(express.json());
const NODE_ENV = process.env.NODE_ENV || "development";
if (NODE_ENV === "development") {
  const corsOptions = {
    origin: ["http://localhost:3000", "http://127.0.0.1"],
    credentials: true,
  };
  app.use(cors(corsOptions));
} else {
  const corsOptions = {
    origin: [
      "https://cowexchange.se",
      "https://www.cowexchange.se/",
      "https://cow-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
  };
  app.use(cors(corsOptions));
}

app.use("/exchange-rate", exchangeRateRoutes);
app.use("/users", userRoutes);
app.use("/chatgpt", chatGptRoutes);

// app.use(apiErrorHandler);

getUpdate();

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(1, 5)];
rule.hour = 17;
rule.minute = 0;

const dailyUpdate = schedule.scheduleJob(rule, function () {
  console.log("db update run");
  getUpdate();
  // sendNewsletter();
});
export default app;
