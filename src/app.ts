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
let corsOptions = {};
if (NODE_ENV === "development") {
  corsOptions = {
    origin: ["http://localhost:3000", "http://127.0.0.1"],
    credentials: true,
  };
} else {
  corsOptions = {
    origin: (origin: string, callback: Function) => {
      if (
        [
          "https://cowexchange.se",
          "https://www.cowexchange.se",
          "https://cow-frontend.vercel.app",
        ].indexOf(origin) !== -1 ||
        !origin
      ) {
        callback(null, true); // Allow access
      } else {
        callback(new Error("Not allowed by CORS")); // Block access
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
  };
}
console.log("cors options:", corsOptions);
app.use(cors(corsOptions));

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
