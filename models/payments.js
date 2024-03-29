const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  email: String,
  amount: Number,
  authorization_url: String,
  access_code: String,
  reference: String,
  status: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema, "payments");

module.exports = Payment