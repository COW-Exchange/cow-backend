import "dotenv/config";
import mongoose from "mongoose";

import app from "./app";

const port = 5000;

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((error: Error) => {
    console.log(
      "MongoDB connection error. Please make sure the database is running."
    );
    process.exit(1);
  });
