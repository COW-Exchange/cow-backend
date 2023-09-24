import request from "supertest";
import express from "express";
import exchangeRateRoutes from "../exchangeRate";

const app = express();
app.use("/exchange-rate", exchangeRateRoutes);

describe("Exchange Rate Routes", () => {
  it("should fetch the mock exchange rate for USD to EUR", async () => {
    const response = await request(app).get("/exchange-rate/USD/EUR");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ from: "USD", to: "EUR", rate: 0.85 });
  });

});
