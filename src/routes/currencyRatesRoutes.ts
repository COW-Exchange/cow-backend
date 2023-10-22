import express, { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

const router = express.Router();

router.get("/currency-rates/:year", async (req: Request, res: Response) => {
  const { year } = req.params;

  try {
    if (year && /^[0-9]{4}$/.test(year)) {
      // Simple regex check to ensure a valid 4-digit year
      const data = await fs.readFile(
        path.join(__dirname, `../rates/${year}.json`), // <-- Updated this line
        "utf-8"
      );
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } else {
      res.status(400).send("Invalid year provided.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching currency rates");
  }
});

export default router;
