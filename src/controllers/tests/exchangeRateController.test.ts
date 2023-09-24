import { getIndex, getRate } from "../exchangeRateController";
import { Request, Response } from "express";

describe("exchangeRateController", () => {
  describe("getIndex", () => {
    it("should return a welcome message", () => {
      const mockRequest = {} as Request;
      const mockResponse = {
        send: jest.fn(),
      } as unknown as Response;

      getIndex(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith("Currency Exchange API");
    });
  });

});
