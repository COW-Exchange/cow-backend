import express, { Request, Response } from "express";
import mongoose from "mongoose";
import exchangeRateRoutes from "./routes/exchangeRate";
import userRoutes from "./routes/userRoutes";
import jwtAuth from "./middleware/jwtAuth";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.use(express.json());
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err: any) => console.log(err.message));

app.use(cors());
app.use(jwtAuth);

app.use("/exchange-rate", exchangeRateRoutes);
app.use("/users", userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
