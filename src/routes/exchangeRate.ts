import { Router } from "express";

import * as exchangeRateController from "../controllers/exchangeRate";

const router = Router();

router.get("/", exchangeRateController.getIndex);

router.get("/:fromTime/:toTime", exchangeRateController.getRates);

export default router;
