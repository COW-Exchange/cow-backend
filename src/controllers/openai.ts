import { Request, Response, NextFunction } from "express";
import openai from "../services/openaiService";

export const getAiText = async (req: Request, res: Response) => {
  const prompt = req.body;
  const model = "gpt-3.5-turbo";

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
};
