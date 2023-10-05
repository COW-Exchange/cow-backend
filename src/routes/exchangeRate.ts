import { Router } from "express";
import * as exchangeRateController from "../controllers/exchangeRateController";
import jwtAuth from "../middleware/jwtAuth";

const router = Router();

router.get("/", exchangeRateController.getIndex);

router.get(
  "/:fromCurrency/:toCurrency/:fromTime/:toTime",
  exchangeRateController.getRate
);

export default router;
