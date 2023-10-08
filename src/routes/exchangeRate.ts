import { Router } from "express";
import * as exchangeRateController from "../controllers/exchangeRate";

const router = Router();


router.get("/", exchangeRateController.getIndex);

router.get("/:fromCurrency/:toCurrency", exchangeRateController.getRate);

export default router;
