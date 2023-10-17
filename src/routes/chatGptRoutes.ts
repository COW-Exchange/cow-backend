import express, { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

router.post("/complete", async (req: Request, res: Response) => {
  const { prompt, model = "gpt-3.5-turbo" } = req.body;

  if (!prompt) {
    return res.status(400).send({ error: "Prompt is required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model,
    });

    return res.send(completion.choices);
  } catch (err) {
    console.error("OpenAI error:", err);
    const errorMessage = (err as Error).message;
    return res
      .status(500)
      .send({ error: "Failed to get a completion.", details: errorMessage });
  }
});

export default router;
