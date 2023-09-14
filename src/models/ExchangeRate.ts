import mongoose, { Document, Schema } from "mongoose";

interface IExchangeRate extends Document {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date?: Date;
}

const ExchangeRateSchema: Schema = new Schema({
  fromCurrency: {
    type: String,
    required: true,
  },
  toCurrency: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IExchangeRate>(
  "ExchangeRate",
  ExchangeRateSchema
);
