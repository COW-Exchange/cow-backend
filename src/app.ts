import express from "express";
import cors from "cors";

import apiErrorHandler from "./middleware/apiErrorHandler";
import exchangeRateRoutes from "./routes/exchangeRate";
import userRoutes from "./routes/user";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/exchange-rate", exchangeRateRoutes);
app.use("/users", userRoutes);

app.use(apiErrorHandler);

export default app;
