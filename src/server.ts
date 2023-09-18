import express, { Request, Response } from "express";
import mongoose from "mongoose";
import exchangeRateRoutes from "./routes/exchangeRate";
import userRoutes from "./routes/userRoutes";
import jwtAuth from "./middleware/jwtAuth"; 

const app = express();

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017")
  .then(() => console.log("MongoDB connected"))
  .catch((err: any) => console.log(err.message));


app.use(jwtAuth);


app.use("/exchange-rate", exchangeRateRoutes);
app.use("/users", userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
