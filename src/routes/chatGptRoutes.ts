import express, { Request, Response } from "express";
import * as openaiControllers from "../controllers/openai";

const router = express.Router();

router.get("/", openaiControllers.getAiText);

export default router;
