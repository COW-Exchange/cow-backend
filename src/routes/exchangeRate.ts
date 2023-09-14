import { Router } from "express";
import * as exchangeRateController from "../controllers/exchangeRateController";

const router = Router();

router.get("/", exchangeRateController.getIndex);

router.get("/:fromCurrency/:toCurrency", exchangeRateController.getRate);

export default router;
